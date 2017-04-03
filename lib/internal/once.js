export default function once(fn) {
    function wrapped () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
    wrapped.promise = fn.promise;
    return wrapped;
}
