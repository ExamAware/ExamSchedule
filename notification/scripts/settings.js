function saveSettingsToCookies() {
    try {
        var table = document.getElementById('reminderTable');
        var reminders = [];
        for (var i = 1; i < table.rows.length - 1; i++) {
            var row = table.rows[i];
            var condition = row.cells[0].querySelector('select').value;
            var timeInput = row.cells[1].querySelector('input');
            var audioSelect = row.cells[2].querySelector('select');
            if (timeInput && audioSelect) {
                var time = timeInput.value || 0;
                var audio = audioSelect.value;
                reminders.push({ condition: condition, time: time, audio: audio });
            }
        }

        if (reminders.length === 0) {
            errorSystem.show('请添加至少一个提醒策略', 'error');
            return false;
        }

        // 编码并保存到 Cookie
        const remindersStr = encodeURIComponent(JSON.stringify(reminders));
        setCookie("reminders", remindersStr, 365);
        
        // 更新提醒队列
        loadRemindersToQueue(reminders);
        
        errorSystem.show('提醒设置已保存', 'info');
        return true;
    } catch (e) {
        errorSystem.show('保存设置失败: ' + e.message, 'error');
        return false;
    }
}

function loadSettingsFromCookies() {
    try {
        const reminderCookie = getCookie("reminders");
        if (reminderCookie) {
            // 解码并解析 Cookie 值
            const reminders = JSON.parse(decodeURIComponent(reminderCookie));
            if (Array.isArray(reminders)) {
                // 清空现有提醒
                var table = document.getElementById('reminderTable');
                while (table.rows.length > 2) {
                    table.deleteRow(1);
                }

                // 使用 audio_files.json 的数据填充提醒表
                fetch('audio_files.json')
                    .then(response => response.json())
                    .then(audioFiles => {
                        const validAudioTypes = Object.keys(audioFiles);
                        const defaultAudio = validAudioTypes[0];

                        reminders.forEach(function(reminder) {
                            // 检查音频是否有效
                            if (!validAudioTypes.includes(reminder.audio)) {
                                reminder.audio = defaultAudio;
                            }
                            
                            var row = table.insertRow(table.rows.length - 1);
                            let audioOptions = validAudioTypes
                                .map(audio => `<option value="${audio}" ${reminder.audio === audio ? 'selected' : ''}>${audio}</option>`)
                                .join('');
                            
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
                                        ${audioOptions}
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
                        loadRemindersToQueue(reminders);
                    })
                    .catch(error => {
                        errorSystem.show('加载音频文件列表失败: ' + error.message, 'error');
                    });
            }
        }
    } catch (e) {
        errorSystem.show('加载设置失败: ' + e.message, 'error');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");

    let theme = getCookie("theme") || "light";

    if (theme === "light") {
        document.body.classList.remove("dark-mode");
        themeToggle.checked = false;
    } else {
        document.body.classList.add("dark-mode");
        themeToggle.checked = true;
    }

    themeToggle.addEventListener("change", () => {
        const theme = themeToggle.checked ? "dark" : "light";
        if (theme === "light") {
            document.body.classList.remove("dark-mode");
        } else {
            document.body.classList.add("dark-mode");
        }
        setCookie("theme", theme, 365);
    });
});

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}