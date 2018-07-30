"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var graphql_tag_1 = require("graphql-tag");
var src_1 = require("../../../../src");
var helpers_1 = require("../../../helpers");
describe("context.CacheContext", function () {
    describe("entityUpdaters with updateListOfReference during optimistic change", function () {
        var dashboardQuery = helpers_1.query("\n      query dashboard {\n        dashboard {\n          name\n          id\n          users(active: true) {\n            __typename\n            id\n            name\n            active\n            currentDashboard { id }\n          }\n        }\n      }\n    ");
        var getUserQuery = helpers_1.query("\n      query getUser($id: ID!) {\n        user(id: $id) {\n          __typename\n          id\n          name\n          active\n          currentDashboard { id }\n        }\n      }\n    ");
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
                    readFragment: graphql_tag_1.default("\n              fragment dashboard on Dashboard {\n                users(active: $active) {\n                  __typename\n                  id\n                  name\n                  active\n                  currentDashboard { id }\n                }\n              }\n            "),
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
        it("triggers updaters when an entity is added", function () {
            cache.transaction(
            /** changeIdOrCallback */ 'opt0', function (transaction) {
                transaction.write(tslib_1.__assign({}, getUserQuery, { variables: { id: 4 } }), {
                    user: {
                        __typename: 'User',
                        id: 3,
                        name: 'Cheddar',
                        active: true,
                        currentDashboard: { id: 'dash0' },
                    },
                });
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
            cache.transaction(
            /** changeIdOrCallback */ 'opt1', function (transaction) {
                transaction.write(dashboardQuery, {
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
            cache.transaction(
            /** changeIdOrCallback */ 'opt2', function (transaction) {
                transaction.write(tslib_1.__assign({}, getUserQuery, { variables: { id: 2 } }), {
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
            expect(cache.read(dashboardQuery, /* optimistic */ true).result).to.deep.eq({
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
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5VXBkYXRlcnNXaXRoVXBkYXRlTGlzdE9mUmVmZXJlbmNlc0luT3B0aW1pc3RpY0NoYW5nZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVudGl0eVVwZGF0ZXJzV2l0aFVwZGF0ZUxpc3RPZlJlZmVyZW5jZXNJbk9wdGltaXN0aWNDaGFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQThCO0FBRTlCLHVDQUF3QztBQUV4Qyw0Q0FBdUQ7QUFFdkQsUUFBUSxDQUFDLHNCQUFzQixFQUFFO0lBQy9CLFFBQVEsQ0FBQyxvRUFBb0UsRUFBRTtRQUU3RSxJQUFNLGNBQWMsR0FBRyxlQUFLLENBQUMseVFBYzVCLENBQUMsQ0FBQztRQUVILElBQU0sWUFBWSxHQUFHLGVBQUssQ0FBQywrTEFVMUIsQ0FBQyxDQUFDO1FBRUgsSUFBTSxjQUFjLEdBQWdDO1lBQ2xELElBQUksWUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVE7Z0JBQzVCLElBQU0sVUFBVSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUN2QyxJQUFNLFVBQVUsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDL0MsSUFBSSxVQUFVLEtBQUssVUFBVTtvQkFBRSxPQUFPO2dCQUV0QyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7Z0JBQ25GLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFFNUMsU0FBUyxDQUFDLHNCQUFzQixDQUM5QixXQUFXLEVBQ1gsQ0FBQyxPQUFPLENBQUMsRUFDVDtvQkFDRSxhQUFhLEVBQUUscUJBQUcsQ0FBQyw0RkFJbEIsQ0FB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