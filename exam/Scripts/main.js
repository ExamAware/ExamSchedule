document.addEventListener("DOMContentLoaded", () => {
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
});
