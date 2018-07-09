var async = require('../lib');
var {expect} = require('chai');

describe('forever', () => {
    context('function is asynchronous', () => {
        it('executes the function over and over until it yields an error', (done) => {
            var counter = 0;
            function addOne(callback) {
                counter++;
                if (counter === 50) {
                    return callback('too big!');
                }
                async.setImmediate(() => {
                    callback();
                });
            }
            async.forever(addOne, (err) => {
                expect(err).to.eql('too big!');
                expect(counter).to.eql(50);
                done();
            });
        });
    });

    context('function is synchronous', () => {
        it('does not cause a stack overflow @nodeonly', (done) => { // this will take forever in a browser
            var counter = 0;
            function addOne(callback) {
                counter++;
                if (counter === 50000) { // needs to be huge to potentially overflow stack in node
                    return callback('too big!');
                }
                callback();
            }
            async.forever(addOne, (err) => {
                expect(err).to.eql('too big!');
                expect(counter).to.eql(50000);
                done();
            });
        });

        it('should cancel', (done) => {
            var counter = 0;
            async.forever(cb => {
                counter++
                cb(counter === 2 ? false : null)
            }, () => { throw new Error('should not get here') })

            setTimeout(() => {
                expect(counter).to.eql(2)
                done()
            }, 10)
        })
    });
});
