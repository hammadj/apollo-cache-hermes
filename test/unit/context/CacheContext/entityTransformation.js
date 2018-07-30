"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_utilities_1 = require("apollo-utilities");
var _ = require("lodash");
var context_1 = require("../../../../src/context");
var GraphSnapshot_1 = require("../../../../src/GraphSnapshot");
var read_1 = require("../../../../src/operations/read");
var SnapshotEditor_1 = require("../../../../src/operations/SnapshotEditor");
var write_1 = require("../../../../src/operations/write");
var schema_1 = require("../../../../src/schema");
var helpers_1 = require("../../../helpers");
var QueryRootId = schema_1.StaticNodeId.QueryRoot;
describe("context.CacheContext", function () {
    function queryWithTypename(gqlString, variables, rootId) {
        var rawOperation = helpers_1.query(gqlString, variables, rootId);
        return tslib_1.__assign({}, rawOperation, { document: apollo_utilities_1.addTypenameToDocument(rawOperation.document) });
    }
    describe("entity transformation", function () {
        describe("no entity transformer", function () {
            var viewerQuery, entityTransformerContext, snapshot;
            beforeAll(function () {
                viewerQuery = queryWithTypename("\n          query getViewer($id:ID!) {\n            viewer(id:$id) {\n              id\n              name\n            }\n          }\n        ", { id: '4' });
                entityTransformerContext = new context_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { entityTransformer: undefined }));
                var empty = new GraphSnapshot_1.GraphSnapshot();
                snapshot = write_1.write(entityTransformerContext, empty, viewerQuery, {
                    viewer: {
                        __typename: 'viewer',
                        id: '4',
                        name: 'Bob',
                    },
                }).snapshot;
            });
            it("check helper methods does not exist", function () {
                var viewerParameterizedId = SnapshotEditor_1.nodeIdForParameterizedValue(QueryRootId, ['viewer'], { id: '4' });
                expect(Object.getPrototypeOf(snapshot.getNodeData(viewerParameterizedId))).to.not.include.all.keys(['getName', 'getId']);
            });
        });
        describe("mixin additional helper on simple query", function () {
            var viewerQuery, entityTransformerContext, snapshot;
            beforeAll(function () {
                viewerQuery = queryWithTypename("{\n          viewer {\n            id\n            name\n          }\n        }");
                function mixinHelperMethods(obj, proto) {
                    if (obj['__typename'] === 'viewer') {
                        var newPrototype = _.clone(Object.getPrototypeOf(obj));
                        Object.assign(newPrototype, proto);
                        Object.setPrototypeOf(obj, newPrototype);
                    }
                }
                entityTransformerContext = new context_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { entityTransformer: function (node) {
                        mixinHelperMethods(node, {
                            getName: function () {
                                return this.name;
                            },
                            getId: function () {
                                return this.id;
                            },
                        });
                    } }));
                var empty = new GraphSnapshot_1.GraphSnapshot();
                snapshot = write_1.write(entityTransformerContext, empty, viewerQuery, {
                    viewer: {
                        __typename: 'viewer',
                        id: '0',
                        name: 'Bob',
                    },
                }).snapshot;
            });
            it("get information through helper methods", function () {
                var result = read_1.read(entityTransformerContext, viewerQuery, snapshot).result;
                var name = result.viewer.getName();
                var id = result.viewer.getId();
                expect(name).to.eq('Bob');
                expect(id).to.eq('0');
            });
            it("check helper methods exists", function () {
                expect(Object.getPrototypeOf(snapshot.getNodeData(QueryRootId))).to.not.include.all.keys(['getName', 'getId']);
                expect(Object.getPrototypeOf(snapshot.getNodeData(QueryRootId).viewer)).to.include.all.keys(['getName', 'getId']);
            });
        });
        describe("mixin additional helper on nested query", function () {
            var viewerQuery, entityTransformerContext, snapshot;
            beforeAll(function () {
                viewerQuery = queryWithTypename("\n          query GetUser {\n            user {\n              dispatcher\n              id\n              nickName\n              name\n              contact {\n                address {\n                  city\n                  state\n                }\n                phone\n              }\n            }\n            driver {\n              id\n              name\n              shipments\n            }\n          }\n        ");
                function mixinHelperMethods(obj, proto) {
                    if (obj['__typename'] === 'user') {
                        var newPrototype = _.clone(Object.getPrototypeOf(obj));
                        Object.assign(newPrototype, proto);
                        Object.setPrototypeOf(obj, newPrototype);
                    }
                }
                entityTransformerContext = new context_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { entityTransformer: function (node) {
                        mixinHelperMethods(node, {
                            getName: function () {
                                return this.name;
                            },
                            getId: function () {
                                return this.id;
                            },
                            getContact: function () {
                                return this.contact;
                            },
                            getJustPhoneNumber: function () {
                                return this.contact.phone;
                            },
                            getCity: function () {
                                return this.contact.address.city;
                            },
                        });
                    } }));
                var empty = new GraphSnapshot_1.GraphSnapshot();
                snapshot = write_1.write(entityTransformerContext, empty, viewerQuery, {
                    user: {
                        __typename: 'user',
                        dispatcher: true,
                        id: '0',
                        name: 'Bob',
                        nickName: 'B',
                        contact: {
                            __typename: 'contact',
                            address: {
                                __typename: 'address',
                                city: 'AA',
                                state: 'AAAA',
                            },
                            phone: 1234,
                        },
                    },
                    driver: {
                        __typename: 'driver',
                        id: '1',
                        name: 'Bear',
                        shipments: [{ id: 0, name: 'portland' }],
                    },
                }).snapshot;
            });
            it("get information through helper methods", function () {
                var result = read_1.read(entityTransformerContext, viewerQuery, snapshot).result;
                expect(result.user.getName()).to.eq('Bob');
                expect(result.user.getId()).to.eq('0');
                expect(result.user.getJustPhoneNumber()).to.eq(1234);
                expect(result.user.getCity()).to.eq('AA');
            });
            it("check helper methods exists", function () {
                expect(Object.getPrototypeOf(snapshot.getNodeData(QueryRootId).user)).to.include.all.keys(['getName', 'getId', 'getJustPhoneNumber', 'getCity']);
            });
            it("check helper method not attached to other entity", function () {
                expect(Object.getPrototypeOf(snapshot.getNodeData(QueryRootId))).to.not.include.all.keys(['getName', 'getId', 'getJustPhoneNumber', 'getCity']);
                expect(Object.getPrototypeOf(snapshot.getNodeData('1'))).to.not.include.all.keys(['getName', 'getId', 'getJustPhoneNumber', 'getCity']);
            });
        });
        describe("mixin additional helper on nested alias query", function () {
            var viewerQuery, entityTransformerContext, snapshot;
            beforeAll(function () {
                viewerQuery = queryWithTypename("\n          query GetUser {\n            User: user {\n              dispatcher\n              id\n              nickName\n              name\n              contact {\n                address {\n                  city\n                  state\n                }\n                phone\n              }\n            }\n            Driver: driver {\n              id\n              name\n              shipments\n            }\n          }\n        ");
                function mixinHelperMethods(obj, proto) {
                    if (obj['__typename'] === 'user') {
                        var newPrototype = _.clone(Object.getPrototypeOf(obj));
                        Object.assign(newPrototype, proto);
                        Object.setPrototypeOf(obj, newPrototype);
                    }
                }
                entityTransformerContext = new context_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { entityTransformer: function (node) {
                        mixinHelperMethods(node, {
                            getName: function () {
                                return this.name;
                            },
                            getId: function () {
                                return this.id;
                            },
                            getContact: function () {
                                return this.contact;
                            },
                            getJustPhoneNumber: function () {
                                return this.contact.phone;
                            },
                            getCity: function () {
                                return this.contact.address.city;
                            },
                        });
                    } }));
                var empty = new GraphSnapshot_1.GraphSnapshot();
                snapshot = write_1.write(entityTransformerContext, empty, viewerQuery, {
                    User: {
                        __typename: 'user',
                        dispatcher: true,
                        id: '0',
                        name: 'Bob',
                        nickName: 'B',
                        contact: {
                            __typename: 'contact',
                            address: {
                                __typename: 'address',
                                city: 'AA',
                                state: 'AAAA',
                            },
                            phone: 1234,
                        },
                    },
                    Driver: {
                        __typename: 'driver',
                        id: '1',
                        name: 'Bear',
                        shipments: [{ id: 0, name: 'portland' }],
                    },
                }).snapshot;
            });
            it("get information through helper methods", function () {
                var result = read_1.read(entityTransformerContext, viewerQuery, snapshot).result;
                expect(result.user.getName()).to.eq('Bob');
                expect(result.user.getId()).to.eq('0');
                expect(result.user.getJustPhoneNumber()).to.eq(1234);
                expect(result.user.getCity()).to.eq('AA');
            });
            it("check helper methods exists", function () {
                expect(Object.getPrototypeOf(snapshot.getNodeData(QueryRootId).user)).to.include.all.keys(['getName', 'getId', 'getJustPhoneNumber', 'getCity']);
            });
            it("check helper method not attached to other entity", function () {
                expect(Object.getPrototypeOf(snapshot.getNodeData(QueryRootId))).to.not.include.all.keys(['getName', 'getId', 'getJustPhoneNumber', 'getCity']);
                expect(Object.getPrototypeOf(snapshot.getNodeData('1'))).to.not.include.all.keys(['getName', 'getId', 'getJustPhoneNumber', 'getCity']);
            });
        });
        describe("freeze an object", function () {
            var viewerQuery, entityTransformerContext, snapshot;
            beforeAll(function () {
                viewerQuery = queryWithTypename("{\n          viewer {\n            id\n            name\n          }\n        }");
                entityTransformerContext = new context_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { entityTransformer: function (node) {
                        Object.freeze(node);
                    } }));
                var empty = new GraphSnapshot_1.GraphSnapshot();
                snapshot = write_1.write(entityTransformerContext, empty, viewerQuery, {
                    viewer: {
                        __typename: 'viewer',
                        id: '0',
                        name: 'Bob',
                    },
                }).snapshot;
            });
            it("check that entity is frozen", function () {
                expect(snapshot.getNodeData(QueryRootId)).to.be.frozen;
                expect(snapshot.getNodeData('0')).to.be.frozen;
            });
        });
        describe("mixing additional helper on parameterized query", function () {
            var viewerQuery, entityTransformerContext, snapshot;
            beforeAll(function () {
                viewerQuery = queryWithTypename("\n        query getViewer($id:ID!) {\n          viewer(id:$id) {\n            id\n            name\n          }\n        }", { id: '4' });
                function mixinHelperMethods(obj, proto) {
                    if (obj['__typename'] === 'viewer') {
                        var newPrototype = _.clone(Object.getPrototypeOf(obj));
                        Object.assign(newPrototype, proto);
                        Object.setPrototypeOf(obj, newPrototype);
                    }
                }
                entityTransformerContext = new context_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { entityTransformer: function (node) {
                        mixinHelperMethods(node, {
                            getName: function () {
                                return this.name;
                            },
                            getId: function () {
                                return this.id;
                            },
                        });
                    } }));
                var empty = new GraphSnapshot_1.GraphSnapshot();
                snapshot = write_1.write(entityTransformerContext, empty, viewerQuery, {
                    viewer: {
                        __typename: 'viewer',
                        name: 'Bob',
                        id: '4',
                    },
                }).snapshot;
            });
            it("get information through helper methods", function () {
                var result = read_1.read(entityTransformerContext, viewerQuery, snapshot).result;
                var name = result.viewer.getName();
                var id = result.viewer.getId();
                expect(name).to.eq('Bob');
                expect(id).to.eq('4');
            });
            it("check helper methods exists", function () {
                var viewerParameterizedId = SnapshotEditor_1.nodeIdForParameterizedValue(QueryRootId, ['viewer'], { id: '4' });
                expect(Object.getPrototypeOf(snapshot.getNodeData(viewerParameterizedId))).to.include.all.keys(['getName', 'getId']);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5VHJhbnNmb3JtYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlbnRpdHlUcmFuc2Zvcm1hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFBeUQ7QUFDekQsMEJBQTRCO0FBRTVCLG1EQUF1RDtBQUN2RCwrREFBOEQ7QUFDOUQsd0RBQXVEO0FBQ3ZELDRFQUF3RjtBQUN4RiwwREFBeUQ7QUFFekQsaURBQTRFO0FBQzVFLDRDQUF1RDtBQUUvQyxJQUFBLDZDQUFzQixDQUFrQjtBQUVoRCxRQUFRLENBQUMsc0JBQXNCLEVBQUU7SUFFL0IsMkJBQTJCLFNBQWlCLEVBQUUsU0FBc0IsRUFBRSxNQUFlO1FBQ25GLElBQU0sWUFBWSxHQUFHLGVBQUssQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELDRCQUFZLFlBQVksSUFBRSxRQUFRLEVBQUUsd0NBQXFCLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFHO0lBQ3JGLENBQUM7SUFFRCxRQUFRLENBQUMsdUJBQXVCLEVBQUU7UUFDaEMsUUFBUSxDQUFDLHVCQUF1QixFQUFFO1lBQ2hDLElBQUksV0FBeUIsRUFBRSx3QkFBc0MsRUFBRSxRQUF1QixDQUFDO1lBQy9GLFNBQVMsQ0FBQztnQkFDUixXQUFXLEdBQUcsaUJBQWlCLENBQUMsa0pBTy9CLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFFaEIsd0JBQXdCLEdBQUcsSUFBSSxzQkFBWSxzQkFDdEMsc0JBQVksSUFDZixpQkFBaUIsRUFBRSxTQUFTLElBQzVCLENBQUM7Z0JBQ0gsSUFBTSxLQUFLLEdBQUcsSUFBSSw2QkFBYSxFQUFFLENBQUM7Z0JBQ2xDLFFBQVEsR0FBRyxhQUFLLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtvQkFDN0QsTUFBTSxFQUFFO3dCQUNOLFVBQVUsRUFBRSxRQUFRO3dCQUNwQixFQUFFLEVBQUUsR0FBRzt3QkFDUCxJQUFJLEVBQUUsS0FBSztxQkFDWjtpQkFDRixDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscUNBQXFDLEVBQUU7Z0JBQ3hDLElBQU0scUJBQXFCLEdBQUcsNENBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDaEcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyx5Q0FBeUMsRUFBRTtZQUNsRCxJQUFJLFdBQXlCLEVBQUUsd0JBQXNDLEVBQUUsUUFBdUIsQ0FBQztZQUMvRixTQUFTLENBQUM7Z0JBQ1IsV0FBVyxHQUFHLGlCQUFpQixDQUFDLGlGQUs5QixDQUFDLENBQUM7Z0JBRUosNEJBQTRCLEdBQVcsRUFBRSxLQUFvQjtvQkFDM0QsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssUUFBUSxFQUFFO3dCQUNsQyxJQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDekQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ25DLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO3FCQUMxQztnQkFDSCxDQUFDO2dCQUVELHdCQUF3QixHQUFHLElBQUksc0JBQVksc0JBQ3RDLHNCQUFZLElBQ2YsaUJBQWlCLEVBQUUsVUFBQyxJQUFnQjt3QkFDbEMsa0JBQWtCLENBQUMsSUFBSSxFQUFFOzRCQUN2QixPQUFPO2dDQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDbkIsQ0FBQzs0QkFDRCxLQUFLO2dDQUNILE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQzs0QkFDakIsQ0FBQzt5QkFDRixDQUFDLENBQUM7b0JBQ0wsQ0FBQyxJQUNELENBQUM7Z0JBQ0gsSUFBTSxLQUFLLEdBQUcsSUFBSSw2QkFBYSxFQUFFLENBQUM7Z0JBQ2xDLFFBQVEsR0FBRyxhQUFLLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtvQkFDN0QsTUFBTSxFQUFFO3dCQUNOLFVBQVUsRUFBRSxRQUFRO3dCQUNwQixFQUFFLEVBQUUsR0FBRzt3QkFDUCxJQUFJLEVBQUUsS0FBSztxQkFDWjtpQkFDRixDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUU7Z0JBQ25DLElBQUEsNEVBQU0sQ0FBMkQ7Z0JBQ3pFLElBQU0sSUFBSSxHQUFJLE1BQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzlDLElBQU0sRUFBRSxHQUFJLE1BQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMvRyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDcEgsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyx5Q0FBeUMsRUFBRTtZQUNsRCxJQUFJLFdBQXlCLEVBQUUsd0JBQXNDLEVBQUUsUUFBdUIsQ0FBQztZQUMvRixTQUFTLENBQUM7Z0JBQ1IsV0FBVyxHQUFHLGlCQUFpQixDQUFDLG1iQXFCL0IsQ0FBQyxDQUFDO2dCQWdCSCw0QkFBNEIsR0FBUSxFQUFFLEtBQW1CO29CQUN2RCxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxNQUFNLEVBQUU7d0JBQ2hDLElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN6RCxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDbkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7cUJBQzFDO2dCQUNILENBQUM7Z0JBRUQsd0JBQXdCLEdBQUcsSUFBSSxzQkFBWSxzQkFDdEMsc0JBQVksSUFDZixpQkFBaUIsRUFBRSxVQUFDLElBQWdCO3dCQUNsQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUU7NEJBQ3ZCLE9BQU87Z0NBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDOzRCQUNuQixDQUFDOzRCQUNELEtBQUs7Z0NBQ0gsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDOzRCQUNqQixDQUFDOzRCQUNELFVBQVU7Z0NBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDOzRCQUN0QixDQUFDOzRCQUNELGtCQUFrQjtnQ0FDaEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzs0QkFDNUIsQ0FBQzs0QkFDRCxPQUFPO2dDQUNMLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDOzRCQUNuQyxDQUFDO3lCQUNGLENBQUMsQ0FBQztvQkFDTCxDQUFDLElBQ0QsQ0FBQztnQkFDSCxJQUFNLEtBQUssR0FBRyxJQUFJLDZCQUFhLEVBQUUsQ0FBQztnQkFDbEMsUUFBUSxHQUFHLGFBQUssQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFO29CQUM3RCxJQUFJLEVBQUU7d0JBQ0osVUFBVSxFQUFFLE1BQU07d0JBQ2xCLFVBQVUsRUFBRSxJQUFJO3dCQUNoQixFQUFFLEVBQUUsR0FBRzt3QkFDUCxJQUFJLEVBQUUsS0FBSzt3QkFDWCxRQUFRLEVBQUUsR0FBRzt3QkFDYixPQUFPLEVBQUU7NEJBQ1AsVUFBVSxFQUFFLFNBQVM7NEJBQ3JCLE9BQU8sRUFBRTtnQ0FDUCxVQUFVLEVBQUUsU0FBUztnQ0FDckIsSUFBSSxFQUFFLElBQUk7Z0NBQ1YsS0FBSyxFQUFFLE1BQU07NkJBQ2Q7NEJBQ0QsS0FBSyxFQUFFLElBQUk7eUJBQ1o7cUJBQ0Y7b0JBQ0QsTUFBTSxFQUFFO3dCQUNOLFVBQVUsRUFBRSxRQUFRO3dCQUNwQixFQUFFLEVBQUUsR0FBRzt3QkFDUCxJQUFJLEVBQUUsTUFBTTt3QkFDWixTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDO3FCQUN6QztpQkFDRixDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUU7Z0JBQ25DLElBQUEsNEVBQU0sQ0FBMkQ7Z0JBQ3pFLE1BQU0sQ0FBRSxNQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxDQUFFLE1BQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLENBQUUsTUFBYyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUQsTUFBTSxDQUFFLE1BQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFO2dCQUNoQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUN2RixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxrREFBa0QsRUFBRTtnQkFDckQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FDdEYsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQzlFLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzNELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsK0NBQStDLEVBQUU7WUFDeEQsSUFBSSxXQUF5QixFQUFFLHdCQUFzQyxFQUFFLFFBQXVCLENBQUM7WUFDL0YsU0FBUyxDQUFDO2dCQUNSLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxpY0FxQi9CLENBQUMsQ0FBQztnQkFnQkgsNEJBQTRCLEdBQVEsRUFBRSxLQUFtQjtvQkFDdkQsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssTUFBTSxFQUFFO3dCQUNoQyxJQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDekQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ25DLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO3FCQUMxQztnQkFDSCxDQUFDO2dCQUVELHdCQUF3QixHQUFHLElBQUksc0JBQVksc0JBQ3RDLHNCQUFZLElBQ2YsaUJBQWlCLEVBQUUsVUFBQyxJQUFnQjt3QkFDbEMsa0JBQWtCLENBQUMsSUFBSSxFQUFFOzRCQUN2QixPQUFPO2dDQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDbkIsQ0FBQzs0QkFDRCxLQUFLO2dDQUNILE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQzs0QkFDakIsQ0FBQzs0QkFDRCxVQUFVO2dDQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQzs0QkFDdEIsQ0FBQzs0QkFDRCxrQkFBa0I7Z0NBQ2hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7NEJBQzVCLENBQUM7NEJBQ0QsT0FBTztnQ0FDTCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzs0QkFDbkMsQ0FBQzt5QkFDRixDQUFDLENBQUM7b0JBQ0wsQ0FBQyxJQUNELENBQUM7Z0JBQ0gsSUFBTSxLQUFLLEdBQUcsSUFBSSw2QkFBYSxFQUFFLENBQUM7Z0JBQ2xDLFFBQVEsR0FBRyxhQUFLLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtvQkFDN0QsSUFBSSxFQUFFO3dCQUNKLFVBQVUsRUFBRSxNQUFNO3dCQUNsQixVQUFVLEVBQUUsSUFBSTt3QkFDaEIsRUFBRSxFQUFFLEdBQUc7d0JBQ1AsSUFBSSxFQUFFLEtBQUs7d0JBQ1gsUUFBUSxFQUFFLEdBQUc7d0JBQ2IsT0FBTyxFQUFFOzRCQUNQLFVBQVUsRUFBRSxTQUFTOzRCQUNyQixPQUFPLEVBQUU7Z0NBQ1AsVUFBVSxFQUFFLFNBQVM7Z0NBQ3JCLElBQUksRUFBRSxJQUFJO2dDQUNWLEtBQUssRUFBRSxNQUFNOzZCQUNkOzRCQUNELEtBQUssRUFBRSxJQUFJO3lCQUNaO3FCQUNGO29CQUNELE1BQU0sRUFBRTt3QkFDTixVQUFVLEVBQUUsUUFBUTt3QkFDcEIsRUFBRSxFQUFFLEdBQUc7d0JBQ1AsSUFBSSxFQUFFLE1BQU07d0JBQ1osU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQztxQkFDekM7aUJBQ0YsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO2dCQUNuQyxJQUFBLDRFQUFNLENBQTJEO2dCQUN6RSxNQUFNLENBQUUsTUFBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sQ0FBRSxNQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxDQUFFLE1BQWMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlELE1BQU0sQ0FBRSxNQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FDdkYsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsa0RBQWtELEVBQUU7Z0JBQ3JELE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQ3RGLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUM5RSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLGtCQUFrQixFQUFFO1lBQzNCLElBQUksV0FBeUIsRUFBRSx3QkFBc0MsRUFBRSxRQUF1QixDQUFDO1lBQy9GLFNBQVMsQ0FBQztnQkFDUixXQUFXLEdBQUcsaUJBQWlCLENBQUMsaUZBSzlCLENBQUMsQ0FBQztnQkFFSix3QkFBd0IsR0FBRyxJQUFJLHNCQUFZLHNCQUN0QyxzQkFBWSxJQUNmLGlCQUFpQixFQUFFLFVBQUMsSUFBZ0I7d0JBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3RCLENBQUMsSUFDRCxDQUFDO2dCQUNILElBQU0sS0FBSyxHQUFHLElBQUksNkJBQWEsRUFBRSxDQUFDO2dCQUNsQyxRQUFRLEdBQUcsYUFBSyxDQUFDLHdCQUF3QixFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUU7b0JBQzdELE1BQU0sRUFBRTt3QkFDTixVQUFVLEVBQUUsUUFBUTt3QkFDcEIsRUFBRSxFQUFFLEdBQUc7d0JBQ1AsSUFBSSxFQUFFLEtBQUs7cUJBQ1o7aUJBQ0YsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFO2dCQUNoQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUN2RCxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsaURBQWlELEVBQUU7WUFDMUQsSUFBSSxXQUF5QixFQUFFLHdCQUFzQyxFQUFFLFFBQXVCLENBQUM7WUFDL0YsU0FBUyxDQUFDO2dCQUNSLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyw0SEFNOUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUVqQiw0QkFBNEIsR0FBVyxFQUFFLEtBQW9CO29CQUMzRCxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxRQUFRLEVBQUU7d0JBQ2xDLElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN6RCxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDbkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7cUJBQzFDO2dCQUNILENBQUM7Z0JBRUQsd0JBQXdCLEdBQUcsSUFBSSxzQkFBWSxzQkFDdEMsc0JBQVksSUFDZixpQkFBaUIsRUFBRSxVQUFDLElBQWdCO3dCQUNsQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUU7NEJBQ3ZCLE9BQU87Z0NBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDOzRCQUNuQixDQUFDOzRCQUNELEtBQUs7Z0NBQ0gsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDOzRCQUNqQixDQUFDO3lCQUNGLENBQUMsQ0FBQztvQkFDTCxDQUFDLElBQ0QsQ0FBQztnQkFDSCxJQUFNLEtBQUssR0FBRyxJQUFJLDZCQUFhLEVBQUUsQ0FBQztnQkFDbEMsUUFBUSxHQUFHLGFBQUssQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFO29CQUM3RCxNQUFNLEVBQUU7d0JBQ04sVUFBVSxFQUFFLFFBQVE7d0JBQ3BCLElBQUksRUFBRSxLQUFLO3dCQUNYLEVBQUUsRUFBRSxHQUFHO3FCQUNSO2lCQUNGLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRTtnQkFDbkMsSUFBQSw0RUFBTSxDQUEyRDtnQkFDekUsSUFBTSxJQUFJLEdBQUksTUFBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDOUMsSUFBTSxFQUFFLEdBQUksTUFBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFO2dCQUNoQyxJQUFNLHFCQUFxQixHQUFHLDRDQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ2hHLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdkgsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==