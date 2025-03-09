var audioController = (function() {
    var audioPool = [];
    var maxPoolSize = 3;
    var soundFiles = {
        classStart: 'class_start.mp3',
        classEnd: 'class_end.mp3'
    };

    function init() {
        try {
            Object.keys(soundFiles).forEach(function(type) {
                for (var i = 0; i < 2; i++) {
                    createAudio(type);
                }
            });
        } catch(e) {
            errorSystem.show('音频初始化失败: ' + e.message);
        }
    }

    function createAudio(type) {
        var audio = document.createElement('audio');
        audio.style.display = 'none';
        audio.preload = 'auto';
        audio.src = soundFiles[type];
        var retryCount = 0;
        function loadAudio() {
            try {
                audio.load();
            } catch(e) {
                if (retryCount++ < 3) {
                    setTimeout(loadAudio, 1000);
                }
            }
        }
        audio.addEventListener('error', function() {
            if (retryCount++ < 3) {
                setTimeout(loadAudio, 1000);
            }
        });
        document.body.appendChild(audio);
        loadAudio();
        audioPool.push(audio);
        return audio;
    }

    function play(type) {
        try {
            var audio = audioPool.find(function(a) { return a.paused; });
            if (!audio) {
                if (audioPool.length < maxPoolSize) {
                    audio = createAudio(type);
                } else {
                    return errorSystem.show('系统繁忙，请稍后再试');
                }
            }
            audio.src = soundFiles[type];
            try {
                audio.play();
            } catch(e) {
                errorSystem.show('播放失败: ' + e.message);
            }
        } catch(e) {
            errorSystem.show('音频系统错误: ' + e.message);
        }
    }

    function getAudioSrc(type) {
        return soundFiles[type];
    }

    return {
        init: init,
        play: play,
        getAudioSrc: getAudioSrc
    };
})();

audioController.init();
