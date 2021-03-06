"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntitySnapshot_1 = require("../../../../../src/nodes/EntitySnapshot");
var operations_1 = require("../../../../../src/operations");
var schema_1 = require("../../../../../src/schema");
var helpers_1 = require("../../../../helpers");
var QueryRootId = schema_1.StaticNodeId.QueryRoot;
describe("operations.restore", function () {
    describe("nested values hanging off of a root", function () {
        var restoreGraphSnapshot, originalSnapshot;
        beforeAll(function () {
            var cacheContext = helpers_1.createStrictCacheContext();
            originalSnapshot = helpers_1.createGraphSnapshot({
                bar: {
                    value: 42,
                    prop1: 'hello',
                    prop2: {
                        nestedProp1: 1000,
                        nestedProp2: 'world',
                    },
                    prop3: ['hello', 'world'],
                },
            }, "{\n          bar {\n            value\n            prop1\n            prop2\n            prop3\n          }\n        }", cacheContext);
            restoreGraphSnapshot = operations_1.restore((_a = {},
                _a[QueryRootId] = {
                    type: 0 /* EntitySnapshot */,
                    data: {
                        bar: {
                            value: 42,
                            prop1: 'hello',
                            prop2: {
                                nestedProp1: 1000,
                                nestedProp2: 'world',
                            },
                            prop3: ['hello', 'world'],
                        },
                    },
                },
                _a), cacheContext).cacheSnapshot.baseline;
            var _a;
        });
        it("restores GraphSnapshot from JSON serializable object", function () {
            expect(restoreGraphSnapshot).to.deep.eq(originalSnapshot);
        });
        it("correctly restores different types of NodeSnapshot", function () {
            expect(restoreGraphSnapshot.getNodeSnapshot(QueryRootId)).to.be.an.instanceOf(EntitySnapshot_1.EntitySnapshot);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkVmFsdWVPZmZBUm9vdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5lc3RlZFZhbHVlT2ZmQVJvb3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwRUFBeUU7QUFDekUsNERBQXdEO0FBQ3hELG9EQUF1RTtBQUN2RSwrQ0FBb0Y7QUFFNUUsSUFBQSw2Q0FBc0IsQ0FBa0I7QUFFaEQsUUFBUSxDQUFDLG9CQUFvQixFQUFFO0lBQzdCLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRTtRQUU5QyxJQUFJLG9CQUFtQyxFQUFFLGdCQUErQixDQUFDO1FBQ3pFLFNBQVMsQ0FBQztZQUNSLElBQU0sWUFBWSxHQUFHLGtDQUF3QixFQUFFLENBQUM7WUFDaEQsZ0JBQWdCLEdBQUcsNkJBQW1CLENBQ3BDO2dCQUNFLEdBQUcsRUFBRTtvQkFDSCxLQUFLLEVBQUUsRUFBRTtvQkFDVCxLQUFLLEVBQUUsT0FBTztvQkFDZCxLQUFLLEVBQUU7d0JBQ0wsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLFdBQVcsRUFBRSxPQUFPO3FCQUNyQjtvQkFDRCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO2lCQUMxQjthQUNGLEVBQ0Qsd0hBT0UsRUFDRixZQUFZLENBQ2IsQ0FBQztZQUVGLG9CQUFvQixHQUFHLG9CQUFPO2dCQUM1QixHQUFDLFdBQVcsSUFBRztvQkFDYixJQUFJLHdCQUE4QztvQkFDbEQsSUFBSSxFQUFFO3dCQUNKLEdBQUcsRUFBRTs0QkFDSCxLQUFLLEVBQUUsRUFBRTs0QkFDVCxLQUFLLEVBQUUsT0FBTzs0QkFDZCxLQUFLLEVBQUU7Z0NBQ0wsV0FBVyxFQUFFLElBQUk7Z0NBQ2pCLFdBQVcsRUFBRSxPQUFPOzZCQUNyQjs0QkFDRCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO3lCQUMxQjtxQkFDRjtpQkFDRjtxQkFDQSxZQUFZLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDOztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxzREFBc0QsRUFBRTtZQUN6RCxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLG9EQUFvRCxFQUFFO1lBQ3ZELE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ2hHLENBQUMsQ0FBQyxDQUFDO0lBRUwsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyJ9