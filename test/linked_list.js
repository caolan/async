var DLL = require('../lib/internal/DoublyLinkedList').default;
var {expect} = require('chai');

describe('DoublyLinkedList', () => {
    it('toArray', () => {
        var list = new DLL();
        expect(list.toArray()).to.eql([]);

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }
        expect(list.toArray()).to.eql([0, 1, 2, 3, 4]);
    });

    it('remove', () => {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        list.remove((node) => {
            return node.data === 3;
        })

        expect(list.toArray()).to.eql([0, 1, 2, 4]);
    });

    it('remove (head)', () => {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        list.remove((node) => {
            return node.data === 0;
        })

        expect(list.toArray()).to.eql([1, 2, 3, 4]);
    });

    it('remove (tail)', () => {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        list.remove((node) => {
            return node.data === 4;
        })

        expect(list.toArray()).to.eql([0, 1, 2, 3]);
    });

    it('remove (all)', () => {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        list.remove((node) => {
            return node.data < 5;
        })

        expect(list.toArray()).to.eql([]);
    });

    it('empty', () => {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        var empty = list.empty();

        expect(list).to.equal(empty);
        expect(list.toArray()).to.eql([]);
    });
});
