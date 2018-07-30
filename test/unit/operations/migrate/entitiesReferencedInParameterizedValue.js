"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CacheSnapshot_1 = require("../../../../src/CacheSnapshot");
var CacheContext_1 = require("../../../../src/context/CacheContext");
var operations_1 = require("../../../../src/operations");
var SnapshotEditor_1 = require("../../../../src/operations/SnapshotEditor");
var OptimisticUpdateQueue_1 = require("../../../../src/OptimisticUpdateQueue");
var schema_1 = require("../../../../src/schema");
var helpers_1 = require("../../../helpers");
var QueryRootId = schema_1.StaticNodeId.QueryRoot;
function createNewCacheSnapshot(cacheContext) {
    var snapshot = helpers_1.createGraphSnapshot({
        one: {
            two: [
                {
                    three: {
                        id: 31,
                        four: { five: 1 },
                        color: 'blue',
                        __typename: 'THREE',
                    },
                },
                {
                    three: {
                        id: 32,
                        four: { five: 1 },
                        color: 'gold',
                        __typename: 'THREE',
                    },
                },
                null,
            ],
        },
    }, "query nested($id: ID!) {\n      one {\n        two(id: $id) {\n          three {\n            id\n            four(extra: true) {\n              five\n            }\n            color\n            __typename\n          }\n        }\n      }\n    }", cacheContext, { id: 1 });
    return new CacheSnapshot_1.CacheSnapshot(snapshot, snapshot, new OptimisticUpdateQueue_1.OptimisticUpdateQueue());
}
describe("operations.migrate", function () {
    var cacheContext;
    beforeAll(function () {
        cacheContext = new CacheContext_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { freeze: false }));
    });
    it("can add fields to entities referenced within parameterized value", function () {
        var migrated = operations_1.migrate(createNewCacheSnapshot(cacheContext), {
            _entities: {
                THREE: {
                    size: function (_previous) { return 1024; },
                },
            },
        });
        var cacheAfter = operations_1.extract(migrated.baseline, cacheContext);
        var parameterizedTopContainerId = SnapshotEditor_1.nodeIdForParameterizedValue(QueryRootId, ['one', 'two'], { id: 1 });
        var nestedParameterizedValueId0 = SnapshotEditor_1.nodeIdForParameterizedValue('31', ['four'], { extra: true });
        var nestedParameterizedValueId1 = SnapshotEditor_1.nodeIdForParameterizedValue('32', ['four'], { extra: true });
        expect(cacheAfter).to.deep.eq((_a = {},
            _a[QueryRootId] = {
                type: 0 /* EntitySnapshot */,
                outbound: [{ id: parameterizedTopContainerId, path: ['one', 'two'] }],
            },
            _a[parameterizedTopContainerId] = {
                type: 1 /* ParameterizedValueSnapshot */,
                inbound: [{ id: QueryRootId, path: ['one', 'two'] }],
                outbound: [
                    { id: '31', path: [0, 'three'] },
                    { id: '32', path: [1, 'three'] },
                ],
                data: [{ three: undefined }, { three: undefined }, null],
            },
            _a['31'] = {
                type: 0 /* EntitySnapshot */,
                inbound: [{ id: parameterizedTopContainerId, path: [0, 'three'] }],
                outbound: [{ id: nestedParameterizedValueId0, path: ['four'] }],
                data: {
                    id: 31,
                    color: 'blue',
                    size: 1024,
                    __typename: 'THREE',
                },
            },
            _a[nestedParameterizedValueId0] = {
                type: 1 /* ParameterizedValueSnapshot */,
                inbound: [{ id: '31', path: ['four'] }],
                data: {
                    five: 1,
                },
            },
            _a['32'] = {
                type: 0 /* EntitySnapshot */,
                inbound: [{ id: parameterizedTopContainerId, path: [1, 'three'] }],
                outbound: [{ id: nestedParameterizedValueId1, path: ['four'] }],
                data: {
                    id: 32,
                    color: 'gold',
                    size: 1024,
                    __typename: 'THREE',
                },
            },
            _a[nestedParameterizedValueId1] = {
                type: 1 /* ParameterizedValueSnapshot */,
                inbound: [{ id: '32', path: ['four'] }],
                data: {
                    five: 1,
                },
            },
            _a));
        var _a;
    });
    it("can modify fields to entities referenced within parameterized value", function () {
        var migrated = operations_1.migrate(createNewCacheSnapshot(cacheContext), {
            _entities: {
                THREE: {
                    color: function (previous) { return "really " + previous; },
                },
            },
        });
        var cacheAfter = operations_1.extract(migrated.baseline, cacheContext);
        var parameterizedTopContainerId = SnapshotEditor_1.nodeIdForParameterizedValue(QueryRootId, ['one', 'two'], { id: 1 });
        var nestedParameterizedValueId0 = SnapshotEditor_1.nodeIdForParameterizedValue('31', ['four'], { extra: true });
        var nestedParameterizedValueId1 = SnapshotEditor_1.nodeIdForParameterizedValue('32', ['four'], { extra: true });
        expect(cacheAfter).to.deep.eq((_a = {},
            _a[QueryRootId] = {
                type: 0 /* EntitySnapshot */,
                outbound: [{ id: parameterizedTopContainerId, path: ['one', 'two'] }],
            },
            _a[parameterizedTopContainerId] = {
                type: 1 /* ParameterizedValueSnapshot */,
                inbound: [{ id: QueryRootId, path: ['one', 'two'] }],
                outbound: [
                    { id: '31', path: [0, 'three'] },
                    { id: '32', path: [1, 'three'] },
                ],
                data: [{ three: undefined }, { three: undefined }, null],
            },
            _a['31'] = {
                type: 0 /* EntitySnapshot */,
                inbound: [{ id: parameterizedTopContainerId, path: [0, 'three'] }],
                outbound: [{ id: nestedParameterizedValueId0, path: ['four'] }],
                data: {
                    id: 31,
                    color: 'really blue',
                    __typename: 'THREE',
                },
            },
            _a[nestedParameterizedValueId0] = {
                type: 1 /* ParameterizedValueSnapshot */,
                inbound: [{ id: '31', path: ['four'] }],
                data: {
                    five: 1,
                },
            },
            _a['32'] = {
                type: 0 /* EntitySnapshot */,
                inbound: [{ id: parameterizedTopContainerId, path: [1, 'three'] }],
                outbound: [{ id: nestedParameterizedValueId1, path: ['four'] }],
                data: {
                    id: 32,
                    color: 'really gold',
                    __typename: 'THREE',
                },
            },
            _a[nestedParameterizedValueId1] = {
                type: 1 /* ParameterizedValueSnapshot */,
                inbound: [{ id: '32', path: ['four'] }],
                data: {
                    five: 1,
                },
            },
            _a));
        var _a;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXRpZXNSZWZlcmVuY2VkSW5QYXJhbWV0ZXJpemVkVmFsdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlbnRpdGllc1JlZmVyZW5jZWRJblBhcmFtZXRlcml6ZWRWYWx1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBOEQ7QUFDOUQscUVBQW9FO0FBQ3BFLHlEQUE4RDtBQUM5RCw0RUFBd0Y7QUFDeEYsK0VBQThFO0FBRTlFLGlEQUFvRTtBQUNwRSw0Q0FBcUU7QUFFN0QsSUFBQSw2Q0FBc0IsQ0FBa0I7QUFFaEQsZ0NBQWdDLFlBQTBCO0lBQ3hELElBQU0sUUFBUSxHQUFHLDZCQUFtQixDQUNsQztRQUNFLEdBQUcsRUFBRTtZQUNILEdBQUcsRUFBRTtnQkFDSDtvQkFDRSxLQUFLLEVBQUU7d0JBQ0wsRUFBRSxFQUFFLEVBQUU7d0JBQ04sSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTt3QkFDakIsS0FBSyxFQUFFLE1BQU07d0JBQ2IsVUFBVSxFQUFFLE9BQU87cUJBQ3BCO2lCQUNGO2dCQUNEO29CQUNFLEtBQUssRUFBRTt3QkFDTCxFQUFFLEVBQUUsRUFBRTt3QkFDTixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO3dCQUNqQixLQUFLLEVBQUUsTUFBTTt3QkFDYixVQUFVLEVBQUUsT0FBTztxQkFDcEI7aUJBQ0Y7Z0JBQ0QsSUFBSTthQUNMO1NBQ0Y7S0FDRixFQUNELHlQQWFFLEVBQ0YsWUFBWSxFQUNaLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUNWLENBQUM7SUFDRixPQUFPLElBQUksNkJBQWEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksNkNBQXFCLEVBQUUsQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFFRCxRQUFRLENBQUMsb0JBQW9CLEVBQUU7SUFDN0IsSUFBSSxZQUEwQixDQUFDO0lBQy9CLFNBQVMsQ0FBQztRQUNSLFlBQVksR0FBRyxJQUFJLDJCQUFZ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