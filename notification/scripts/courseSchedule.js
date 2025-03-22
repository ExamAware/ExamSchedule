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
