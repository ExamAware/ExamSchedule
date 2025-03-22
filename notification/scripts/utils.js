function setCookie(name, value, days) {
    try {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Strict";
    } catch (e) {
        console.error('设置 Cookie 失败:', e);
    }
}

function getCookie(name) {
    try {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
    } catch (e) {
        console.error('读取 Cookie 失败:', e);
    }
    return null;
}

function formatTimeWithoutSeconds(time) {
    return time.slice(0, -3);
}

const errorSystem = {
    show: function(message) {
        try {
            const container = document.querySelector('.error-container');
            const content = document.getElementById('errorMessage');
            content.textContent = message;
            container.style.display = 'flex';
            setTimeout(this.hide, 5000);
        } catch(e) {
            console.error('错误提示系统异常:', e);
        }
    },
    hide: function() {
        const container = document.querySelector('.error-container');
        if (container) container.style.display = 'none';
    }
};
