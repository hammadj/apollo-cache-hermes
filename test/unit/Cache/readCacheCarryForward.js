"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var helpers_1 = require("../../helpers");
var src_1 = require("../../../src");
describe("readCache carry-forward", function () {
    var thingQuery = helpers_1.query("\n    query thing($id: ID!) {\n      thing(id: $id) {\n        id\n        ref { id }\n      }\n    }\n  ");
    var cache;
    beforeEach(function () {
        cache = new src_1.Cache(helpers_1.strictConfig);
    });
    it("the cache memoizes read results", function () {
        cache.write(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }), { thing: { id: 'a', ref: { id: 1 } } });
        expect(cache.getSnapshot().baseline.readCache.size).to.eq(0);
        cache.read(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }));
        expect(cache.getSnapshot().baseline.readCache.size).to.eq(1);
    });
    it("carries cache results forward if no entities in the cached query were changed", function () {
        cache.write(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }), { thing: { id: 'a', ref: { id: 1 } } });
        cache.read(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }));
        cache.write(tslib_1.__assign({}, thingQuery, { variables: { id: 'b' } }), { thing: { id: 'b', ref: { id: 1 } } });
        expect(cache.getSnapshot().baseline.readCache.size).to.eq(1);
    });
    it("drops cache results if entities in the cached query were changed", function () {
        cache.write(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }), { thing: { id: 'a', ref: { id: 1 } } });
        cache.read(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }));
        cache.write(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }), { thing: { id: 'a', ref: { id: 2 } } });
        expect(cache.getSnapshot().baseline.readCache.size).to.eq(0);
    });
    it("drops cache results if containing entities in the cached query were changed", function () {
        cache.write(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }), { thing: { id: 'a', ref: { id: 1 } } });
        cache.read(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }));
        cache.write(tslib_1.__assign({}, thingQuery, { variables: { id: 'a' } }), { thing: { id: 'b', ref: { id: 1 } } });
        expect(cache.getSnapshot().baseline.readCache.size).to.eq(0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZENhY2hlQ2FycnlGb3J3YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVhZENhY2hlQ2FycnlGb3J3YXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlDQUFvRDtBQUNwRCxvQ0FBcUM7QUFFckMsUUFBUSxDQUFDLHlCQUF5QixFQUFFO0lBRWxDLElBQU0sVUFBVSxHQUFHLGVBQUssQ0FBQywyR0FPeEIsQ0FBQyxDQUFDO0lBRUgsSUFBSSxLQUFZLENBQUM7SUFDakIsVUFBVSxDQUFDO1FBQ1QsS0FBSyxHQUFHLElBQUksV0FBSyxDQUFDLHNCQUFZLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRTtRQUNwQyxLQUFLLENBQUMsS0FBSyxzQkFBTSxVQUFVLElBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFL0YsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsS0FBSyxDQUFDLElBQUksc0JBQU0sVUFBVSxJQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBRyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLCtFQUErRSxFQUFFO1FBQ2xGLEtBQUssQ0FBQyxLQUFLLHNCQUFNLFVBQVUsSUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvRixLQUFLLENBQUMsSUFBSSxzQkFBTSxVQUFVLElBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFHLENBQUM7UUFFdEQsS0FBSyxDQUFDLEtBQUssc0JBQU0sVUFBVSxJQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9GLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGtFQUFrRSxFQUFFO1FBQ3JFLEtBQUssQ0FBQyxLQUFLLHNCQUFNLFVBQVUsSUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvRixLQUFLLENBQUMsSUFBSSxzQkFBTSxVQUFVLElBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFHLENBQUM7UUFFdEQsS0FBSyxDQUFDLEtBQUssc0JBQU0sVUFBVSxJQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9GLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDZFQUE2RSxFQUFFO1FBQ2hGLEtBQUssQ0FBQyxLQUFLLHNCQUFNLFVBQVUsSUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvRixLQUFLLENBQUMsSUFBSSxzQkFBTSxVQUFVLElBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFHLENBQUM7UUFFdEQsS0FBSyxDQUFDLEtBQUssc0JBQU0sVUFBVSxJQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9GLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUMsQ0FBQyxDQUFDO0FBRUwsQ0FBQyxDQUFDLENBQUMifQ==