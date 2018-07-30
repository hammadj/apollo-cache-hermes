"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
var context_1 = require("../../../src/context");
var ParsedQueryNode_1 = require("../../../src/ParsedQueryNode");
var util_1 = require("../../../src/util");
var helpers_1 = require("../../helpers");
describe("parseQuery with parameterized queries", function () {
    var context = new context_1.CacheContext(helpers_1.strictConfig);
    function parseOperation(operationString) {
        var operation = util_1.getOperationOrDie(graphql_tag_1.default(operationString));
        return ParsedQueryNode_1.parseQuery(context, {}, operation.selectionSet);
    }
    it("parses single-field queries", function () {
        expect(parseOperation("{ foo(arg: 1) }")).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode(undefined, undefined, { arg: 1 }),
            },
            variables: new Set(),
        });
    });
    it("parses queries with variables", function () {
        var operation = "\n      query getThings($count: Int) {\n        foo(limit: $count)\n      }\n    ";
        expect(parseOperation(operation)).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode(undefined, undefined, { limit: new ParsedQueryNode_1.VariableArgument('count') }),
            },
            variables: new Set(['count']),
        });
    });
    it("flags ancestors of parameterized fields", function () {
        var operation = "\n      query getThings($count: Int) {\n        foo {\n          bar {\n            baz(limit: $count)\n          }\n        }\n      }\n    ";
        expect(parseOperation(operation)).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode({
                    bar: new ParsedQueryNode_1.ParsedQueryNode({
                        baz: new ParsedQueryNode_1.ParsedQueryNode(undefined, undefined, { limit: new ParsedQueryNode_1.VariableArgument('count') }),
                    }, undefined, undefined, true),
                }, undefined, undefined, true),
            },
            variables: new Set(['count']),
        });
    });
    it("preserves descendants of parameterized fields", function () {
        var operation = "\n      query getThings($count: Int) {\n        foo {\n          bar(limit: $count) {\n            baz\n          }\n        }\n      }\n    ";
        expect(parseOperation(operation)).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode({
                    bar: new ParsedQueryNode_1.ParsedQueryNode({
                        baz: new ParsedQueryNode_1.ParsedQueryNode(),
                    }, undefined, { limit: new ParsedQueryNode_1.VariableArgument('count') }),
                }, undefined, undefined, true),
            },
            variables: new Set(['count']),
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyaXplZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBhcmFtZXRlcml6ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBOEI7QUFFOUIsZ0RBQW9EO0FBQ3BELGdFQUE2RjtBQUU3RiwwQ0FBc0Q7QUFDdEQseUNBQTZDO0FBRTdDLFFBQVEsQ0FBQyx1Q0FBdUMsRUFBRTtJQUVoRCxJQUFNLE9BQU8sR0FBRyxJQUFJLHNCQUFZLENBQUMsc0JBQVksQ0FBQyxDQUFDO0lBQy9DLHdCQUF3QixlQUF1QjtRQUM3QyxJQUFNLFNBQVMsR0FBRyx3QkFBaUIsQ0FBQyxxQkFBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDMUQsT0FBTyw0QkFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxFQUFFLENBQUMsNkJBQTZCLEVBQUU7UUFDaEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkQsV0FBVyxFQUFFO2dCQUNYLEdBQUcsRUFBRSxJQUFJLGlDQUFlLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUMzRDtZQUNELFNBQVMsRUFBRSxJQUFJLEdBQUcsRUFBRTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywrQkFBK0IsRUFBRTtRQUNsQyxJQUFNLFNBQVMsR0FBRyxtRkFJakIsQ0FBQztRQUNGLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxXQUFXLEVBQUU7Z0JBQ1gsR0FBRyxFQUFFLElBQUksaUNBQWUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksa0NBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQzthQUN6RjtZQUNELFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlCLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHlDQUF5QyxFQUFFO1FBQzVDLElBQU0sU0FBUyxHQUFHLCtJQVFqQixDQUFDO1FBQ0YsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNDLFdBQVcsRUFBRTtnQkFDWCxHQUFHLEVBQUUsSUFBSSxpQ0FBZSxDQUFDO29CQUN2QixHQUFHLEVBQUUsSUFBSSxpQ0FBZSxDQUFDO3dCQUN2QixHQUFHLEVBQUUsSUFBSSxpQ0FBZSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxrQ0FBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO3FCQUN6RixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDO2lCQUMvQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDO2FBQy9CO1lBQ0QsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDOUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsK0NBQStDLEVBQUU7UUFDbEQsSUFBTSxTQUFTLEdBQUcsK0lBUWpCLENBQUM7UUFDRixNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDM0MsV0FBVyxFQUFFO2dCQUNYLEdBQUcsRUFBRSxJQUFJLGlDQUFlLENBQUM7b0JBQ3ZCLEdBQUcsRUFBRSxJQUFJLGlDQUFlLENBQWdDO3dCQUN0RCxHQUFHLEVBQUUsSUFBSSxpQ0FBZSxFQUFFO3FCQUMzQixFQUFFLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLGtDQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7aUJBQ3hELEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUM7YUFDL0I7WUFDRCxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM5QixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUVMLENBQUMsQ0FBQyxDQUFDIn0=