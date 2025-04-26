document.addEventListener("DOMContentLoaded", function() {
    const reminderBtn = document.getElementById("reminder-settings-btn");
    const reminderModal = document.getElementById("reminder-modal");
    const closeReminderBtn = document.getElementById("close-reminder-btn");
    const saveReminderBtn = document.getElementById("save-reminder-btn");

    reminderBtn.addEventListener("click", function() {
        reminderModal.style.display = "block";
    });

    closeReminderBtn.addEventListener("click", function() {
        reminderModal.style.display = "none";
    });

    saveReminderBtn.addEventListener("click", function() {
        saveConfig();
        reminderModal.style.display = "none";
    });

    // 点击弹窗外部关闭
    window.addEventListener("click", function(event) {
        if (event.target === reminderModal) {
            reminderModal.style.display = "none";
        }
    });
});
