document.getElementById('importJson').addEventListener('change', function(event) {
    var files = event.target.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var config = JSON.parse(e.target.result);
                    applyConfig(config);
                } catch (err) {
                    errorSystem.show('导入配置失败: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        });
    }
});

function applyConfig(config) {
    try {
        if (config.examInfos) {
            courseSchedule = config.examInfos.map(function(exam) {
                return {
                    name: exam.name,
                    start: exam.start,
                    end: exam.end
                };
            });
            updateScheduleTable();
        }
        if (config.examName) {
            document.title = config.examName;
        }
        if (config.message) {
            document.getElementById('statusLabel').textContent = config.message;
        }
        if (config.room) {
            document.getElementById('timeDescription').textContent = '考场: ' + config.room;
        }
        if (config.reminders) {
            localStorage.setItem('reminders', JSON.stringify(config.reminders));
        }
    } catch (err) {
        errorSystem.show('应用配置失败: ' + err.message, 'error');
    }
}

function exportConfig() {
    var config = {
        examInfos: courseSchedule,
        examName: document.title,
        message: document.getElementById('statusLabel').textContent,
        room: document.getElementById('timeDescription').textContent.replace('考场: ', ''),
        reminders: JSON.parse(localStorage.getItem('reminders') || '[]')
    };
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "exam_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
