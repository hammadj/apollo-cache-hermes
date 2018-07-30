"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CacheSnapshot_1 = require("../../../../src/CacheSnapshot");
var CacheContext_1 = require("../../../../src/context/CacheContext");
var operations_1 = require("../../../../src/operations");
var OptimisticUpdateQueue_1 = require("../../../../src/OptimisticUpdateQueue");
var schema_1 = require("../../../../src/schema");
var helpers_1 = require("../../../helpers");
var QueryRootId = schema_1.StaticNodeId.QueryRoot;
function createNewCacheSnapshot(cacheContext) {
    var snapshot = helpers_1.createGraphSnapshot({
        foo: 123,
        bar: 'asdf',
        viewer: {
            id: 'a',
            first: 'Jonh',
            last: 'Doe',
            __typename: 'Viewer',
        },
    }, "{ foo bar viewer { id first last __typename } }", cacheContext);
    return new CacheSnapshot_1.CacheSnapshot(snapshot, snapshot, new OptimisticUpdateQueue_1.OptimisticUpdateQueue());
}
describe("operations.migrate", function () {
    var cacheContext;
    // let cacheSnapshot: CacheSnapshot;
    beforeAll(function () {
        cacheContext = new CacheContext_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { freeze: false }));
    });
    it("can add fields to root", function () {
        var migrated = operations_1.migrate(createNewCacheSnapshot(cacheContext), {
            _entities: {
                Query: {
                    extra: function (_previous) { return ''; },
                },
            },
        });
        var cacheAfter = operations_1.extract(migrated.baseline, cacheContext);
        expect(cacheAfter).to.deep.eq((_a = {},
            _a[QueryRootId] = {
                type: 0 /* EntitySnapshot */,
                data: {
                    foo: 123,
                    bar: 'asdf',
                    extra: '',
                    'viewer': undefined,
                },
                outbound: [{
                        id: 'a', path: ['viewer'],
                    }],
            },
            _a['a'] = {
                type: 0 /* EntitySnapshot */,
                data: {
                    id: 'a',
                    first: 'Jonh',
                    last: 'Doe',
                    __typename: 'Viewer',
                },
                inbound: [{ id: QueryRootId, path: ['viewer'] }],
            },
            _a));
        var _a;
    });
    it("can modify fields to root", function () {
        var migrated = operations_1.migrate(createNewCacheSnapshot(cacheContext), {
            _entities: {
                Query: {
                    foo: function (_previous) { return 456; },
                    bar: function (_previous) { return 'woohoo'; },
                },
            },
        });
        var cacheAfter = operations_1.extract(migrated.baseline, cacheContext);
        expect(cacheAfter).to.deep.eq((_a = {},
            _a[QueryRootId] = {
                type: 0 /* EntitySnapshot */,
                data: {
                    foo: 456,
                    bar: 'woohoo',
                    'viewer': undefined,
                },
                outbound: [{
                        id: 'a', path: ['viewer'],
                    }],
            },
            _a['a'] = {
                type: 0 /* EntitySnapshot */,
                data: {
                    id: 'a',
                    first: 'Jonh',
                    last: 'Doe',
                    __typename: 'Viewer',
                },
                inbound: [{ id: QueryRootId, path: ['viewer'] }],
            },
            _a));
        var _a;
    });
    it("can add fields to non-root entites", function () {
        var migrated = operations_1.migrate(createNewCacheSnapshot(cacheContext), {
            _entities: {
                Viewer: {
                    suffix: function (_previous) { return 'Dr'; },
                },
            },
        });
        var cacheAfter = operations_1.extract(migrated.baseline, cacheContext);
        expect(cacheAfter).to.deep.eq((_a = {},
            _a[QueryRootId] = {
                type: 0 /* EntitySnapshot */,
                data: {
                    foo: 123,
                    bar: 'asdf',
                    'viewer': undefined,
                },
                outbound: [{
                        id: 'a', path: ['viewer'],
                    }],
            },
            _a['a'] = {
                type: 0 /* EntitySnapshot */,
                data: {
                    id: 'a',
                    first: 'Jonh',
                    last: 'Doe',
                    suffix: 'Dr',
                    __typename: 'Viewer',
                },
                inbound: [{ id: QueryRootId, path: ['viewer'] }],
            },
            _a));
        var _a;
    });
    it("can modify fields of non-root entities", function () {
        var migrated = operations_1.migrate(createNewCacheSnapshot(cacheContext), {
            _entities: {
                Viewer: {
                    first: function (_previous) { return 'Adam'; },
                    last: function (_previous) { return 'Smith'; },
                },
            },
        });
        var cacheAfter = operations_1.extract(migrated.baseline, cacheContext);
        expect(cacheAfter).to.deep.eq((_a = {},
            _a[QueryRootId] = {
                type: 0 /* EntitySnapshot */,
                data: {
                    foo: 123,
                    bar: 'asdf',
                    'viewer': undefined,
                },
                outbound: [{
                        id: 'a', path: ['viewer'],
                    }],
            },
            _a['a'] = {
                type: 0 /* EntitySnapshot */,
                data: {
                    id: 'a',
                    first: 'Adam',
                    last: 'Smith',
                    __typename: 'Viewer',
                },
                inbound: [{ id: QueryRootId, path: ['viewer'] }],
            },
            _a));
        var _a;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5TWlncmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVudGl0eU1pZ3JhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBQThEO0FBQzlELHFFQUFvRTtBQUNwRSx5REFBOEQ7QUFDOUQsK0VBQThFO0FBRTlFLGlEQUFvRTtBQUNwRSw0Q0FBcUU7QUFFN0QsSUFBQSw2Q0FBc0IsQ0FBa0I7QUFFaEQsZ0NBQWdDLFlBQTBCO0lBQ3hELElBQU0sUUFBUSxHQUFHLDZCQUFtQixDQUNsQztRQUNFLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUU7WUFDTixFQUFFLEVBQUUsR0FBRztZQUNQLEtBQUssRUFBRSxNQUFNO1lBQ2IsSUFBSSxFQUFFLEtBQUs7WUFDWCxVQUFVLEVBQUUsUUFBUTtTQUNyQjtLQUNGLEVBQ0QsaURBQWlELEVBQ2pELFlBQVksQ0FDYixDQUFDO0lBQ0YsT0FBTyxJQUFJLDZCQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLDZDQUFxQixFQUFFLENBQUMsQ0FBQztBQUM1RSxDQUFDO0FBRUQsUUFBUSxDQUFDLG9CQUFvQixFQUFFO0lBQzdCLElBQUksWUFBMEIsQ0FBQztJQUMvQixvQ0FBb0M7SUFDcEMsU0FBUyxDQUFDO1FBQ1IsWUFBWSxHQUFHLElBQUksMkJBQVksc0JBQU0sc0JBQVksSUFBRSxNQUFNLEVBQUUsS0FBSyxJQUFHLENBQUM7SUFDdEUsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUU7UUFDM0IsSUFBTSxRQUFRLEdBQUcsb0JBQU8sQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUM3RCxTQUFTLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFO29CQUNMLEtBQUssRUFBRSxVQUFDLFNBQW9CLElBQUssT0FBQSxFQUFFLEVBQUYsQ0FBRTtpQkFDcEM7YUFDRjtTQUNGLENBQUMsQ0FBQztR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