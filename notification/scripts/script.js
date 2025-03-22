// 全局状态变量
var lastCourse = null, timer = null, lastUpdate = Date.now();

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
        errorSystem.show('更新循环错误: ' + e.message, 'error');
    }
}

function adjustFontSize() {
    var elements = document.querySelectorAll('.time-display, .status-label');
    elements.forEach(element => {
        if (isFullscreen) {
            element.style.fontSize = '10vw';
        } else {
            element.style.fontSize = '';
        }
    });
    var countdownElement = document.getElementById('timeDisplay');
    if (isFullscreen) {
        countdownElement.style.fontSize = '20vw';
    } else {
        countdownElement.style.fontSize = '';
    }
}

function adjustCountdownFontSize() {
    var countdownElement = document.getElementById('timeDisplay');
    var currentSize = parseFloat(window.getComputedStyle(countdownElement).fontSize);
    countdownElement.style.fontSize = (currentSize + 5) + 'px';
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
                <option value="start">当考试开始时</option>
                <option value="end">当考试结束时</option>
            </select>
        </td>
        <td><input type="number" placeholder="分钟" disabled></td>
        <td>
            <select name="audioSelect"></select>
        </td>
        <td><button onclick="removeReminder(this)">删除</button></td>
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
            errorSystem.show('请添加至少一个提醒策略', 'error');
            return;
        }
        // 保存到 Cookie 并更新提醒队列
        saveSettingsToCookies();
        loadRemindersToQueue(reminders);
    } catch (e) {
        errorSystem.show('保存设置失败: ' + e.message, 'error');
    }
}

function loadRemindersToQueue(reminders) {
    var now = Date.now();
    reminders.forEach(function(reminder) {
        var reminderTime;
        if (currentCourse) {
            switch (reminder.condition) {
                case 'beforeStart':
                    reminderTime = new Date(currentCourse.start).getTime() - reminder.time * 60000;
                    break;
                case 'beforeEnd':
                    reminderTime = new Date(currentCourse.end).getTime() - reminder.time * 60000;
                    break;
                case 'afterEnd':
                    reminderTime = new Date(currentCourse.end).getTime() + reminder.time * 60000;
                    break;
                case 'start':
                    reminderTime = new Date(currentCourse.start).getTime();
                    break;
                case 'end':
                    reminderTime = new Date(currentCourse.end).getTime();
                    break;
                default:
                    console.error('未知的提醒条件:', reminder.condition);
                    return;
            }
        } else {
            var nextCourse = getNextCourse();
            if (nextCourse) {
                switch (reminder.condition) {
                    case 'beforeStart':
                        reminderTime = new Date(nextCourse.start).getTime() - reminder.time * 60000;
                        break;
                    case 'start':
                        reminderTime = new Date(nextCourse.start).getTime();
                        break;
                    default:
                        console.error('未知的提醒条件:', reminder.condition);
                        return;
                }
            } else {
                errorSystem.show('当前没有课程信息', 'info');
                return;
            }
        }
        if (reminderTime > now) {
            reminderQueue.addReminder({ time: reminderTime, condition: reminder.condition, audio: reminder.audio });
        }
    });
}

// 修改：系统初始化函数
function init() {
    try {
        // 先加载课程表，然后再初始化其他内容
        loadCourseSchedule().then(() => {
            // 加载配置
            var config = JSON.parse(localStorage.getItem('config') || '{}');
            
            // 加载提醒设置
            var reminders = config.reminders || [];
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
            // 启动安全更新循环
            safeUpdate();
            // 加载设置从Cookies
            loadSettingsFromCookies();
            // 加载提醒到队列
            loadRemindersToQueue(reminders);
        });
    } catch (e) {
        errorSystem.show('系统初始化失败: ' + e.message);
    }
}
window.onbeforeunload = function () {
    if (timer) clearTimeout(timer);
};
init();