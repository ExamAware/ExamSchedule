// 提醒设置相关函数，适配exam页面

function addReminder() {
    var table = document.getElementById('reminderTable');
    var row = table.insertRow(table.rows.length - 1);
    row.innerHTML = `
        <td>
            <select class="reminder-select">
                <option value="beforeStart">当距离考试开始时间还有</option>
                <option value="beforeEnd">当距离考试结束时间还有</option>
                <option value="afterEnd">当考试结束后</option>
                <option value="start">当考试开始时</option>
                <option value="end">当考试结束时</option>
            </select>
        </td>
        <td><input type="number" class="reminder-time-input" placeholder="分钟" disabled></td>
        <td>
            <select name="audioSelect" class="reminder-select"></select>
        </td>
        <td><button class="reminder-btn" onclick="removeReminder(this)">移除提醒</button></td>
    `;
    row.cells[0].querySelector('select').addEventListener('change', function() {
        row.cells[1].querySelector('input').disabled = this.value === 'start' || this.value === 'end';
        row.cells[1].querySelector('input').placeholder = this.value === 'start' || this.value === 'end' ? '-' : '分钟';
    });
    audioController.populateAudioSelect();
}

function removeReminder(button) {
    var row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function saveConfig() {
    try {
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
                    audio: audioSelect.value
                });
            }
        }
        if (reminders.length === 0) {
            errorSystem.show('请添加至少一个提醒策略');
            return;
        }
        // 保存到 Cookie 并更新提醒队列
        setCookie("examReminders", encodeURIComponent(JSON.stringify(reminders)), 365);
        loadRemindersToQueue(reminders);
        errorSystem.show('提醒设置已保存');
    } catch (e) {
        errorSystem.show('保存设置失败: ' + e.message);
    }
}

function loadRemindersToQueue(reminders) {
    // 获取当前或下一个考试
    const examConfig = window.examConfigData;
    if (!examConfig || !Array.isArray(examConfig.examInfos)) return;
    const now = Date.now();
    let targetExam = null;
    for (const exam of examConfig.examInfos) {
        const start = new Date(exam.start).getTime();
        const end = new Date(exam.end).getTime();
        if (now < end) {
            targetExam = exam;
            break;
        }
    }
    if (!targetExam) return;
    reminders.forEach(function(reminder) {
        let reminderTime;
        switch (reminder.condition) {
            case 'beforeStart':
                reminderTime = new Date(targetExam.start).getTime() - reminder.time * 60000;
                break;
            case 'beforeEnd':
                reminderTime = new Date(targetExam.end).getTime() - reminder.time * 60000;
                break;
            case 'afterEnd':
                reminderTime = new Date(targetExam.end).getTime() + reminder.time * 60000;
                break;
            case 'start':
                reminderTime = new Date(targetExam.start).getTime();
                break;
            case 'end':
                reminderTime = new Date(targetExam.end).getTime();
                break;
        }
        if (reminderTime > now) {
            reminderQueue.addReminder({ time: reminderTime, condition: reminder.condition, audio: reminder.audio });
        }
    });
}

// 页面加载时自动填充提醒表格
document.addEventListener("DOMContentLoaded", () => {
    // 加载提醒设置
    const reminderCookie = getCookie("examReminders");
    if (reminderCookie) {
        const reminders = JSON.parse(decodeURIComponent(reminderCookie));
        if (Array.isArray(reminders)) {
            var table = document.getElementById('reminderTable');
            while (table.rows.length > 2) {
                table.deleteRow(1);
            }
            fetch('audio_files.json')
                .then(response => response.json())
                .then(audioFiles => {
                    const validAudioTypes = Object.keys(audioFiles);
                    const defaultAudio = validAudioTypes[0];
                    reminders.forEach(function(reminder) {
                        if (!validAudioTypes.includes(reminder.audio)) {
                            reminder.audio = defaultAudio;
                        }
                        var row = table.insertRow(table.rows.length - 1);
                        let audioOptions = validAudioTypes
                            .map(audio => `<option value="${audio}" ${reminder.audio === audio ? 'selected' : ''}>${audio}</option>`)
                            .join('');
                        row.innerHTML = `
                            <td>
                                <select class="reminder-select">
                                    <option value="beforeStart" ${reminder.condition === 'beforeStart' ? 'selected' : ''}>当距离考试开始时间还有</option>
                                    <option value="beforeEnd" ${reminder.condition === 'beforeEnd' ? 'selected' : ''}>当距离考试结束时间还有</option>
                                    <option value="afterEnd" ${reminder.condition === 'afterEnd' ? 'selected' : ''}>当考试结束后</option>
                                    <option value="start" ${reminder.condition === 'start' ? 'selected' : ''}>当考试开始时</option>
                                    <option value="end" ${reminder.condition === 'end' ? 'selected' : ''}>当考试结束时</option>
                                </select>
                            </td>
                            <td><input type="number" class="reminder-time-input" value="${reminder.time}" placeholder="${reminder.condition === 'start' || reminder.condition === 'end' ? '-' : '分钟'}" ${reminder.condition === 'start' || reminder.condition === 'end' ? 'disabled' : ''}></td>
                            <td>
                                <select name="audioSelect" class="reminder-select">
                                    ${audioOptions}
                                </select>
                            </td>
                            <td><button class="reminder-btn" onclick="removeReminder(this)">移除提醒</button></td>
                        `;
                        row.cells[0].querySelector('select').addEventListener('change', function() {
                            row.cells[1].querySelector('input').disabled = this.value === 'start' || this.value === 'end';
                            row.cells[1].querySelector('input').placeholder = this.value === 'start' || this.value === 'end' ? '-' : '分钟';
                        });
                    });
                    loadRemindersToQueue(reminders);
                });
        }
    }
});
