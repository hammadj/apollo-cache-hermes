"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
var util_1 = require("../../../src/apollo/util");
var context_1 = require("../../../src/context");
var ParsedQueryNode_1 = require("../../../src/ParsedQueryNode");
var helpers_1 = require("../../helpers");
describe("ParsedQueryNode.expandVariables", function () {
    var context = new context_1.CacheContext(helpers_1.strictConfig);
    function makeFieldMap(query) {
        return new context_1.QueryInfo(context, util_1.buildRawOperationFromQuery(graphql_tag_1.default(query))).parsed;
    }
    it("handles static queries", function () {
        var map = makeFieldMap("\n      query stuff {\n        foo(limit: 5) {\n          bar(tag: \"hello\")\n        }\n        baz(thing: null)\n      }\n    ");
        expect(ParsedQueryNode_1.expandVariables(map, undefined)).to.deep.eq({
            foo: new ParsedQueryNode_1.ParsedQueryNode({
                bar: new ParsedQueryNode_1.ParsedQueryNode(undefined, undefined, { tag: 'hello' }),
            }, undefined, { limit: 5 }, true),
            baz: new ParsedQueryNode_1.ParsedQueryNode(undefined, undefined, { thing: null }),
        });
    });
    it("replaces top level variables", function () {
        var map = makeFieldMap("\n      query stuff($foo: ID!, $bar: String) {\n        thing(a: $foo, b: $bar)\n      }\n    ");
        expect(ParsedQueryNode_1.expandVariables(map, { foo: 123, bar: 'ohai' })).to.deep.eq({
            thing: new ParsedQueryNode_1.ParsedQueryNode(undefined, undefined, { a: 123, b: 'ohai' }),
        });
    });
    it("replaces top level variables of nested fields", function () {
        var map = makeFieldMap("\n      query stuff($foo: ID!, $bar: String) {\n        one {\n          two(a: $foo) {\n            three {\n              four(b: $bar)\n            }\n          }\n        }\n      }\n    ");
        expect(ParsedQueryNode_1.expandVariables(map, { foo: 123, bar: 'ohai' })).to.deep.eq({
            one: new ParsedQueryNode_1.ParsedQueryNode({
                two: new ParsedQueryNode_1.ParsedQueryNode({
                    three: new ParsedQueryNode_1.ParsedQueryNode({
                        four: new ParsedQueryNode_1.ParsedQueryNode(undefined, undefined, { b: 'ohai' }),
                    }, undefined, undefined, true),
                }, undefined, { a: 123 }, true),
            }, undefined, undefined, true),
        });
    });
    it("replaces nested variables", function () {
        var map = makeFieldMap("\n      query stuff($foo: ID!, $bar: String) {\n        thing(one: { two: $bar, three: [1, 2, $foo] })\n      }\n    ");
        expect(ParsedQueryNode_1.expandVariables(map, { foo: 123, bar: 'ohai' })).to.deep.eq({
            thing: new ParsedQueryNode_1.ParsedQueryNode(undefined, undefined, { one: { two: 'ohai', three: [1, 2, 123] } }),
        });
    });
    it("asserts that variables are provided when passed undefined", function () {
        var map = makeFieldMap("\n      query stuff($foo: ID!, $bar: String) {\n        thing(a: $foo, b: $bar)\n      }\n    ");
        expect(function () {
            ParsedQueryNode_1.expandVariables(map, undefined);
        }).to.throw(/\$(foo|bar)/);
    });
    it("asserts that variables are provided", function () {
        var map = makeFieldMap("\n      query stuff($foo: ID!, $bar: String) {\n        thing(a: $foo, b: $bar)\n      }\n    ");
        expect(function () {
            ParsedQueryNode_1.expandVariables(map, { foo: 123 });
        }).to.throw(/\$bar/);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kVmFyaWFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXhwYW5kVmFyaWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQThCO0FBRTlCLGlEQUFzRTtBQUN0RSxnREFBK0Q7QUFDL0QsZ0VBQWdGO0FBRWhGLHlDQUE2QztBQUU3QyxRQUFRLENBQUMsaUNBQWlDLEVBQUU7SUFFMUMsSUFBTSxPQUFPLEdBQUcsSUFBSSxzQkFBWSxDQUFDLHNCQUFZLENBQUMsQ0FBQztJQUUvQyxzQkFBc0IsS0FBYTtRQUNqQyxPQUFPLElBQUksbUJBQVMsQ0FBQyxPQUFPLEVBQUUsaUNBQTBCLENBQUMscUJBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQy9FLENBQUM7SUFFRCxFQUFFLENBQUMsd0JBQXdCLEVBQUU7UUFDM0IsSUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLG1JQU94QixDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsaUNBQWUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqRCxHQUFHLEVBQUUsSUFBSSxpQ0FBZSxDQUFhO2dCQUNuQyxHQUFHLEVBQUUsSUFBSSxpQ0FBZSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUM7YUFDakUsRUFBRSxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDO1lBQ2pDLEdBQUcsRUFBRSxJQUFJLGlDQUFlLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUNoRSxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw4QkFBOEIsRUFBRTtRQUNqQyxJQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsZ0dB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