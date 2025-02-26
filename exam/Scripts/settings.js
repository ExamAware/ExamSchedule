document.addEventListener("DOMContentLoaded", () => {
    const settingsBtn = document.getElementById("settings-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const offsetTimeInput = document.getElementById("offset-time");
    const roomInput = document.getElementById("room-input");
    const roomElem = document.getElementById("room");
    const zoomInput = document.getElementById("zoom-input");

    let offsetTime = getCookie("offsetTime") || 0;
    let room = getCookie("room") || "";
    let zoomLevel = getCookie("zoomLevel") || 1;

    offsetTime = parseInt(offsetTime);
    roomElem.textContent = room;

    settingsBtn.addEventListener("click", () => {
        offsetTimeInput.value = offsetTime;
        roomInput.value = room;
        zoomInput.value = zoomLevel;
        settingsModal.style.display = "block";
    });

    closeSettingsBtn.addEventListener("click", () => {
        settingsModal.style.display = "none";
    });

    saveSettingsBtn.addEventListener("click", () => {
        offsetTime = parseInt(offsetTimeInput.value);
        room = roomInput.value;
        zoomLevel = parseFloat(zoomInput.value);
        setCookie("offsetTime", offsetTime, 365);
        setCookie("room", room, 365);
        setCookie("zoomLevel", zoomLevel, 365);
        roomElem.textContent = room;
        document.body.style.zoom = zoomLevel;
        settingsModal.style.display = "none";
    });

    document.body.style.zoom = zoomLevel;
});
