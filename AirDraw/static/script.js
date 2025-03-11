document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();

    const chevronToggle = document.querySelector("#chevron-toggle");
    const dropdownMenu = document.querySelector("#profile-dropdown");
    const themeSwitch = document.querySelector("#theme-switch");
    const fullscreenToggle = document.querySelector("[data-lucide='maximize']"); // Fullscreen icon

    // Debugging Logs (Check if elements exist)
    console.log("Chevron Toggle Found:", chevronToggle !== null);
    console.log("Dropdown Menu Found:", dropdownMenu !== null);

    // Function to toggle profile dropdown
    function toggleDropdown(event) {
        event.stopPropagation();
        console.log("Dropdown Toggle Clicked"); // Debugging
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
    if (chevronToggle) {
        chevronToggle.addEventListener("click", toggleDropdown);
    } else {
        console.error("Chevron toggle button not found!");
    }

    if (dropdownMenu) {
        document.addEventListener("click", closeDropdown);
    } else {
        console.error("Dropdown menu not found!");
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
});