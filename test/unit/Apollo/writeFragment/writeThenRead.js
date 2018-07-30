"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
var Hermes_1 = require("../../../../src/apollo/Hermes");
var CacheContext_1 = require("../../../../src/context/CacheContext");
var schema_1 = require("../../../../src/schema");
var context_1 = require("../../../helpers/context");
var QueryRootId = schema_1.StaticNodeId.QueryRoot;
describe("writeFragment and then readFragment", function () {
    var hermes;
    var readWriteFragment = graphql_tag_1.default("\n    fragment viewer on Viewer {\n      id\n      name\n    }\n    fragment shipment on Shipment {\n      id\n      complete\n      date\n    }\n    fragment viewerPlusShipment on Viewer {\n      ...viewer\n      shipment {\n        ...shipment\n      }\n    }\n  ");
    beforeEach(function () {
        hermes = new Hermes_1.Hermes(new CacheContext_1.CacheContext(context_1.strictConfig));
        hermes.restore((_a = {},
            _a[QueryRootId] = {
                type: 0 /* EntitySnapshot */,
                outbound: [{ id: '123', path: ['viewer'] }],
                data: {
                    justValue: '42',
                },
            },
            _a['123'] = {
                type: 0 /* EntitySnapshot */,
                inbound: [{ id: QueryRootId, path: ['viewer'] }],
                outbound: [{ id: 'shipment0', path: ['shipment'] }],
                data: {
                    id: 123,
                    name: 'Gouda',
                    __typename: 'Viewer',
                },
            },
            _a['shipment0'] = {
                type: 0 /* EntitySnapshot */,
                inbound: [{ id: '123', path: ['shipment'] }],
                data: {
                    id: 'shipment0',
                    complete: false,
                    city: 'Seattle',
                    distance: 100,
                    __typename: 'Shipment',
                },
            },
            _a));
        var _a;
    });
    it("write then read with same fragment", function () {
        hermes.writeFragment({
            id: '123',
            fragmentName: 'viewer',
            fragment: readWriteFragment,
            data: {
                id: 123,
                name: 'Munster',
            },
        });
        expect(hermes.readFragment({
            id: '123',
            fragmentName: 'viewer',
            fragment: readWriteFragment,
        })).to.include({
            id: 123,
            name: 'Munster',
            __typename: 'Viewer',
        });
    });
    it("update nested reference but read with another fragment", function () {
        hermes.writeFragment({
            id: 'shipment0',
            fragmentName: 'shipment',
            fragment: readWriteFragment,
            data: {
                id: 'shipment0',
                complete: true,
                date: '11/11/17',
            },
        });
        expect(hermes.readFragment({
            id: '123',
            fragmentName: 'viewerPlusShipment',
            fragment: readWriteFragment,
        })).to.deep.eq({
            id: 123,
            name: 'Gouda',
            __typename: 'Viewer',
            shipment: {
                id: 'shipment0',
                complete: true,
                date: '11/11/17',
                city: 'Seattle',
                distance: 100,
                __typename: 'Shipment',
            },
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVUaGVuUmVhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndyaXRlVGhlblJlYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBOEI7QUFFOUIsd0RBQXVEO0FBQ3ZELHFFQUFvRTtBQUNwRSxpREFBb0U7QUFDcEUsb0RBQXdEO0FBRWhELElBQUEsNkNBQXNCLENBQWtCO0FBRWhELFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRTtJQUU5QyxJQUFJLE1BQWMsQ0FBQztJQUNuQixJQUFNLGlCQUFpQixHQUFHLHFCQUFHLENBQUMsMlFBZ0I3QixDQUFDLENBQUM7SUFFSCxVQUFVLENBQUM7UUFDVCxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSwyQkFBWSxDQUFDLHNCQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxPQUFPO1lBQ1osR0FBQyxXQUFXLElBQUc7Z0JBQ2IsSUFBSSx3QkFBOEM7Z0JBQ2xELFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUMzQyxJQUFJLEVBQUU7b0JBQ0osU0FBUyxFQUFFLElBQUk7aUJBQ2hCO2FBQ0Y7WUFDRCxTQUFLLEdBQUU7Z0JBQ0wsSUFBSSx3QkFBOEM7Z0JBQ2xELE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNoRCxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDbkQsSUFBSSxFQUFFO29CQUNKLEVBQUUsRUFBRSxHQUFHO29CQUNQLElBQUksRUFBRSxPQUFPO29CQUNiLFVBQVUsRUFBRSxRQUFRO2lCQUNyQjthQUNGO1lBQ0QsZUFBVyxHQUFFO2dCQUNYLElBQUksd0JBQThDO2dCQUNsRCxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxFQUFFO29CQUNKLEVBQUUsRUFBRSxXQUFXO29CQUNmLFFBQVEsRUFBRSxLQUFLO29CQUNmLElBQUksRUFBRSxTQUFTO29CQUNmLFFBQVEsRUFBRSxHQUFHO29CQUNiLFVBQVUsRUFBRSxVQUFVO2lCQUN2QjthQUNGO2dCQUNELENBQUM7O0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsb0NBQW9DLEVBQUU7UUFDdkMsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUNuQixFQUFFLEVBQUUsS0FBSztZQUNULFlBQVksRUFBRSxRQUFRO1lBQ3RCLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsSUFBSSxFQUFFO2dCQUNKLEVBQUUsRUFBRSxHQUFHO2dCQUNQLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDekIsRUFBRSxFQUFFLEtBQUs7WUFDVCxZQUFZLEVBQUUsUUFBUTtZQUN0QixRQUFRLEVBQUUsaUJBQWlCO1NBQzVCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDYixFQUFFLEVBQUUsR0FBRztZQUNQLElBQUksRUFBRSxTQUFTO1lBQ2YsVUFBVSxFQUFFLFFBQVE7U0FDckIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsd0RBQXdELEVBQUU7UUFDM0QsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUNuQixFQUFFLEVBQUUsV0FBVztZQUNmLFlBQVksRUFBRSxVQUFVO1lBQ3hCLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsSUFBSSxFQUFFO2dCQUNKLEVBQUUsRUFBRSxXQUFXO2dCQUNmLFFBQVEsRUFBRSxJQUFJO2dCQUNkLElBQUksRUFBRSxVQUFVO2FBQ2pCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDekIsRUFBRSxFQUFFLEtBQUs7WUFDVCxZQUFZLEVBQUUsb0JBQW9CO1lBQ2xDLFFBQVEsRUFBRSxpQkFBaUI7U0FDNUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDYixFQUFFLEVBQUUsR0FBRztZQUNQLElBQUksRUFBRSxPQUFPO1lBQ2IsVUFBVSxFQUFFLFFBQVE7WUFDcEIsUUFBUSxFQUFFO2dCQUNSLEVBQUUsRUFBRSxXQUFXO2dCQUNmLFFBQVEsRUFBRSxJQUFJO2dCQUNkLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsU0FBUztnQkFDZixRQUFRLEVBQUUsR0FBRztnQkFDYixVQUFVLEVBQUUsVUFBVTthQUN2QjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUwsQ0FBQyxDQUFDLENBQUMifQ==