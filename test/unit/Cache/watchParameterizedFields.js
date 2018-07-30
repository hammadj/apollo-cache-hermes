"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var helpers_1 = require("../../helpers");
var src_1 = require("../../../src");
describe("Cache#watch", function () {
    var fullGraph = helpers_1.query("\n    query fullGraph($id: ID!) {\n      foo(id: $id) {\n        id\n        bar(status: BARF) {\n          id\n          name\n        }\n        baz {\n          id\n          name\n        }\n      }\n    }\n  ");
    var simpleGraph = helpers_1.query("\n    query simpleGraph($id: ID!) {\n      foo(id: $id) {\n        id\n        bar(status: BARF) {\n          id\n          name\n        }\n      }\n    }\n  ");
    var simpleGraphDifferentParameter = helpers_1.query("\n    query simpleGraph($id: ID!) {\n      foo(id: $id) {\n        id\n        bar(status: HURK) {\n          id\n          name\n        }\n      }\n    }\n  ");
    var partialOverlap = helpers_1.query("\n    query partialOverlap($id: ID!) {\n      foo(id: $id) {\n        id\n        baz {\n          id\n          name\n        }\n      }\n    }\n  ");
    var indirectEdit = helpers_1.query("{\n    thing {\n      id\n      name\n    }\n  }");
    var baseState = {
        foo: {
            id: 1,
            bar: {
                id: 2,
                name: 'bar',
            },
            baz: {
                id: 3,
                name: 'baz',
            },
        },
    };
    var cache;
    beforeEach(function () {
        cache = new src_1.Cache(helpers_1.strictConfig);
        cache.write(tslib_1.__assign({}, fullGraph, { variables: { id: 1 } }), baseState);
    });
    it("triggers a callback immediately upon registration", function () {
        var updates = [];
        cache.watch(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), function (newResult) { return updates.push(newResult); });
        expect(updates.length).to.eq(1);
        var _a = tslib_1.__read(updates, 1), update = _a[0];
        expect(update.result).to.deep.eq(baseState);
        expect(update.complete).to.eq(true);
    });
    it("triggers a callback after writing the same query with new values", function () {
        var updates = [];
        cache.watch(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), function (newResult) { return updates.push(newResult); });
        cache.write(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), { foo: { id: 1, bar: { id: 3, name: 'bar' } } });
        expect(updates.length).to.eq(2);
        var _a = tslib_1.__read(updates, 2), update = _a[1];
        expect(update.result.foo.bar.id).to.eq(3);
        expect(update.complete).to.eq(true);
    });
    it("doesn't trigger a callback if unrelated entities change", function () {
        var updates = [];
        cache.watch(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), function (newResult) { return updates.push(newResult); });
        cache.write(tslib_1.__assign({}, partialOverlap, { variables: { id: 1 } }), { foo: { id: 1, baz: { id: 3, name: 'baz2' } } });
        expect(updates.length).to.eq(1);
    });
    it("triggers an update on indirect edits to an entity", function () {
        var updates = [];
        cache.watch(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), function (newResult) { return updates.push(newResult); });
        cache.write(indirectEdit, { thing: { id: 2, name: 'bar2' } });
        expect(updates.length).to.eq(2);
        var _a = tslib_1.__read(updates, 2), update = _a[1];
        expect(update.result.foo.bar.name).to.eq('bar2');
        expect(update.complete).to.eq(true);
    });
    it("triggers an update on reference updates from the query root", function () {
        var updates = [];
        cache.watch(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), function (newResult) { return updates.push(newResult); });
        cache.write(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), { foo: { id: 100, bar: { id: 2, name: 'bar' } } });
        expect(updates.length).to.eq(2);
        var _a = tslib_1.__read(updates, 2), update = _a[1];
        expect(update.result.foo.id).to.eq(100);
        expect(update.complete).to.eq(true);
    });
    it("ignores updates to nodes with different parameters", function () {
        var updates = [];
        cache.watch(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), function (newResult) { return updates.push(newResult); });
        cache.write(tslib_1.__assign({}, simpleGraph, { variables: { id: 100 } }), { foo: { id: 100, bar: { id: 2, name: 'bar' } } });
        expect(updates.length).to.eq(1);
    });
    it("ignores updates to parameterized subfields with different parameters", function () {
        var updates = [];
        cache.watch(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), function (newResult) { return updates.push(newResult); });
        cache.write(tslib_1.__assign({}, simpleGraphDifferentParameter, { variables: { id: 1 } }), { foo: { id: 1, bar: { id: 200, name: 'hurk' } } });
        expect(updates.length).to.eq(1);
    });
    it("handles cases where we transition from complete to incomplete", function () {
        var updates = [];
        cache.watch(tslib_1.__assign({}, simpleGraph, { variables: { id: 1 } }), function (newResult) { return updates.push(newResult); });
        cache.write(tslib_1.__assign({}, partialOverlap, { variables: { id: 1 } }), { foo: { id: 100, baz: { id: 3, name: 'baz' } } });
        expect(updates.length).to.eq(2);
        var _a = tslib_1.__read(updates, 2), update = _a[1];
        expect(update.result.foo.id).to.eq(100);
        expect(update.result.foo.bar).to.eq(undefined);
        expect(update.complete).to.eq(false);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hQYXJhbWV0ZXJpemVkRmllbGRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2F0Y2hQYXJhbWV0ZXJpemVkRmllbGRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlDQUFvRDtBQUNwRCxvQ0FBcUM7QUFHckMsUUFBUSxDQUFDLGFBQWEsRUFBRTtJQUV0QixJQUFNLFNBQVMsR0FBRyxlQUFLLENBQUMsdU5BY3ZCLENBQUMsQ0FBQztJQUVILElBQU0sV0FBVyxHQUFHLGVBQUssQ0FBQyxpS0FVekIsQ0FBQyxDQUFDO0lBRUgsSUFBTSw2QkFBNkIsR0FBRyxlQUFLLENBQUMsaUtBVTNDLENBQUMsQ0FBQztJQUVILElBQU0sY0FBYyxHQUFHLGVBQUssQ0FBQyxzSkFVNUIsQ0FBQyxDQUFDO0lBRUgsSUFBTSxZQUFZLEdBQUcsZUFBSyxDQUFDLGtEQUt6QixDQUFDLENBQUM7SUFFSixJQUFNLFNBQVMsR0FBRztRQUNoQixHQUFHLEVBQUU7WUFDSCxFQUFFLEVBQUUsQ0FBQztZQUNMLEdBQUcsRUFBRTtnQkFDSCxFQUFFLEVBQUUsQ0FBQztnQkFDTCxJQUFJLEVBQUUsS0FBSzthQUNaO1lBQ0QsR0FBRyxFQUFFO2dCQUNILEVBQUUsRUFBRSxDQUFDO2dCQUNMLElBQUksRUFBRSxLQUFLO2FBQ1o7U0FDRjtLQUNGLENBQUM7SUFFRixJQUFJLEtBQVksQ0FBQztJQUNqQixVQUFVLENBQUM7UUFDVCxLQUFLLEdBQUcsSUFBSSxXQUFLLENBQUMsc0JBQVksQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxLQUFLLHNCQUFNLFNBQVMsSUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUksU0FBUyxDQUFDLENBQUM7SUFDakUsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsbURBQW1ELEVBQUU7UUFDdEQsSUFBTSxPQUFPLEdBQWtCLEVBQUUsQ0FBQztRQUNsQyxLQUFLLENBQUMsS0FBSyxzQkFBTSxX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