// https://github.com/twbs/bootstrap/issues/1768
function shiftWindow() {
    scrollBy(0, -50);
}

function fixAnchorPosition() {
    if (location.hash) {
        shiftWindow();
    }
}

function init() {
    fixAnchorPosition();
    window.addEventListener("hashchange", shiftWindow);
}

$(init);
