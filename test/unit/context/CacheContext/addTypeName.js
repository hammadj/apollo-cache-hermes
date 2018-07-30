"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var graphql_tag_1 = require("graphql-tag");
var CacheContext_1 = require("../../../../src/context/CacheContext");
var helpers_1 = require("../../../helpers");
describe("context.CacheContext", function () {
    describe("addTypename", function () {
        function transformDocument(context, operation) {
            return context.parseOperation({
                rootId: 'abc',
                document: context.transformDocument(graphql_tag_1.default(operation)),
            });
        }
        function fieldNames(selectionSet) {
            var names = [];
            try {
                for (var _a = tslib_1.__values(selectionSet.selections), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var selection = _b.value;
                    if (selection.kind !== 'Field')
                        continue;
                    names.push(selection.name.value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return names;
            var e_1, _c;
        }
        it("does not inject __typename by default", function () {
            var context = new CacheContext_1.CacheContext(helpers_1.strictConfig);
            var parsed = transformDocument(context, "{\n        foo {\n          bar { a b }\n        }\n      }");
            var rootSelection = parsed.info.operation.selectionSet;
            expect(fieldNames(rootSelection)).to.have.members(['foo']);
            var fooSelection = rootSelection.selections[0].selectionSet;
            expect(fieldNames(fooSelection)).to.have.members(['bar']);
            var barSelection = fooSelection.selections.find(function (s) { return s.name.value === 'bar'; }).selectionSet;
            expect(fieldNames(barSelection)).to.have.members(['a', 'b']);
        });
        it("injects __typename into parsed queries", function () {
            var context = new CacheContext_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { addTypename: true }));
            var parsed = transformDocument(context, "{\n        foo {\n          bar { a b }\n        }\n      }");
            var rootSelection = parsed.info.operation.selectionSet;
            expect(fieldNames(rootSelection)).to.have.members(['foo']);
            var fooSelection = rootSelection.selections[0].selectionSet;
            expect(fieldNames(fooSelection)).to.have.members(['__typename', 'bar']);
            var barSelection = fooSelection.selections.find(function (s) { return s.name.value === 'bar'; }).selectionSet;
            expect(fieldNames(barSelection)).to.have.members(['__typename', 'a', 'b']);
        });
        it("injects __typename into fragments", function () {
            var context = new CacheContext_1.CacheContext(tslib_1.__assign({}, helpers_1.strictConfig, { addTypename: true }));
            var parsed = transformDocument(context, "\n        query stuff {\n          foo {\n            __typename\n            ...fullFoo\n          }\n        }\n\n        fragment fullFoo on Foo { bar }\n      ");
            var rootSelection = parsed.info.operation.selectionSet;
            expect(fieldNames(rootSelection)).to.have.members(['foo']);
            var fooSelection = rootSelection.selections[0].selectionSet;
            expect(fieldNames(fooSelection)).to.have.members(['__typename']);
            var fullFooSelection = parsed.info.fragmentMap['fullFoo'].selectionSet;
            expect(fieldNames(fullFooSelection)).to.have.members(['__typename', 'bar']);
        });
        it("injects __typename into inline fragments", function () {
            var context = new CacheContext_1.CacheContext(tslib_1.__assign({}, helpers_1.silentConfig, { addTypename: true }));
            var parsed = transformDocument(context, "{\n        asdf {\n        ... on Foo { a }\n        ... on Bar { b }\n          }\n      }");
            var rootSelection = parsed.info.operation.selectionSet;
            expect(fieldNames(rootSelection)).to.have.members(['asdf']);
            var asdfSelection = rootSelection.selections[0].selectionSet;
            expect(fieldNames(asdfSelection)).to.have.members(['__typename']);
            var fooSelection = asdfSelection.selections[0].selectionSet;
            expect(fieldNames(fooSelection)).to.have.members(['__typename', 'a']);
            var barSelection = asdfSelection.selections[1].selectionSet;
            expect(fieldNames(barSelection)).to.have.members(['__typename', 'b']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkVHlwZU5hbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhZGRUeXBlTmFtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwyQ0FBOEI7QUFFOUIscUVBQW9FO0FBQ3BFLDRDQUE4RDtBQUU5RCxRQUFRLENBQUMsc0JBQXNCLEVBQUU7SUFDL0IsUUFBUSxDQUFDLGFBQWEsRUFBRTtRQUN0QiwyQkFBMkIsT0FBcUIsRUFBRSxTQUFpQjtZQUNqRSxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUM7Z0JBQzVCLE1BQU0sRUFBRSxLQUFLO2dCQUNiLFFBQVEsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMscUJBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNwRCxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsb0JBQW9CLFlBQThCO1lBQ2hELElBQU0sS0FBSyxHQUFHLEVBQWMsQ0FBQzs7Z0JBQzdCLEtBQXdCLElBQUEsS0FBQSxpQkFBQSxZQUFZLENBQUMsVUFBVSxDQUFBLGdCQUFBO29CQUExQyxJQUFNLFNBQVMsV0FBQTtvQkFDbEIsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLE9BQU87d0JBQUUsU0FBUztvQkFDekMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNsQzs7Ozs7Ozs7O1lBQ0QsT0FBTyxLQUFLLENBQUM7O1FBQ2YsQ0FBQztRQUVELEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRTtZQUMxQyxJQUFNLE9BQU8sR0FBRyxJQUFJLDJCQUFZLENBQUMsc0JBQVksQ0FBQyxDQUFDO1lBQy9DLElBQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sRUFBRSw2REFJeEMsQ0FBQyxDQUFDO1lBRUosSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FB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