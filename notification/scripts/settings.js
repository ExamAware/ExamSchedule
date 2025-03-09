function saveSettingsToCookies() {
    var table = document.getElementById('reminderTable');
    var reminders = [];
    for (var i = 1; i < table.rows.length - 1; i++) {
        var row = table.rows[i];
        var condition = row.cells[0].querySelector('select').value;
        var timeInput = row.cells[1].querySelector('input');
        var audioSelect = row.cells[2].querySelector('select');
        if (timeInput && audioSelect) {
            var time = timeInput.value || 0; // 确保时间值不为空
            var audio = audioSelect.value || 'classStart'; // 确保音频选择不为空
            reminders.push({ condition: condition, time: time, audio: audio });
        }
    }
    document.cookie = "reminders=" + JSON.stringify(reminders);
}

function loadSettingsFromCookies() {
    var cookies = document.cookie.split(';');
    cookies.forEach(function(cookie) {
        var parts = cookie.split('=');
        var name = parts[0].trim();
        var value = parts[1].trim();
        if (name === 'reminders') {
            var reminders = JSON.parse(value);
            var table = document.getElementById('reminderTable');
            reminders.forEach(function(reminder) {
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
                        <select>
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
        }
    });
}
