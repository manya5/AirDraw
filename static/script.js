document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();

    const chevronToggle = document.querySelector("#chevron-toggle");
    const dropdownMenu = document.querySelector("#profile-dropdown");
    const themeSwitch = document.querySelector("#theme-switch");
    const fullscreenToggle = document.querySelector("[data-lucide='maximize']"); // Fullscreen icon
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const globeIcon = document.getElementById("globe-toggle");
    const dropdownMenus = document.getElementById("globe-dropdown");

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

    const clearButton = document.getElementById('clear-canvas');
    const saveButton = document.getElementById('save-canvas');

    // Debugging Logs (Check if elements exist)
    console.log("Chevron Toggle Found:", chevronToggle !== null);
    console.log("Dropdown Menu Found:", dropdownMenu !== null);
    console.log("Script loaded!");
    // Access the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                processFrame();
            };
        })
        .catch(err => {
            console.error('Error accessing the webcam:', err);
        }); // <-- This closing brace was missing

    // Function to toggle profile dropdown
    function toggleDropdown(event) {
        event.stopPropagation();
        console.log("Dropdown Toggle Clicked");
        dropdownMenu.classList.toggle("hidden");
    }

    // Function to close dropdown when clicking outside
    function closeDropdown(event) {
        if (!chevronToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add("hidden");
        }
    }

    // Function to toggle themes
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

    // Function to toggle fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                document.documentElement.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
        }
    }

    // Load saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeSwitch.checked = true;
    } else {
        document.body.classList.add("light-mode");
        themeSwitch.checked = false;
    }

    // Add event listeners
    if (dropdownMenu && chevronToggle) {
        chevronToggle.addEventListener("click", toggleDropdown);
        document.addEventListener("click", closeDropdown);
    } else {
        console.error("Dropdown menu or chevron toggle button not found!");
    }

    if (themeSwitch) {
        themeSwitch.addEventListener("change", toggleTheme);
    } else {
        console.error("Theme switch not found!");
    }

    if (fullscreenToggle) {
        fullscreenToggle.addEventListener("click", toggleFullscreen);
    } else {
        console.error("Fullscreen toggle button not found!");
    }

    // Function to process frames
    function processFrame() {
        console.log("Processing frame...");
        ctx.drawImage(video, 0, 0, 640, 480);
        const frame = ctx.getImageData(0, 0, 640, 480);

        // Send frame to Flask back-end
        fetch('/process_frame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame: Array.from(frame.data) }) // Convert frame data to array
        })
            .then(response => response.json())
            .then(data => {
                // Draw the processed canvas
                const img = new Image();
                img.src = 'data:image/png;base64,' + data.canvas;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
            });
        // Repeat the process
        requestAnimationFrame(processFrame);
    }

    // Clear Canvas
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            fetch('/voice_command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'clear' })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.status);
                });
        });
    } else {
        console.error("Clear button not found!");
    }

    // Save Canvas
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            fetch('/voice_command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'save' })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.status);
                });
        });
    } else {
        console.error("Save button not found!");
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
        
//Spaces dropdown menu
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

    });
    
    fetch('/voice_command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'clear' }) // Example command
    })
    .then(response => response.json())
    .then(data => console.log(data.status))
    .catch(error => console.error('Error:', error));    
});