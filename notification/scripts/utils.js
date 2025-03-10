function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
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
