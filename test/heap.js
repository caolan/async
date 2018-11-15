var Heap = require('../lib/internal/Heap').default;
var {expect} = require('chai');

describe('Heap', () => {
    it('push', () => {
        var heap = new Heap();

        expect(heap.length).to.eql(0);

        heap.push({priority: 1, data: 'foo1'});
        heap.push({priority: 2, data: 'foo2'});
        heap.push({priority: 9, data: 'foo3'});
        heap.push({priority: 2, data: 'foo4'});
        heap.push({priority: 2, data: 'foo5'});
        heap.push({priority: 5, data: 'foo6'});
        heap.push({priority: -5, data: 'foo7'});
        heap.push({priority: 1, data: 'foo8'});

        expect(heap.length).to.eql(8);

        expect(heap.shift().data).to.eql('foo7');
        expect(heap.shift().data).to.eql('foo1');

        heap.push({priority: -10, data: 'foo9'});
        heap.push({priority: 12, data: 'foo10'});

        expect(heap.shift().data).to.eql('foo9');
        expect(heap.shift().data).to.eql('foo8');
        expect(heap.shift().data).to.eql('foo2');
        expect(heap.shift().data).to.eql('foo4');
        expect(heap.shift().data).to.eql('foo5');

        heap.push({priority: -1, data: 'foo11'});
        heap.push({priority: 7, data: 'foo12'});

        expect(heap.shift().data).to.eql('foo11');
        expect(heap.shift().data).to.eql('foo6');
        expect(heap.shift().data).to.eql('foo12');
        expect(heap.shift().data).to.eql('foo3');
        expect(heap.shift().data).to.eql('foo10');

        expect(heap.length).to.eql(0);
    });

    it('toArray', () => {
        var heap = new Heap();
        expect(heap.toArray()).to.eql([]);

        for (var i = 0; i < 5; i++) {
            heap.push({data: i});
        }

        expect(heap.toArray()).to.eql([0, 1, 2, 3, 4]);
    });

    it('remove', () => {
        var heap = new Heap();

        for (var i = 0; i < 5; i++) {
            heap.push({data: i});
        }

        heap.remove((node) => {
            return node.data === 3;
        })

        expect(heap.toArray()).to.eql([0, 1, 2, 4]);
    });

    it('remove (head)', () => {
        var heap = new Heap();

        for (var i = 0; i < 5; i++) {
            heap.push({data: i});
        }

        heap.remove((node) => {
            return node.data === 0;
        })

        expect(heap.toArray()).to.eql([1, 2, 3, 4]);
    });

    it('remove (tail)', () => {
        var heap = new Heap();

        for (var i = 0; i < 5; i++) {
            heap.push({data: i});
        }

        heap.remove((node) => {
            return node.data === 4;
        })

        expect(heap.toArray()).to.eql([0, 1, 2, 3]);
    });

    it('remove (all)', () => {
        var heap = new Heap();

        for (var i = 0; i < 5; i++) {
            heap.push({data: i});
        }

        heap.remove((node) => {
            return node.data < 5;
        })

        expect(heap.toArray()).to.eql([]);
    });

    it('empty', () => {
        var heap = new Heap();

        for (var i = 0; i < 5; i++) {
            heap.push({data: i});
        }

        var empty = heap.empty();

        expect(heap).to.equal(empty);
        expect(heap.toArray()).to.eql([]);
    });
});
