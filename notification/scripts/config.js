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
            // 清空现有提醒表格
            var table = document.getElementById('reminderTable');
            while (table.rows.length > 2) { // 保留表头和添加按钮行
                table.deleteRow(1);
            }
            // 添加新的提醒设置
            config.reminders.forEach(function(reminder) {
                var row = table.insertRow(table.rows.length - 1);
                row.innerHTML = `
                    <td>
                        <select>
                            <option value="beforeStart" ${reminder.condition === 'beforeStart' ? 'selected' : ''}>当距离考试开始时间还有</option>
                            <option value="beforeEnd" ${reminder.condition === 'beforeEnd' ? 'selected' : ''}>当距离考试结束时间还有</option>
                            <option value="afterEnd" ${reminder.condition === 'afterEnd' ? 'selected' : ''}>当考试结束后</option>
                            <option value="start" ${reminder.condition === 'start' ? 'selected' : ''}>当考试开始时</option>
                            <option value="end" ${reminder.condition === 'end' ? 'selected' : ''}>当考试结束时</option>
                        </select>
                    </td>
                    <td><input type="number" value="${reminder.time}" placeholder="${reminder.condition === 'start' || reminder.condition === 'end' ? '-' : '分钟'}" ${reminder.condition === 'start' || reminder.condition === 'end' ? 'disabled' : ''}></td>
                    <td>
                        <select name="audioSelect">
                            <option value="classStart" ${reminder.audio === 'classStart' ? 'selected' : ''}>考试开始铃声</option>
                            <option value="classEnd" ${reminder.audio === 'classEnd' ? 'selected' : ''}>考试结束铃声</option>
                        </select>
                    </td>
                    <td><button onclick="removeReminder(this)">删除</button></td>
                `;
                row.cells[0].querySelector('select').addEventListener('change', function() {
                    row.cells[1].querySelector('input').disabled = this.value === 'start' || this.value === 'end';
                    row.cells[1].querySelector('input').placeholder = this.value === 'start' || this.value === 'end' ? '-' : '分钟';
                });
            });
            // 更新提醒队列
            loadRemindersToQueue(config.reminders);
            // 保存到 localStorage
            saveSettingsToCookies();
        }
        errorSystem.show('配置导入成功', 'info');
    } catch (err) {
        errorSystem.show('应用配置失败: ' + err.message, 'error');
    }
}

function exportConfig() {
    var table = document.getElementById('reminderTable');
    var reminders = [];
    for (var i = 1; i < table.rows.length - 1; i++) {
        var row = table.rows[i];
        var condition = row.cells[0].querySelector('select').value;
        var timeInput = row.cells[1].querySelector('input');
        var audioSelect = row.cells[2].querySelector('select');
        if (timeInput && audioSelect) {
            reminders.push({
                condition: condition,
                time: timeInput.value || 0,
                audio: audioSelect.value || 'classStart'
            });
        }
    }
    
    var config = {
        examInfos: courseSchedule,
        examName: document.title,
        message: document.getElementById('statusLabel').textContent,
        room: document.getElementById('timeDescription').textContent.replace('考场: ', ''),
        reminders: reminders
    };

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "exam_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
