var DLL = require('../lib/internal/DoublyLinkedList').default;
var expect = require('chai').expect;

describe('DoublyLinkedList', function () {
    it('toArray', function() {
        var list = new DLL();
        expect(list.toArray()).to.eql([]);

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }
        expect(list.toArray()).to.eql([0, 1, 2, 3, 4]);
    });

    it('remove', function() {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        list.remove(function (node) {
            return node.data === 3;
        })

        expect(list.toArray()).to.eql([0, 1, 2, 4]);
    });

    it('remove (head)', function() {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        list.remove(function (node) {
            return node.data === 0;
        })

        expect(list.toArray()).to.eql([1, 2, 3, 4]);
    });

    it('remove (tail)', function() {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        list.remove(function (node) {
            return node.data === 4;
        })

        expect(list.toArray()).to.eql([0, 1, 2, 3]);
    });

    it('remove (all)', function() {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        list.remove(function (node) {
            return node.data < 5;
        })

        expect(list.toArray()).to.eql([]);
    });

    it('empty', function() {
        var list = new DLL();

        for (var i = 0; i < 5; i++) {
            list.push({data: i});
        }

        var empty = list.empty();

        expect(list).to.equal(empty);
        expect(list.toArray()).to.eql([]);
    });
});
