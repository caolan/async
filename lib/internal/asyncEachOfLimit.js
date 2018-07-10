const breakLoop = require('./breakLoop')

// for async generators
export default function asyncEachOfLimit(generator, limit, iteratee, callback) {
    let done = false
    let canceled = false
    let awaiting = false
    let running = 0
    let idx = 0

    function replenish() {
        //console.log('replenish')
        if (running >= limit || awaiting) return
        //console.log('replenish awaiting')
        awaiting = true
        generator.next().then(({value, done: iterDone}) => {
            //console.log('got value', value)
            awaiting = false
            if (iterDone) {
                done = true;
                if (running <= 0) {
                    callback(null)
                }
                return;
            }
            running++
            iteratee(value, idx, iterateeCallback)
            idx++
            replenish()
        }).catch(handleError)
    }

    function iterateeCallback(err, result) {
        //console.log('iterateeCallback')
        if (canceled) return
        running -= 1;
        if (err) return handleError(err)

        if (err === false) {
            done = true;
            canceled = true;
        }

        if (result === breakLoop || (done && running <= 0)) {
            done = true;
            //console.log('done')
            return callback(null);
        }
        replenish()
    }

    function handleError(err) {
        awaiting = false
        done = true
        callback(err)
    }

    replenish()
}
