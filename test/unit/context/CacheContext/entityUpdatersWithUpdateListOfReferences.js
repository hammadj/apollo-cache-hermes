"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var graphql_tag_1 = require("graphql-tag");
var src_1 = require("../../../../src");
var helpers_1 = require("../../../helpers");
describe("context.CacheContext", function () {
    describe("entityUpdaters with updateListOfReferences", function () {
        var dashboardQuery = helpers_1.query("\n      query dashboard {\n        dashboard {\n          name\n          id\n          users(active: true) {\n            __typename\n            id\n            name\n            active\n            currentDashboard { id }\n          }\n        }\n      }\n    ");
        var getUserQuery = helpers_1.query("\n      query getUser($id: ID!) {\n        user(id: $id) {\n          __typename\n          id\n          name\n          active\n          currentDashboard { id }\n        }\n      }\n    ");
        var fooQuery = helpers_1.query("{ foo }");
        var entityUpdaters = {
            User: function (dataProxy, user, previous) {
                var nextActive = user && user.active;
                var prevActive = previous && previous.active;
                if (nextActive === prevActive)
                    return;
                var dashboardId = user ? user.currentDashboard.id : previous.currentDashboard.id;
                var userId = user ? user.id : previous.id;
                dataProxy.updateListOfReferences(dashboardId, ['users'], {
                    writeFragment: graphql_tag_1.default("\n              fragment user on User {\n                id\n              }\n            "),
                }, {
                    readFragment: graphql_tag_1.default("\n              fragment dashboard on Dashboard {\n                id\n                users(active: $active) {\n                  __typename\n                  id\n                  name\n                  active\n                  currentDashboard { id }\n                }\n              }\n            "),
                }, function (previousUsers) {
                    if (!previousUsers) {
                        return previousUsers;
                    }
                    if (!nextActive) {
                        // Remove users once they're no longer active.
                        return previousUsers.filter(function (activeUser) { return activeUser.id !== userId; });
                    }
                    else if (previousUsers.findIndex(function (u) { return u.id === userId; }) === -1) {
                        // Insert newly active users if they're not already in the list.
                        return tslib_1.__spread(previousUsers, [user]);
                    }
                    else {
                        return previousUsers; // No change.
                    }
                });
            },
            Query: function () { },
        };
        var userUpdater = jest.spyOn(entityUpdaters, 'User');
        var rootUpdater = jest.spyOn(entityUpdaters, 'Query');
        var cache;
        beforeEach(function () {
            cache = new src_1.Cache(tslib_1.__assign({}, helpers_1.strictConfig, { entityUpdaters: entityUpdaters }));
            cache.write(dashboardQuery, {
                dashboard: {
                    name: 'Main Dashboard',
                    id: 'dash0',
                    users: [
                        {
                            __typename: 'User',
                            id: 1,
                            name: 'Gouda',
                            active: true,
                            currentDashboard: { id: 'dash0' },
                        },
                        {
                            __typename: 'User',
                            id: 2,
                            name: 'Munster',
                            active: true,
                            currentDashboard: { id: 'dash0' },
                        },
                    ],
                },
            });
            userUpdater.mockClear();
            rootUpdater.mockClear();
        });
        it("triggers updaters when an entity is first seen", function () {
            cache.write(tslib_1.__assign({}, getUserQuery, { variables: { id: 3 } }), {
                user: {
                    __typename: 'User',
                    id: 3,
                    name: 'Cheddar',
                    active: true,
                    currentDashboard: { id: 'dash0' },
                },
            });
            expect(userUpdater.mock.calls.length).to.eq(1);
            var _a = tslib_1.__read(userUpdater.mock.calls[0], 3), user = _a[1], previous = _a[2];
            expect(user).to.deep.eq({
                __typename: 'User',
                id: 3,
                name: 'Cheddar',
                active: true,
                currentDashboard: {
                    id: 'dash0',
                    name: 'Main Dashboard',
                },
            });
            expect(previous).to.deep.eq(undefined);
        });
        it("triggers updaters when an entity is orphaned", function () {
            cache.write(dashboardQuery, {
                dashboard: {
                    name: 'Main Dashboard',
                    id: 'dash0',
                    users: [
                        {
                            __typename: 'User',
                            id: 2,
                            name: 'Munster',
                            active: true,
                            currentDashboard: {
                                id: 'dash0',
                                name: 'Main Dashboard',
                            },
                        },
                    ],
                },
            });
            expect(userUpdater.mock.calls.length).to.eq(1);
            var _a = tslib_1.__read(userUpdater.mock.calls[0], 3), user = _a[1], previous = _a[2];
            expect(user).to.eq(undefined);
            expect(previous).to.deep.eq({
                __typename: 'User',
                id: 1,
                name: 'Gouda',
                active: true,
                currentDashboard: {
                    id: 'dash0',
                    name: 'Main Dashboard',
                },
            });
        });
        it("respects writes by updaters", function () {
            cache.write(tslib_1.__assign({}, getUserQuery, { variables: { id: 2 } }), {
                user: {
                    __typename: 'User',
                    id: 2,
                    name: 'Munster',
                    active: false,
                    currentDashboard: {
                        id: 'dash0',
                    },
                },
            });
            expect(cache.read(dashboardQuery).result).to.deep.eq({
                dashboard: {
                    name: 'Main Dashboard',
                    id: 'dash0',
                    users: [
                        {
                            __typename: 'User',
                            id: 1,
                            name: 'Gouda',
                            active: true,
                            currentDashboard: {
                                id: 'dash0',
                                name: 'Main Dashboard',
                            },
                        },
                    ],
                },
            });
        });
        it("triggers updates to the root node via the Query type", function () {
            cache.write(fooQuery, { foo: 123 });
            expect(rootUpdater.mock.calls.length).to.eq(1);
            var _a = tslib_1.__read(rootUpdater.mock.calls[0], 3), root = _a[1], previous = _a[2];
            expect(root.foo).to.eq(123);
            expect(previous.foo).to.eq(undefined);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5VXBkYXRlcnNXaXRoVXBkYXRlTGlzdE9mUmVmZXJlbmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVudGl0eVVwZGF0ZXJzV2l0aFVwZGF0ZUxpc3RPZlJlZmVyZW5jZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQThCO0FBRTlCLHVDQUF3QztBQUV4Qyw0Q0FBdUQ7QUFFdkQsUUFBUSxDQUFDLHNCQUFzQixFQUFFO0lBQy9CLFFBQVEsQ0FBQyw0Q0FBNEMsRUFBRTtRQUVyRCxJQUFNLGNBQWMsR0FBRyxlQUFLLENBQUMseVFBYzVCLENBQUMsQ0FBQztRQUVILElBQU0sWUFBWSxHQUFHLGVBQUssQ0FBQywrTEFVMUIsQ0FBQyxDQUFDO1FBQ0gsSUFBTSxRQUFRLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWxDLElBQU0sY0FBYyxHQUFnQztZQUNsRCxJQUFJLFlBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRO2dCQUM1QixJQUFNLFVBQVUsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDdkMsSUFBTSxVQUFVLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQy9DLElBQUksVUFBVSxLQUFLLFVBQVU7b0JBQUUsT0FBTztnQkFFdEMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO2dCQUNuRixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBRTVDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FDOUIsV0FBVyxFQUNYLENBQUMsT0FBTyxDQUFDLEVBQ1Q7b0JBQ0UsYUFBYSxFQUFFLHFCQUFHLENBQUMs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