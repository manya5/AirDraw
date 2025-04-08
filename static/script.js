document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();

    const chevronToggle = document.querySelector("#chevron-toggle");
    const dropdownMenu = document.querySelector("#profile-dropdown");
    const themeSwitch = document.querySelector("#theme-switch");
    const fullscreenToggle = document.querySelector("[data-lucide='maximize']"); // Fullscreen icon
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
let drawColor = 'black';
let drawLineWidth = 5;
let lastX = 0;
let lastY = 0;

window.selectColor = function(color) {
    drawColor = color;
    drawLineWidth = 5;
};

window.selectEraser = function() {
    drawColor = 'white'; // Assuming canvas background is white
    drawLineWidth = 20;
};
    const ctx = canvas ? canvas.getContext('2d') : null;
    const clearButton = document.getElementById('clear-canvas');
    const saveButton = document.getElementById('save-canvas');
    const globeIcon = document.getElementById("globe-toggle");
    const dropdownMenus = document.getElementById("globe-dropdown");

    // Debugging Logs
    console.log("Chevron Toggle Found:", chevronToggle !== null);
    console.log("Dropdown Menu Found:", dropdownMenu !== null);
    console.log("Script loaded!");

    // Access the webcam
    if (video && canvas && ctx) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    processFrame();
                };
            })
            .catch(err => console.error('Error accessing the webcam:', err));
    }

    // Toggle profile dropdown
    function toggleDropdown(event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle("hidden");
    }

    function closeDropdown(event) {
        if (!chevronToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add("hidden");
        }
    }

    function toggleTheme() {
        if (themeSwitch.checked) {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.() || 
            document.documentElement.mozRequestFullScreen?.() || 
            document.documentElement.webkitRequestFullscreen?.() || 
            document.documentElement.msRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || 
            document.mozCancelFullScreen?.() || 
            document.webkitExitFullscreen?.() || 
            document.msExitFullscreen?.();
        }
    }

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeSwitch.checked = true;
    } else {
        document.body.classList.add("light-mode");
        themeSwitch.checked = false;
    }

    if (chevronToggle && dropdownMenu) {
        chevronToggle.addEventListener("click", toggleDropdown);
        document.addEventListener("click", closeDropdown);
    }

    if (themeSwitch) {
        themeSwitch.addEventListener("change", toggleTheme);
    }

    if (fullscreenToggle) {
        fullscreenToggle.addEventListener("click", toggleFullscreen);
    }

    function processFrame() {
        ctx.drawImage(video, 0, 0, 640, 480);
        const frame = ctx.getImageData(0, 0, 640, 480);

        fetch('/process_frame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame: Array.from(frame.data) })
        })
        .then(response => response.json())
        .then(data => {
            const img = new Image();
            img.src = 'data:image/png;base64,' + data.canvas;
            img.onload = () => ctx.drawImage(img, 0, 0);
        });

        requestAnimationFrame(processFrame);
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            fetch('/voice_command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'clear' })
            })
            .then(response => response.json())
            .then(data => console.log(data.status));
        });
    }

    if (saveButton) {
        saveButton.addEventListener('click', () => {
            fetch('/voice_command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'save' })
            })
            .then(response => response.json())
            .then(data => console.log(data.status));
        });
    }
    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    
    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });
    
    const camera = new Camera(video, {
        onFrame: async () => {
            await hands.send({ image: video });
        },
        width: 640,
        height: 480
    });
    
    camera.start();
    
    hands.onResults(results => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0]; // Use first hand
    
            // Index finger tip
            const indexTip = landmarks[8];
    
            const x = indexTip.x * canvas.width;
            const y = indexTip.y * canvas.height;
    
            if (!drawing) {
                drawing = true;
                lastX = x;
                lastY = y;
            }
    
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = drawLineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
    
            lastX = x;
            lastY = y;
    
            // Optional: draw hand landmarks on top
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
            }
        } else {
            drawing = false; // stop drawing if no hand
        }
    });
    if (video && canvas && ctx) {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        const camera = new Camera(video, {
            onFrame: async () => {
                await hands.send({ image: video });
            },
            width: 640,
            height: 480
        });

        camera.start();

        hands.onResults(results => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                    drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
                }
            }
        });
    }

    if (globeIcon && dropdownMenus) {
        globeIcon.addEventListener("click", function (event) {
            event.stopPropagation();
            dropdownMenus.classList.toggle("active");
        });

        document.addEventListener("click", function (event) {
            if (!globeIcon.contains(event.target) && !dropdownMenus.contains(event.target)) {
                dropdownMenus.classList.remove("active");
            }
        });
    }
    fetch('/voice_command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'clear' })
    })
    .then(response => response.json())
    .then(data => console.log(data.status))
    .catch(error => console.error('Error:', error));
});
