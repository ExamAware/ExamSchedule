// 全局状态变量
var isFullscreen = false, currentCourse = null, lastCourse = null, timer = null, lastUpdate = Date.now();

// 新增：安全更新循环函数
function safeUpdate() {
    try {
        var now = Date.now();
        updateCourseStatus();
        updateDisplay();
        var nextTick = Math.max(1000 - (Date.now() - now), 50);
        timer = setTimeout(safeUpdate, nextTick);
        lastUpdate = now;
    } catch (e) {
        errorSystem.show('更新循环错误: ' + e.message);
    }
}

// 修改：全屏切换函数
function toggleFullscreen() {
    try {
        isFullscreen = !isFullscreen;
        document.body.classList.toggle('fullscreen-mode', isFullscreen);
        if (isFullscreen) {
            document.querySelector('.settings-panel').style.display = 'none';
            document.querySelector('.schedule-table').style.display = 'none';
            document.querySelector('.container').style.width = '100%';
            document.querySelector('.container').style.height = '100%';
        } else {
            document.querySelector('.settings-panel').style.display = '';
            document.querySelector('.schedule-table').style.display = '';
            document.querySelector('.container').style.width = '';
            document.querySelector('.container').style.height = '';
        }
    } catch (e) {
        errorSystem.show('全屏切换失败: ' + e.message);
    }
}

function exitFullscreen() {
    try {
        isFullscreen = false;
        document.body.classList.remove('fullscreen-mode');
        document.querySelector('.settings-panel').style.display = '';
        document.querySelector('.schedule-table').style.display = '';
        document.querySelector('.container').style.width = '';
        document.querySelector('.container').style.height = '';
    } catch (e) {
        errorSystem.show('退出全屏失败: ' + e.message);
    }
}

function addReminder() {
    var table = document.getElementById('reminderTable');
    var row = table.insertRow(table.rows.length - 1);
    row.innerHTML = `
        <td>
            <select>
                <option value="beforeStart">当距离考试开始时间还有</option>
                <option value="beforeEnd">当距离考试结束时间还有</option>
                <option value="afterEnd">当考试结束后</option>
            </select>
        </td>
        <td><input type="number" placeholder="分钟"></td>
        <td>
            <select>
                <option value="classStart">上课铃声</option>
                <option value="classEnd">下课铃声</option>
            </select>
        </td>
        <td><button onclick="removeReminder(this)">删除</button></td>
    `;
}

function removeReminder(button) {
    var row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function saveReminders() {
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
    // 添加开始考试和结束考试的提醒
    var audioStart = document.getElementById('audioStart');
    var audioEnd = document.getElementById('audioEnd');
    if (audioStart && audioEnd) {
        reminders.push({ condition: 'start', time: 0, audio: audioStart.value || 'classStart' });
        reminders.push({ condition: 'end', time: 0, audio: audioEnd.value || 'classEnd' });
    }
    localStorage.setItem('reminders', JSON.stringify(reminders));
    errorSystem.show('提醒设置已保存');
}

// 修改：系统初始化函数
function init() {
    try {
        var table = document.getElementById('scheduleTable');
        courseSchedule.forEach(function(course) {
            var row = table.insertRow(-1);
            row.innerHTML = '<td>' + course.name + '</td>' +
                            '<td>' + formatDateTime(course.start) + ' - ' + formatDateTime(course.end) + '</td>' +
                            '<td></td>';
        });
        // 初始化设置复选框
        document.getElementById('classBell').checked = localStorage.classBell === 'true';
        document.getElementById('breakBell').checked = localStorage.breakBell === 'true';
        document.getElementById('classBell').onchange = function () {
            localStorage.classBell = this.checked;
            saveSettingsToCookies();
        };
        document.getElementById('breakBell').onchange = function () {
            localStorage.breakBell = this.checked;
            saveSettingsToCookies();
        };
        // 加载提醒设置
        var reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        var table = document.getElementById('reminderTable');
        if (reminders.length === 0) {
            // 自动新建默认提醒设置
            addReminder();
        } else {
            reminders.forEach(function(reminder) {
                if (reminder.condition === 'start' || reminder.condition === 'end') {
                    var audioElement = document.getElementById('audio' + reminder.condition.charAt(0).toUpperCase() + reminder.condition.slice(1));
                    if (audioElement) {
                        audioElement.value = reminder.audio;
                    }
                } else {
                    var row = table.insertRow(table.rows.length - 1);
                    row.innerHTML = `
                        <td>
                            <select>
                                <option value="beforeStart" ${reminder.condition === 'beforeStart' ? 'selected' : ''}>当距离考试开始时间还有</option>
                                <option value="beforeEnd" ${reminder.condition === 'beforeEnd' ? 'selected' : ''}>当距离考试结束时间还有</option>
                                <option value="afterEnd" ${reminder.condition === 'afterEnd' ? 'selected' : ''}>当考试结束后</option>
                            </select>
                        </td>
                        <td><input type="number" value="${reminder.time}" placeholder="分钟"></td>
                        <td>
                            <select>
                                <option value="classStart" ${reminder.audio === 'classStart' ? 'selected' : ''}>上课铃声</option>
                                <option value="classEnd" ${reminder.audio === 'classEnd' ? 'selected' : ''}>下课铃声</option>
                            </select>
                        </td>
                        <td><button onclick="removeReminder(this)">删除</button></td>
                    `;
                }
            });
        }
        // 启动安全更新循环
        safeUpdate();
        // 移除或修改音频权限激活代码（用原音频系统无需特殊激活）
        document.body.onclick = null;
        // 加载设置从Cookies
        loadSettingsFromCookies();
    } catch (e) {
        errorSystem.show('系统初始化失败: ' + e.message);
    }
}
window.onbeforeunload = function () {
    if (timer) clearTimeout(timer);
};
init();