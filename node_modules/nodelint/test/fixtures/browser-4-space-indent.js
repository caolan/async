/*jslint indent: 4, browser: true*/

var userAgent = navigator.userAgent;

function getOrCreate(tag, id) {
    var el = document.getElementById(id);
    if (!el) {
        el = document.createElement(tag);
        el.id = id;
        document.body.appendChild(el);
    }
    return el;
}
