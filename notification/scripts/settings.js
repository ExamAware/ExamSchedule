function saveSettingsToCookies() {
    var remindBefore1 = document.getElementById('remindBefore1');
    var remindBefore2 = document.getElementById('remindBefore2');
    var remindBefore3 = document.getElementById('remindBefore3');
    var remindBefore4 = document.getElementById('remindBefore4');
    var remindBefore5 = document.getElementById('remindBefore5');
    var remindAfter1 = document.getElementById('remindAfter1');
    var remindAfter2 = document.getElementById('remindAfter2');

    document.cookie = "classBell=" + document.getElementById('classBell').checked;
    document.cookie = "breakBell=" + document.getElementById('breakBell').checked;
    if (remindBefore1) document.cookie = "remindBefore1=" + remindBefore1.value;
    if (remindBefore2) document.cookie = "remindBefore2=" + remindBefore2.value;
    if (remindBefore3) document.cookie = "remindBefore3=" + remindBefore3.value;
    if (remindBefore4) document.cookie = "remindBefore4=" + remindBefore4.value;
    if (remindBefore5) document.cookie = "remindBefore5=" + remindBefore5.value;
    if (remindAfter1) document.cookie = "remindAfter1=" + remindAfter1.value;
    if (remindAfter2) document.cookie = "remindAfter2=" + remindAfter2.value;
}

function loadSettingsFromCookies() {
    var cookies = document.cookie.split(';');
    cookies.forEach(function(cookie) {
        var parts = cookie.split('=');
        var name = parts[0].trim();
        var value = parts[1].trim();
        if (name === 'classBell') document.getElementById('classBell').checked = (value === 'true');
        if (name === 'breakBell') document.getElementById('breakBell').checked = (value === 'true');
        if (name === 'remindBefore1' && document.getElementById('remindBefore1')) document.getElementById('remindBefore1').value = value;
        if (name === 'remindBefore2' && document.getElementById('remindBefore2')) document.getElementById('remindBefore2').value = value;
        if (name === 'remindBefore3' && document.getElementById('remindBefore3')) document.getElementById('remindBefore3').value = value;
        if (name === 'remindBefore4' && document.getElementById('remindBefore4')) document.getElementById('remindBefore4').value = value;
        if (name === 'remindBefore5' && document.getElementById('remindBefore5')) document.getElementById('remindBefore5').value = value;
        if (name === 'remindAfter1' && document.getElementById('remindAfter1')) document.getElementById('remindAfter1').value = value;
        if (name === 'remindAfter2' && document.getElementById('remindAfter2')) document.getElementById('remindAfter2').value = value;
    });
}
