document.addEventListener("DOMContentLoaded", () => {
    const settingsBtn = document.getElementById("settings-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const offsetTimeInput = document.getElementById("offset-time");
    const roomInput = document.getElementById("room-input");
    const roomElem = document.getElementById("room");
    const zoomInput = document.getElementById("zoom-input");
    const themeToggle = document.getElementById("theme-toggle");
    const themeLink = document.getElementById("theme-link");

    let offsetTime = getCookie("offsetTime") || 0;
    let room = getCookie("room") || "";
    let zoomLevel = getCookie("zoomLevel") || 1;
    let theme = getCookie("theme") || "dark";

    offsetTime = parseInt(offsetTime);
    roomElem.textContent = room;

    if (theme === "light") {
        themeLink.href = "Styles/light.css";
        themeToggle.checked = true;
    } else {
        themeLink.href = "Styles/dark.css";
        themeToggle.checked = false;
    }

    settingsBtn.addEventListener("click", () => {
        try {
            offsetTimeInput.value = offsetTime;
            roomInput.value = room;
            zoomInput.value = zoomLevel;
            settingsModal.style.display = "block";
        } catch (e) {
            errorSystem.show('打开设置失败: ' + e.message);
        }
    });

    closeSettingsBtn.addEventListener("click", () => {
        try {
            settingsModal.classList.add("fade-out");
            setTimeout(() => {
                settingsModal.style.display = "none";
                settingsModal.classList.remove("fade-out");
            }, 300);
        } catch (e) {
            errorSystem.show('关闭设置失败: ' + e.message);
        }
    });

    saveSettingsBtn.addEventListener("click", () => {
        try {
            offsetTime = parseInt(offsetTimeInput.value);
            room = roomInput.value;
            zoomLevel = parseFloat(zoomInput.value);
            theme = themeToggle.checked ? "light" : "dark";
            setCookie("offsetTime", offsetTime, 365);
            setCookie("room", room, 365);
            setCookie("zoomLevel", zoomLevel, 365);
            setCookie("theme", theme, 365);
            roomElem.textContent = room;
            document.body.style.zoom = zoomLevel;
            themeLink.href = theme === "light" ? "Styles/light.css" : "Styles/dark.css";
            settingsModal.classList.add("fade-out");
            setTimeout(() => {
                settingsModal.style.display = "none";
                settingsModal.classList.remove("fade-out");
            }, 300);
            // 立即生效时间偏移
            location.reload();
        } catch (e) {
            errorSystem.show('保存设置失败: ' + e.message);
        }
    });

    themeToggle.addEventListener("change", () => {
        const theme = themeToggle.checked ? "light" : "dark";
        themeLink.href = theme === "light" ? "Styles/light.css" : "Styles/dark.css";
    });

    try {
        document.body.style.zoom = zoomLevel;
    } catch (e) {
        errorSystem.show('初始化缩放失败: ' + e.message);
    }
});
