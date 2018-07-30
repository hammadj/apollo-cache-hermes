"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
var context_1 = require("../../../src/context");
var ParsedQueryNode_1 = require("../../../src/ParsedQueryNode");
var util_1 = require("../../../src/util");
var helpers_1 = require("../../helpers");
describe("parseQuery for queries with fragments", function () {
    var context = new context_1.CacheContext(helpers_1.strictConfig);
    function parseOperation(operationString) {
        var document = graphql_tag_1.default(operationString);
        var operation = util_1.getOperationOrDie(document);
        var FragmentMap = util_1.fragmentMapForDocument(document);
        return ParsedQueryNode_1.parseQuery(context, FragmentMap, operation.selectionSet);
    }
    it("parses queries with static fragments", function () {
        var operation = "\n      query getThings {\n        foo { ...aFoo }\n      }\n\n      fragment aFoo on Foo {\n        id\n        name\n      }\n    ";
        expect(parseOperation(operation)).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode({
                    id: new ParsedQueryNode_1.ParsedQueryNode(),
                    name: new ParsedQueryNode_1.ParsedQueryNode(),
                }),
            },
            variables: new Set(),
        });
    });
    it("parses queries with overlapping fragments", function () {
        var operation = "\n      query getThings {\n        foo {\n          ...smallFoo\n          ...bigFoo\n        }\n      }\n\n      fragment smallFoo on Foo {\n        id\n      }\n\n      fragment bigFoo on Foo {\n        id\n        name\n      }\n    ";
        expect(parseOperation(operation)).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode({
                    id: new ParsedQueryNode_1.ParsedQueryNode(),
                    name: new ParsedQueryNode_1.ParsedQueryNode(),
                }),
            },
            variables: new Set(),
        });
    });
    it("parses fragments with parameterized fields", function () {
        var operation = "\n      query getThings {\n        foo { ...aFoo }\n      }\n\n      fragment aFoo on Foo {\n        bar(extra: true) {\n          baz\n        }\n      }\n    ";
        expect(parseOperation(operation)).to.deep.eq({
            parsedQuery: {
                foo: new ParsedQueryNode_1.ParsedQueryNode({
                    bar: new ParsedQueryNode_1.ParsedQueryNode({
                        baz: new ParsedQueryNode_1.ParsedQueryNode(),
                    }, undefined, { extra: true }),
                }, undefined, undefined, true),
            },
            variables: new Set(),
        });
    });
    it("parses fragments with variables", function () {
        var operation = "\n      query getThings($count: Int) {\n        foo { ...aFoo }\n      }\n\n      fragment aFoo on Foo {\n        bar(limit: $count) {\n          baz\n        }\n      }\n    ";
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
    it("complains if fragments are not declared", function () {
        var operation = "\n      query getThings {\n        foo { ...aFoo }\n      }\n    ";
        expect(function () {
            parseOperation(operation);
        }).to.throw(/aFoo/i);
    });
    it("complains if parameters do not match", function () {
        var operation = "\n      query getThings {\n        foo {\n          ...fooOne\n          ...fooTwo\n        }\n      }\n\n      fragment fooOne on Foo {\n        bar(limit: 1)\n      }\n\n      fragment fooTwo on Foo {\n        bar(limit: 2)\n      }\n    ";
        expect(function () {
            parseOperation(operation);
        }).to.throw(/foo\.bar/i);
    });
    it("complains if aliases do not match", function () {
        var operation = "\n      query getThings {\n        foo {\n          ...fooOne\n          ...fooTwo\n        }\n      }\n\n      fragment fooOne on Foo {\n        bar: fizz\n      }\n\n      fragment fooTwo on Foo {\n        bar: buzz\n      }\n    ";
        expect(function () {
            parseOperation(operation);
        }).to.throw(/foo\.bar/i);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhZ21lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZnJhZ21lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQThCO0FBRTlCLGdEQUFvRDtBQUNwRCxnRUFBNkY7QUFFN0YsMENBQThFO0FBQzlFLHlDQUE2QztBQUU3QyxRQUFRLENBQUMsdUNBQXVDLEVBQUU7SUFFaEQsSUFBTSxPQUFPLEdBQUcsSUFBSSxzQkFBWSxDQUFDLHNCQUFZLENBQUMsQ0FBQztJQUMvQyx3QkFBd0IsZUFBdUI7UUFDN0MsSUFBTSxRQUFRLEdBQUcscUJBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN0QyxJQUFNLFNBQVMsR0FBRyx3QkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFNLFdBQVcsR0FBRyw2QkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyRCxPQUFPLDRCQUFVLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRTtRQUN6QyxJQUFNLFNBQVMsR0FBRyxzSUFTakIsQ0FBQztRQUNGLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxXQUFXLEVBQUU7Z0JBQ1gsR0FBRyxFQUFFLElBQUksaUNBQWUsQ0FBQztvQkFDdkIsRUFBRSxFQUFFLElBQUksaUNBQWUsRUFBRTtvQkFDekIsSUFBSSxFQUFFLElBQUksaUNBQWUsRUFBRTtpQkFDNUIsQ0FBQzthQUNIO1lBQ0QsU0FBUyxFQUFFLElBQUksR0FBRyxFQUFFO1NBQ3JCLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDJDQUEyQyxFQUFFO1FBQzlDLElBQU0sU0FBUyxHQUFHLDhPQWdCakIsQ0FBQztRQUNGLE1BQU0sQ0FBQyxjQUFj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