support = {}

support.isBrowser = function() {
    return (typeof process === "undefined") ||
        (process + "" !== "[object process]"); // browserify
}

module.exports = support
