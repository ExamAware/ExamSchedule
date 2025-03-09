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
                <option value="start">当考试开始时</option>
                <option value="end">当考试结束时</option>
            </select>
        </td>
        <td><input type="number" placeholder="分钟" disabled></td>
        <td>
            <select>
                <option value="classStart">上课铃声</option>
                <option value="classEnd">下课铃声</option>
            </select>
        </td>
        <td><button onclick="removeReminder(this)">删除</button></td>
    `;
    row.cells[0].querySelector('select').addEventListener('change', function() {
        row.cells[1].querySelector('input').disabled = this.value === 'start' || this.value === 'end';
        row.cells[1].querySelector('input').placeholder = this.value === 'start' || this.value === 'end' ? '-' : '分钟';
    });
}

function removeReminder(button) {
    var row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function saveConfig() {
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
    var config = {
        reminders: reminders,
        classBell: document.getElementById('classBell').checked,
        breakBell: document.getElementById('breakBell').checked,
        examInfos: courseSchedule,
        examName: document.title,
        message: document.getElementById('statusLabel').textContent,
        room: document.getElementById('timeDescription').textContent.replace('考场: ', '')
    };
    localStorage.setItem('config', JSON.stringify(config));
    errorSystem.show('配置已保存');
    loadRemindersToQueue(reminders);
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
                console.error('当前没有课程信息');
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
        var table = document.getElementById('scheduleTable');
        courseSchedule.forEach(function(course) {
            var row = table.insertRow(-1);
            row.innerHTML = '<td>' + course.name + '</td>' +
                            '<td>' + formatDateTime(course.start) + ' - ' + formatDateTime(course.end) + '</td>' +
                            '<td></td>';
        });
        // 初始化设置复选框
        var config = JSON.parse(localStorage.getItem('config') || '{}');
        document.getElementById('classBell').checked = config.classBell || false;
        document.getElementById('breakBell').checked = config.breakBell || false;
        document.getElementById('classBell').onchange = function () {
            saveConfig();
        };
        document.getElementById('breakBell').onchange = function () {
            saveConfig();
        };
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
                    <select>
                        <option value="classStart" ${reminder.audio === 'classStart' ? 'selected' : ''}>上课铃声</option>
                        <option value="classEnd" ${reminder.audio === 'classEnd' ? 'selected' : ''}>下课铃声</option>
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
        // 移除或修改音频权限激活代码（用原音频系统无需特殊激活）
        document.body.onclick = null;
        // 加载设置从Cookies
        loadSettingsFromCookies();
        // 加载提醒到队列
        loadRemindersToQueue(reminders);
    } catch (e) {
        errorSystem.show('系统初始化失败: ' + e.message);
    }
}
window.onbeforeunload = function () {
    if (timer) clearTimeout(timer);
};
init();