var reminderQueue = (function() {
    var queue = [];
    var audioCache = {};

    function addReminder(reminder) {
        queue.push(reminder);
        queue.sort(function(a, b) {
            return a.time - b.time;
        });
        preloadAudio(reminder.audio);
    }

    function processQueue() {
        var now = Date.now();
        while (queue.length > 0 && queue[0].time <= now) {
            var reminder = queue.shift();
            executeReminder(reminder);
        }
        setTimeout(processQueue, 1000);
    }

    function executeReminder(reminder) {
        if (audioCache[reminder.audio]) {
            audioCache[reminder.audio].play();
        } else if (audioController.getAudioSrc(reminder.audio)) {
            audioController.play(reminder.audio);
        } else {
            errorSystem.show('音频文件不存在: ' + reminder.audio, 'error');
        }
    }

    function preloadAudio(audioType) {
        if (!audioCache[audioType] && audioController.getAudioSrc(audioType)) {
            var audio = new Audio(audioController.getAudioSrc(audioType));
            audioCache[audioType] = audio;
        }
    }

    return {
        addReminder: addReminder,
        processQueue: processQueue
    };
})();

reminderQueue.processQueue();
