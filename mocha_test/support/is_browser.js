module.exports = function() {
    return (typeof process === "undefined") ||
        (process + "" !== "[object process]"); // browserify
};
