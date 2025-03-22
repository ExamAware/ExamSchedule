var courseSchedule = [];

// 将fetch移动到函数中以便控制初始化顺序
function loadCourseSchedule() {
    return fetch('course_schedule.json')
        .then(response => response.json())
        .then(data => {
            courseSchedule = data.examInfos || [];
            document.title = data.examName || '考试看板';
            document.getElementById('examTitle').textContent = data.examName || '考试看板';
            document.getElementById('examMessage').textContent = data.message || '';
            document.getElementById('timeDescription').textContent = data.room ? '考场: ' + data.room : '';
            updateScheduleTable();

            // 检查Cookie是否存在
            const reminderCookie = getCookie("reminders");
            if (!reminderCookie && data.reminders && Array.isArray(data.reminders)) {
                // 如果Cookie不存在，加载配置文件中的提醒设置
                fetch('audio_files.json')
                    .then(response => response.json())
                    .then(audioFiles => {
                        const validAudioTypes = Object.keys(audioFiles);
                        const defaultAudio = validAudioTypes[0];
                        
                        // 验证并修复音频设置
                        const reminders = data.reminders.map(reminder => {
                            if (!validAudioTypes.includes(reminder.audio)) {
                                reminder.audio = defaultAudio;
                            }
                            return reminder;
                        });

                        // 填充提醒表格
                        var table = document.getElementById('reminderTable');
                        while (table.rows.length > 2) {
                            table.deleteRow(1);
                        }

                        reminders.forEach(reminder => {
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

                        // 更新提醒队列并保存到Cookie
                        loadRemindersToQueue(reminders);
                        saveSettingsToCookies();
                    });
            }
            return courseSchedule;
        })
        .catch(error => {
            errorSystem.show('加载课程表失败: ' + error.message, 'error');
            return [];
        });
}

function parseTime(timeStr) {
    try {
        return new Date(timeStr);
    } catch (e) {
        errorSystem.show('时间解析错误: ' + e.message, 'info', 'error');
        return new Date();
    }
}

function updateCourseStatus() {
    try {
        var now = new Date();
        currentCourse = null;
        for (var i = 0; i < courseSchedule.length; i++) {
            var course = courseSchedule[i],
                start = parseTime(course.start),
                end = parseTime(course.end);
            if (end < start) end.setDate(end.getDate() + 1);
            if (now >= start && now <= end) {
                currentCourse = course;
                break;
            }
        }
        if (currentCourse !== lastCourse) {
            handleStatusChange();
            lastCourse = currentCourse;
        }
    } catch (e) {
        errorSystem.show('课程状态更新失败: ' + e.message, 'error');
    }
}

function handleStatusChange() {
    // 处理状态变化的逻辑
    console.log('课程状态已更改:', currentCourse);
}

function getNextCourse() {
    try {
        var now = new Date();
        for (var i = 0; i < courseSchedule.length; i++) {
            var start = parseTime(courseSchedule[i].start);
            if (start > now) return courseSchedule[i];
        }
        return null;
    } catch (e) {
        errorSystem.show('获取下一节课失败: ' + e.message, 'error');
        return null;
    }
}

// 修改更新表格函数，增加数据检查
function updateScheduleTable() {
    try {
        if (!Array.isArray(courseSchedule)) {
            errorSystem.show('课程表数据格式错误', 'error');
            return;
        }
        
        var now = new Date();
        var table = document.getElementById('scheduleTable');
        // 清空现有行，保留表头
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        courseSchedule.forEach(function(course) {
            var row = table.insertRow(-1);
            row.innerHTML = '<td>' + course.name + '</td>' +
                          '<td>' + formatDateTime(course.start) + ' - ' + formatDateTime(course.end) + '</td>' +
                          '<td></td>';
            
            var start = parseTime(course.start);
            var end = parseTime(course.end);
            
            if (now >= start && now <= end) {
                row.className = 'current-class';
                row.cells[2].textContent = '进行中';
            } else if (now < start) {
                row.className = 'future-class';
                row.cells[2].textContent = '即将开始';
            } else {
                row.className = 'past-class';
                row.cells[2].textContent = '已结束';
            }
        });
    } catch (e) {
        errorSystem.show('课程表更新失败: ' + e.message, 'error');
    }
}
