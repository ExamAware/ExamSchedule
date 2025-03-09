var errorSystem = {
    show: function(message, type = 'error') {
        try {
            var container = document.querySelector(type === 'info' ? '.info-container' : '.error-container');
            var content = document.getElementById(type === 'info' ? 'infoMessage' : 'errorMessage');
            content.textContent = message;
            container.style.display = 'flex';
            setTimeout(() => this.hide(type), 5000);
        } catch(e) {
            console.error('错误提示系统异常:', e);
        }
    },
    hide: function(type = 'error') {
        var container = document.querySelector(type === 'info' ? '.info-container' : '.error-container');
        if (container) container.style.display = 'none';
    }
};
