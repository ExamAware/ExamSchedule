var errorSystem = {
    show: function(message) {
        try {
            var container = document.querySelector('.error-container');
            var content = document.getElementById('errorMessage');
            content.textContent = message;
            container.style.display = 'flex';
            setTimeout(this.hide, 5000);
        } catch(e) {
            console.error('错误提示系统异常:', e);
        }
    },
    hide: function() {
        var container = document.querySelector('.error-container');
        if (container) container.style.display = 'none';
    }
};
