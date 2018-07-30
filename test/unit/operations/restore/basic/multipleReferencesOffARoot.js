"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CacheContext_1 = require("../../../../../src/context/CacheContext");
var EntitySnapshot_1 = require("../../../../../src/nodes/EntitySnapshot");
var operations_1 = require("../../../../../src/operations");
var schema_1 = require("../../../../../src/schema");
var helpers_1 = require("../../../../helpers");
var QueryRootId = schema_1.StaticNodeId.QueryRoot;
var Foo = /** @class */ (function () {
    function Foo(id, name, isFoo) {
        this.id = id;
        this.name = name;
        this.isFoo = isFoo;
    }
    Foo.prototype.getId = function () {
        return this.id;
    };
    Foo.prototype.getName = function () {
        return this.name;
    };
    Foo.prototype.isFooInstance = function () {
        return this.isFoo;
    };
    return Foo;
}());
var Bar = /** @class */ (function () {
    function Bar(id, name, isBar) {
        this.id = id;
        this.name = name;
        this.isBar = isBar;
    }
    Bar.prototype.getId = function () {
        return this.id;
    };
    Bar.prototype.getName = function () {
        return this.name;
    };
    Bar.prototype.isBarInstance = function () {
        return this.isBar;
    };
    return Bar;
}());
function entityTransformer(node) {
    switch (node['__typename']) {
        case 'Foo':
            Object.setPrototypeOf(node, Foo.prototype);
            break;
        case 'Bar':
            Object.setPrototypeOf(node, Bar.prototype);
            break;
    }
}
describe("operations.restore", function () {
    describe("multiple references hanging off a root", function () {
        var restoreGraphSnapshot, originaGraphSnapshot;
        beforeAll(function () {
            var cacheContext = new CacheContext_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { entityTransformer: entityTransformer }));
            originaGraphSnapshot = helpers_1.createSnapshot({
                bar: {
                    __typename: 'Bar',
                    id: 123,
                    name: 'Gouda',
                    isBar: true,
                },
                foo: {
                    __typename: 'Foo',
                    id: 456,
                    name: 'Brie',
                    isFoo: true,
                },
            }, "{\n          bar { __typename id name isBar }\n          foo { __typename id name isFoo }\n        }", 
            /* gqlVariables */ undefined, 
            /* rootId */ undefined, cacheContext).snapshot;
            restoreGraphSnapshot = operations_1.restore((_a = {},
                _a[QueryRootId] = {
                    type: 0 /* EntitySnapshot */,
                    outbound: [
                        { id: '123', path: ['bar'] },
                        { id: '456', path: ['foo'] },
                    ],
                    data: {},
                },
                _a['123'] = {
                    type: 0 /* EntitySnapshot */,
                    inbound: [{ id: QueryRootId, path: ['bar'] }],
                    data: {
                        __typename: 'Bar',
                        id: 123,
                        name: 'Gouda',
                        isBar: true,
                    },
                },
                _a['456'] = {
                    type: 0 /* EntitySnapshot */,
                    inbound: [{ id: QueryRootId, path: ['foo'] }],
                    data: {
                        __typename: 'Foo',
                        id: 456,
                        name: 'Brie',
                        isFoo: true,
                    },
                },
                _a), cacheContext).cacheSnapshot.baseline;
            var _a;
        });
        it("restores GraphSnapshot from JSON serializable object", function () {
            expect(restoreGraphSnapshot).to.deep.eq(originaGraphSnapshot);
        });
        it("correctly restores different types of NodeSnapshot", function () {
            expect(restoreGraphSnapshot.getNodeSnapshot(QueryRootId)).to.be.an.instanceOf(EntitySnapshot_1.EntitySnapshot);
            expect(restoreGraphSnapshot.getNodeSnapshot('123')).to.be.an.instanceOf(EntitySnapshot_1.EntitySnapshot);
            expect(restoreGraphSnapshot.getNodeSnapshot('456')).to.be.an.instanceOf(EntitySnapshot_1.EntitySnapshot);
        });
        it("correctly restore NodeSnapshot, entity transformation on specific entity", function () {
            expect(restoreGraphSnapshot.getNodeData('123')).to.be.an.instanceOf(Bar);
            expect(restoreGraphSnapshot.getNodeData('456')).to.be.an.instanceOf(Foo);
        });
        it("correctly restore NodeSnapshot, no entity transformation on QueryRootId", function () {
            expect(restoreGraphSnapshot.getNodeData(QueryRootId)).to.not.be.an.instanceOf(Bar);
            expect(restoreGraphSnapshot.getNodeData(QueryRootId)).to.not.be.an.instanceOf(Foo);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlwbGVSZWZlcmVuY2VzT2ZmQVJvb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtdWx0aXBsZVJlZmVyZW5jZXNPZmZBUm9vdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3RUFBdUU7QUFFdkUsMEVBQXlFO0FBQ3pFLDREQUF3RDtBQUV4RCxvREFBdUU7QUFDdkUsK0NBQW1FO0FBRTNELElBQUEsNkNBQXNCLENBQWtCO0FBRWhEO0lBQ0UsYUFDUyxFQUFVLEVBQ1YsSUFBWSxFQUNaLEtBQWM7UUFGZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFVBQUssR0FBTCxLQUFLLENBQVM7SUFDcEIsQ0FBQztJQUVKLG1CQUFLLEdBQUw7UUFDRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVELHFCQUFPLEdBQVA7UUFDRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVELDJCQUFhLEdBQWI7UUFDRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUNILFVBQUM7QUFBRCxDQUFDLEFBbEJELElBa0JDO0FBRUQ7SUFDRSxhQUNTLEVBQVUsRUFDVixJQUFZLEVBQ1osS0FBYztRQUZkLE9BQUUsR0FBRixFQUFFLENBQVE7UUFDVixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osVUFBSyxHQUFMLEtBQUssQ0FBUztJQUNwQixDQUFDO0lBRUosbUJBQUssR0FBTDtRQUNFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQscUJBQU8sR0FBUDtRQUNFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQsMkJBQWEsR0FBYjtRQUNFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBQ0gsVUFBQztBQUFELENBQUMsQUFsQkQsSUFrQkM7QUFFRCwyQkFBMkIsSUFB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