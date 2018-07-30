"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_utilities_1 = require("apollo-utilities");
var errors_1 = require("./errors");
var util_1 = require("./util");
/**
 * The GraphQL AST is parsed down into a simple tree containing all information
 * the cache requires to read/write associated payloads.
 *
 * A parsed query has no notion of fragments, or other such redirections; they
 * are flattened into query nodes when parsed.
 */
var ParsedQueryNode = /** @class */ (function () {
    function ParsedQueryNode(
    /** Any child fields. */
    children, 
    /**
     * The name of the field (as defined by the schema).
     *
     * Omitted by default (can be inferred by its key in a node map), unless
     * the field is aliased.
     */
    schemaName, 
    /** The map of the field's arguments and their values, if parameterized. */
    args, 
    /**
     * Whether a (transitive) child contains arguments.  This allows us to
     * ignore whole subtrees in some situations if they were completely static.
     * */
    hasParameterizedChildren) {
        this.children = children;
        this.schemaName = schemaName;
        this.args = args;
        this.hasParameterizedChildren = hasParameterizedChildren;
    }
    return ParsedQueryNode;
}());
exports.ParsedQueryNode = ParsedQueryNode;
/**
 * Represents the location a variable should be used as an argument to a
 * parameterized field.
 *
 * Note that variables can occur _anywhere_ within an argument, not just at the
 * top level.
 */
var VariableArgument = /** @class */ (function () {
    function VariableArgument(
    /** The name of the variable. */
    name) {
        this.name = name;
    }
    return VariableArgument;
}());
exports.VariableArgument = VariableArgument;
/**
 * Parsed a GraphQL AST selection into a tree of ParsedQueryNode instances.
 */
function parseQuery(context, fragments, selectionSet) {
    var variables = new Set();
    var parsedQuery = _buildNodeMap(variables, context, fragments, selectionSet);
    if (!parsedQuery) {
        throw new Error("Parsed a query, but found no fields present; it may use unsupported GraphQL features");
    }
    return { parsedQuery: parsedQuery, variables: variables };
}
exports.parseQuery = parseQuery;
/**
 * Recursively builds a mapping of field names to ParsedQueryNodes for the given
 * selection set.
 */
function _buildNodeMap(variables, context, fragments, selectionSet, path) {
    if (path === void 0) { path = []; }
    if (!selectionSet)
        return undefined;
    var nodeMap = Object.create(null);
    try {
        for (var _a = tslib_1.__values(selectionSet.selections), _b = _a.next(); !_b.done; _b = _a.next()) {
            var selection = _b.value;
            if (selection.kind === 'Field') {
                // The name of the field (as defined by the query).
                var name_1 = selection.alias ? selection.alias.value : selection.name.value;
                var children = _buildNodeMap(variables, context, fragments, selection.selectionSet, tslib_1.__spread(path, [name_1]));
                var args = void 0, schemaName = void 0;
                // fields marked as @static are treated as if they are a static field in
                // the schema.  E.g. parameters are ignored, and an alias is considered
                // to be truth.
                if (!util_1.fieldHasStaticDirective(selection)) {
                    args = _buildFieldArgs(variables, selection.arguments);
                    schemaName = selection.alias ? selection.name.value : undefined;
                }
                var hasParameterizedChildren = areChildrenDynamic(children);
                var node = new ParsedQueryNode(children, schemaName, args, hasParameterizedChildren);
                nodeMap[name_1] = _mergeNodes(tslib_1.__spread(path, [name_1]), node, nodeMap[name_1]);
            }
            else if (selection.kind === 'FragmentSpread') {
                var fragment = fragments[selection.name.value];
                if (!fragment) {
                    throw new Error("Expected fragment " + selection.name.value + " to be defined");
                }
                var fragmentMap = _buildNodeMap(variables, context, fragments, fragment.selectionSet, path);
                if (fragmentMap) {
                    for (var name_2 in fragmentMap) {
                        nodeMap[name_2] = _mergeNodes(tslib_1.__spread(path, [name_2]), fragmentMap[name_2], nodeMap[name_2]);
                    }
                }
            }
            else if (context.tracer.warning) {
                context.tracer.warning(selection.kind + " selections are not supported; query may misbehave");
            }
            _collectDirectiveVariables(variables, selection);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Object.keys(nodeMap).length ? nodeMap : undefined;
    var e_1, _c;
}
/**
 * Well, are they?
 */
function areChildrenDynamic(children) {
    if (!children)
        return undefined;
    for (var name_3 in children) {
        var child = children[name_3];
        if (child.hasParameterizedChildren)
            return true;
        if (child.args)
            return true;
        if (child.schemaName)
            return true; // Aliases are dynamic at read time.
    }
    return undefined;
}
exports.areChildrenDynamic = areChildrenDynamic;
/**
 * Build the map of arguments to their natural JS values (or variables).
 */
function _buildFieldArgs(variables, argumentsNode) {
    if (!argumentsNode)
        return undefined;
    var args = {};
    try {
        for (var argumentsNode_1 = tslib_1.__values(argumentsNode), argumentsNode_1_1 = argumentsNode_1.next(); !argumentsNode_1_1.done; argumentsNode_1_1 = argumentsNode_1.next()) {
            var arg = argumentsNode_1_1.value;
            // Mapped name of argument to it JS value
            args[arg.name.value] = _valueFromNode(variables, arg.value);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (argumentsNode_1_1 && !argumentsNode_1_1.done && (_a = argumentsNode_1.return)) _a.call(argumentsNode_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return Object.keys(args).length ? args : undefined;
    var e_2, _a;
}
/**
 * Evaluate a ValueNode and yield its value in its natural JS form.
 */
function _valueFromNode(variables, node) {
    return apollo_utilities_1.valueFromNode(node, function (_a) {
        var value = _a.name.value;
        variables.add(value);
        return new VariableArgument(value);
    });
}
/**
 * Collect the variables in use by any directives on the node.
 */
function _collectDirectiveVariables(variables, node) {
    var directives = node.directives;
    if (!directives)
        return;
    try {
        for (var directives_1 = tslib_1.__values(directives), directives_1_1 = directives_1.next(); !directives_1_1.done; directives_1_1 = directives_1.next()) {
            var directive = directives_1_1.value;
            if (!directive.arguments)
                continue;
            try {
                for (var _a = tslib_1.__values(directive.arguments), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var argument = _b.value;
                    apollo_utilities_1.valueFromNode(argument.value, function (_a) {
                        var value = _a.name.value;
                        variables.add(value);
                    });
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (directives_1_1 && !directives_1_1.done && (_d = directives_1.return)) _d.call(directives_1);
        }
        finally { if (e_4) throw e_4.error; }
    }
    var e_4, _d, e_3, _c;
}
/**
 * Merges two node definitions; mutating `target` to include children from
 * `source`.
 */
function _mergeNodes(path, target, source) {
    if (!source)
        return target;
    if (!apollo_utilities_1.isEqual(target.args, source.args)) {
        throw new errors_1.ConflictingFieldsError("parameterization mismatch", path, [target, source]);
    }
    if (target.schemaName !== source.schemaName) {
        throw new errors_1.ConflictingFieldsError("alias mismatch", path, [target, source]);
    }
    if (!source.children)
        return target;
    if (!target.children) {
        target.children = source.children;
    }
    else {
        for (var name_4 in source.children) {
            target.children[name_4] = _mergeNodes(tslib_1.__spread(path, [name_4]), source.children[name_4], target.children[name_4]);
        }
    }
    if (source.hasParameterizedChildren && !target.hasParameterizedChildren) {
        target.hasParameterizedChildren = true;
    }
    return target;
}
/**
 * Replace all instances of VariableArgument contained within a parsed operation
 * with their actual values.
 *
 * This requires that all variables used are provided in `variables`.
 */
function expandVariables(parsed, variables) {
    return _expandVariables(parsed, variables);
}
exports.expandVariables = expandVariables;
function _expandVariables(parsed, variables) {
    if (!parsed)
        return undefined;
    var newMap = {};
    for (var key in parsed) {
        var node = parsed[key];
        if (node.args || node.hasParameterizedChildren) {
            newMap[key] = new ParsedQueryNode(_expandVariables(node.children, variables), node.schemaName, expandFieldArguments(node.args, variables), node.hasParameterizedChildren);
            // No variables to substitute for this subtree.
        }
        else {
            newMap[key] = node;
        }
    }
    return newMap;
}
exports._expandVariables = _expandVariables;
/**
 * Sub values in for any variables required by a field's args.
 */
function expandFieldArguments(args, variables) {
    return args ? _expandArgument(args, variables) : undefined;
}
exports.expandFieldArguments = expandFieldArguments;
function _expandArgument(arg, variables) {
    if (arg instanceof VariableArgument) {
        if (!variables || !(arg.name in variables)) {
            throw new Error("Expected variable $" + arg.name + " to exist for query");
        }
        return variables[arg.name];
    }
    else if (Array.isArray(arg)) {
        return arg.map(function (v) { return _expandArgument(v, variables); });
    }
    else if (util_1.isObject(arg)) {
        var expanded = {};
        for (var key in arg) {
            expanded[key] = _expandArgument(arg[key], variables);
        }
        return expanded;
    }
    else {
        // TS isn't inferring that arg cannot contain any VariableArgument values.
        return arg;
    }
}
exports._expandArgument = _expandArgument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VkUXVlcnlOb2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUGFyc2VkUXVlcnlOb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUEwRDtBQUcxRCxtQ0FBa0Q7QUFFbEQsK0JBUWdCO0FBS2hCOzs7Ozs7R0FNRztBQUNIO0lBQ0U7SUFDRSx3QkFBd0I7SUFDakIsUUFBd0M7SUFDL0M7Ozs7O09BS0c7SUFDSSxVQUFtQjtJQUMxQiwyRUFBMkU7SUFDcEUsSUFBOEI7SUFDckM7OztTQUdLO0lBQ0Usd0JBQStCO1FBZC9CLGFBQVEsR0FBUixRQUFRLENBQWdDO1FBT3hDLGVBQVUsR0FBVixVQUFVLENBQVM7UUFFbkIsU0FBSSxHQUFKLElBQUksQ0FBMEI7UUFLOUIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUFPO0lBQ3JDLENBQUM7SUFDTixzQkFBQztBQUFELENBQUMsQUFuQkQsSUFtQkM7QUFuQlksMENBQWU7QUFtRDVCOzs7Ozs7R0FNRztBQUNIO0lBQ0U7SUFDRSxnQ0FBZ0M7SUFDaEIsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7SUFDM0IsQ0FBQztJQUNOLHVCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7QUFMWSw0Q0FBZ0I7QUFPN0I7O0dBRUc7QUFDSCxvQkFDRSxPQUFxQixFQUNyQixTQUFzQixFQUN0QixZQUE4QjtJQUU5QixJQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBQ3BDLElBQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMvRSxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0ZBQXNGLENBQUMsQ0FBQztLQUN6RztJQUVELE9BQU8sRUFBRSxXQUFXLGFBQUEsRUFBRSxTQUFTLFdBQUEsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFaRCxnQ0FZQztBQUVEOzs7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