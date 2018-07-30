"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CacheContext_1 = require("../../../../../src/context/CacheContext");
var EntitySnapshot_1 = require("../../../../../src/nodes/EntitySnapshot");
var operations_1 = require("../../../../../src/operations");
var schema_1 = require("../../../../../src/schema");
var helpers_1 = require("../../../../helpers");
var QueryRootId = schema_1.StaticNodeId.QueryRoot;
var Three = /** @class */ (function () {
    function Three(id) {
        this.id = id;
    }
    Three.prototype.getId = function () {
        return this.id;
    };
    Three.prototype.getValue = function () {
        return 3 + this.id;
    };
    return Three;
}());
function entityTransformer(node) {
    if (node['__typename'] === 'Three') {
        Object.setPrototypeOf(node, Three.prototype);
    }
}
describe("operations.restore", function () {
    describe("nested references in an array", function () {
        var restoreGraphSnapshot, originalGraphSnapshot;
        beforeAll(function () {
            var cacheContext = new CacheContext_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { entityTransformer: entityTransformer }));
            originalGraphSnapshot = helpers_1.createSnapshot({
                one: {
                    two: [
                        { three: { __typename: 'Three', id: 0 } },
                        { three: { __typename: 'Three', id: 1 } },
                        null,
                    ],
                },
            }, "{\n            one {\n              two {\n                three { __typename id }\n              }\n            }\n        }", 
            /* gqlVariables */ undefined, 
            /* rootId */ undefined, cacheContext).snapshot;
            restoreGraphSnapshot = operations_1.restore((_a = {},
                _a[QueryRootId] = {
                    type: 0 /* EntitySnapshot */,
                    outbound: [
                        { id: '0', path: ['one', 'two', 0, 'three'] },
                        { id: '1', path: ['one', 'two', 1, 'three'] },
                    ],
                    data: {
                        one: {
                            two: [{}, {}, null],
                        },
                    },
                },
                _a['0'] = {
                    type: 0 /* EntitySnapshot */,
                    inbound: [{ id: QueryRootId, path: ['one', 'two', 0, 'three'] }],
                    data: { __typename: 'Three', id: 0 },
                },
                _a['1'] = {
                    type: 0 /* EntitySnapshot */,
                    inbound: [{ id: QueryRootId, path: ['one', 'two', 1, 'three'] }],
                    data: { __typename: 'Three', id: 1 },
                },
                _a), cacheContext).cacheSnapshot.baseline;
            var _a;
        });
        it("restores GraphSnapshot from JSON serializable object", function () {
            expect(restoreGraphSnapshot).to.deep.eq(originalGraphSnapshot);
        });
        it("correctly restores different types of NodeSnapshot", function () {
            expect(restoreGraphSnapshot.getNodeSnapshot(QueryRootId)).to.be.an.instanceOf(EntitySnapshot_1.EntitySnapshot);
            expect(restoreGraphSnapshot.getNodeSnapshot('0')).to.be.an.instanceOf(EntitySnapshot_1.EntitySnapshot);
            expect(restoreGraphSnapshot.getNodeSnapshot('1')).to.be.an.instanceOf(EntitySnapshot_1.EntitySnapshot);
        });
        it("correctly restore NodeSnapshot, entity transformation on specific entity", function () {
            expect(restoreGraphSnapshot.getNodeData('0')).to.be.an.instanceOf(Three);
            expect(restoreGraphSnapshot.getNodeData('1')).to.be.an.instanceOf(Three);
        });
        it("correctly restore NodeSnapshot, no entity transformation on QueryRootId", function () {
            expect(restoreGraphSnapshot.getNodeData(QueryRootId)).to.not.be.an.instanceOf(Three);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkUmVmZXJlbmNlc0luQXJyYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuZXN0ZWRSZWZlcmVuY2VzSW5BcnJheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3RUFBdUU7QUFFdkUsMEVBQXlFO0FBQ3pFLDREQUF3RDtBQUV4RCxvREFBdUU7QUFDdkUsK0NBQW1FO0FBRTNELElBQUEsNkNBQXNCLENBQWtCO0FBRWhEO0lBQ0UsZUFDUyxFQUFVO1FBQVYsT0FBRSxHQUFGLEVBQUUsQ0FBUTtJQUNoQixDQUFDO0lBRUoscUJBQUssR0FBTDtRQUNFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsd0JBQVEsR0FBUjtRQUNFLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNILFlBQUM7QUFBRCxDQUFDLEFBWkQsSUFZQztBQUVELDJCQUEyQixJQUFnQjtJQUN6QyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxPQUFPLEVBQUU7UUFDbEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzlDO0FBQ0gsQ0FBQztBQUVELFFBQVEsQ0FBQyxvQkFBb0IsRUFBRTtJQUM3QixRQUFRLENBQUMsK0JBQStCLEVBQUU7UUFFeEMsSUFBSSxvQkFBbUMsRUFBRSxxQkFBb0MsQ0FBQztRQUM5RSxTQUFTLENBQUM7WUFDUixJQUFNLFlBQVksR0FBRyxJQUFJLDJCQUFZLHNCQUNoQyxzQkFBWSxJQUNmLGlCQUFpQixtQkFBQSxJQUNqQixDQUFDO1lBRUgscUJBQXFCLEdBQUcsd0JBQWMsQ0FDcEM7Z0JBQ0UsR0FBRyxFQUFFO29CQUNILEdBQUcsRUFBRTt3QkFDSCxFQUFFLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUN6QyxFQUFFLEtBQUss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