"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
var context_1 = require("../../../src/context");
var ParsedQueryNode_1 = require("../../../src/ParsedQueryNode");
var util_1 = require("../../../src/util");
var helpers_1 = require("../../helpers");
describe("parseQuery with static queries", function () {
    var context = new context_1.CacheContext(helpers_1.strictConfig);
    function parseOperation(operationString) {
        var operation = util_1.getOperationOrDie(graphql_tag_1.default(operationString));
        return ParsedQueryNode_1.parseQuery(context, {}, operation.selectionSet);
    }
    it("parses single-field queries", function () {
        expect(parseOperation("{ foo }")).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode(),
            },
            variables: new Set(),
        });
    });
    it("parses queries with nested fields", function () {
        var operation = "{\n      foo {\n        bar { fizz }\n        baz { buzz }\n      }\n    }";
        expect(parseOperation(operation)).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode({
                    bar: new ParsedQueryNode_1.ParsedQueryNode({
                        fizz: new ParsedQueryNode_1.ParsedQueryNode(),
                    }),
                    baz: new ParsedQueryNode_1.ParsedQueryNode({
                        buzz: new ParsedQueryNode_1.ParsedQueryNode(),
                    }),
                }),
            },
            variables: new Set(),
        });
    });
    it("includes a schemaName when a field is aliased", function () {
        expect(parseOperation("{ foo: bar }")).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode(undefined, 'bar'),
            },
            variables: new Set(),
        });
    });
    it("supports multiple aliases of the same field", function () {
        var operation = "{\n      foo: fizz\n      bar: fizz\n      fizz\n    }";
        expect(parseOperation(operation)).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode(undefined, 'fizz'),
                bar: new ParsedQueryNode_1.ParsedQueryNode(undefined, 'fizz'),
                fizz: new ParsedQueryNode_1.ParsedQueryNode(),
            },
            variables: new Set(),
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RhdGljLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQThCO0FBRTlCLGdEQUFvRDtBQUNwRCxnRUFBMkU7QUFDM0UsMENBQXNEO0FBQ3RELHlDQUE2QztBQUU3QyxRQUFRLENBQUMsZ0NBQWdDLEVBQUU7SUFFekMsSUFBTSxPQUFPLEdBQUcsSUFBSSxzQkFBWSxDQUFDLHNCQUFZLENBQUMsQ0FBQztJQUMvQyx3QkFBd0IsZUFBdUI7UUFDN0MsSUFBTSxTQUFTLEdBQUcsd0JBQWlCLENBQUMscUJBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzFELE9BQU8sNEJBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsRUFBRSxDQUFDLDZCQUE2QixFQUFFO1FBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxXQUFXLEVBQUU7Z0JBQ1gsR0FBRyxFQUFFLElBQUksaUNBQWUsRUFBRTthQUMzQjtZQUNELFNBQVMsRUFBRSxJQUFJLEdBQUcsRUFBRTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxtQ0FBbUMsRUFBRTtRQUN0QyxJQUFNLFNBQVMsR0FBRyw0RUFLaEIsQ0FBQztRQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxXQUFXLEVBQUU7Z0JBQ1gsR0FBRyxFQUFFLElBQUksaUNBQWUsQ0FBQztvQkFDdkIsR0FBRyxFQUFFLElBQUksaUNBQWUsQ0FBQzt3QkFDdkIsSUFBSSxFQUFFLElBQUksaUNBQWUsRUFBRTtxQkFDNUIsQ0FBQztvQkFDRixHQUFHLEVBQUUsSUFBSSxpQ0FBZSxDQUFDO3dCQUN2QixJQUFJLEVBQUUsSUFBSSxpQ0FBZSxFQUFFO3FCQUM1QixDQUFDO2lCQUNILENBQUM7YUFDSDtZQUNELFNBQVMsRUFBRSxJQUFJLEdBQUcsRUFBRTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRTtRQUNsRCxNQUFNLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDaEQsV0FBVyxFQUFFO2dCQUNYLEdBQUcsRUFBRSxJQUFJLGlDQUFlLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQzthQUMzQztZQUNELFNBQVMsRUFBRSxJQUFJLEdBQUcsRUFBRTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRTtRQUNoRCxJQUFNLFNBQVMsR0FBRyx3REFJaEIsQ0FBQztRQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxXQUFXLEVBQUU7Z0JBQ1gsR0FBRyxFQUFFLElBQUksaUNBQWUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO2dCQUMzQyxHQUFHLEVBQUUsSUFBSSxpQ0FBZSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7Z0JBQzNDLElBQUksRUFBRSxJQUFJLGlDQUFlLEVBQUU7YUFDNUI7WUFDRCxTQUFTLEVBQUUsSUFBSSxHQUFHLEVBQUU7U0FDckIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFTCxDQUFDLENBQUMsQ0FBQyJ9