var courseSchedule = [
    { name: "第一节课", start: "2025-01-27T08:00:00", end: "2025-01-27T08:50:00" },
    { name: "第二节课", start: "2025-01-27T09:00:00", end: "2025-01-27T09:50:00" },
    { name: "第三节课", start: "2025-01-27T10:10:00", end: "2025-01-27T11:00:00" },
    { name: "第四节课", start: "2025-01-27T11:10:00", end: "2025-01-27T12:00:00" },
    { name: "第一节课", start: "2025-01-27T13:30:00", end: "2025-01-27T14:20:00" },
    { name: "第二节课", start: "2025-01-27T14:30:00", end: "2025-01-27T15:20:00" },
    { name: "第三节课", start: "2025-01-27T15:40:00", end: "2025-01-27T16:30:00" },
    { name: "第四节课", start: "2025-01-27T16:40:00", end: "2025-01-27T17:30:00" },
    { name: "第一节课", start: "2025-01-27T18:00:00", end: "2025-01-27T18:50:00" },
    { name: "第二节课", start: "2025-01-27T19:00:00", end: "2025-01-27T19:50:00" },
    { name: "第三节课", start: "2025-01-27T20:10:00", end: "2025-01-27T21:00:00" },
    { name: "第四节课", start: "2025-01-27T21:10:00", end: "2025-01-27T22:00:00" }
];

function parseTime(timeStr) {
    try {
        return new Date(timeStr);
    } catch (e) {
        errorSystem.show('时间解析错误: ' + e.message);
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
        errorSystem.show('课程状态更新失败: ' + e.message);
    }
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
        errorSystem.show('获取下一节课失败: ' + e.message);
        return null;
    }
}

function updateScheduleTable() {
    try {
        var now = new Date(),
            table = document.getElementById('scheduleTable'),
            rows = table.querySelectorAll('tr:not(:first-child)');
        rows.forEach(row => row.remove()); // 清空现有行
        courseSchedule.forEach(function(course) {
            var row = table.insertRow(-1);
            row.innerHTML = '<td>' + course.name + '</td>' +
                            '<td>' + formatDateTime(course.start) + ' - ' + formatDateTime(course.end) + '</td>' +
                            '<td></td>';
        });
        for (var i = 0; i < courseSchedule.length; i++) {
            var course = courseSchedule[i];
            if (!course) continue; // 确保不会超出数组边界
            var start = parseTime(course.start),
                end = parseTime(course.end),
                row = table.rows[i + 1]; // 跳过表头行
            row.className = '';
            if (now >= start && now <= end) {
                row.className = 'current-class';
            } else if (now < start) {
                row.className = 'future-class';
            } else {
                row.className = 'past-class';
            }
        }
    } catch (e) {
        errorSystem.show('课程表更新失败: ' + e.message);
    }
}
