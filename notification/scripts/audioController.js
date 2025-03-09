var audioController = (function() {
    var audioPool = [];
    var maxPoolSize = 3;
    var soundFiles = {};
    var audioSelectPopulated = false;

    function init() {
        fetch('audio_files.json')
            .then(response => response.json())
            .then(data => {
                soundFiles = data;
                Object.keys(soundFiles).forEach(function(type) {
                    for (var i = 0; i < 2; i++) {
                        createAudio(type);
                    }
                });
                if (!audioSelectPopulated) {
                    populateAudioSelect();
                    audioSelectPopulated = true;
                }
                removeInvalidAudioOptions();
            })
            .catch(e => errorSystem.show('音频文件加载失败: ' + e.message, 'error'));
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
                    return errorSystem.show('系统繁忙，请稍后再试', 'error');
                }
            }
            audio.src = soundFiles[type];
            try {
                audio.play();
            } catch(e) {
                errorSystem.show('播放失败: ' + e.message, 'error');
            }
        } catch(e) {
            errorSystem.show('音频系统错误: ' + e.message, 'error');
        }
    }

    function getAudioSrc(type) {
        return soundFiles[type];
    }

    function populateAudioSelect() {
        var selects = document.querySelectorAll('select[name="audioSelect"]');
        selects.forEach(select => {
            Object.keys(soundFiles).forEach(function(type) {
                var option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                select.appendChild(option);
            });
        });
    }

    function removeInvalidAudioOptions() {
        var selects = document.querySelectorAll('select[name="audioSelect"]');
        selects.forEach(select => {
            Array.from(select.options).forEach(option => {
                if (!soundFiles[option.value]) {
                    option.remove();
                }
            });
        });
    }

    return {
        init: init,
        play: play,
        getAudioSrc: getAudioSrc,
        populateAudioSelect: populateAudioSelect,
        removeInvalidAudioOptions: removeInvalidAudioOptions
    };
})();

audioController.init();
