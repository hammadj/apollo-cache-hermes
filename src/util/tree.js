"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OperationWalkNode = /** @class */ (function () {
    function OperationWalkNode(parsedOperation, parent) {
        this.parsedOperation = parsedOperation;
        this.parent = parent;
    }
    return OperationWalkNode;
}());
/**
 * Walk and run on ParsedQueryNode and the result.
 * This is used to verify result of the read operation.
 */
function walkOperation(rootOperation, result, visitor) {
    // Perform the walk as a depth-first traversal; and unlike the payload walk,
    // we don't bother tracking the path.
    var stack = [new OperationWalkNode(rootOperation, result)];
    while (stack.length) {
        var _a = stack.pop(), parsedOperation = _a.parsedOperation, parent_1 = _a.parent;
        // We consider null nodes to be skippable (and satisfy the walk).
        if (parent_1 === null)
            continue;
        // Fan-out for arrays.
        if (Array.isArray(parent_1)) {
            // Push in reverse purely for ergonomics: they'll be pulled off in order.
            for (var i = parent_1.length - 1; i >= 0; i--) {
                stack.push(new OperationWalkNode(parsedOperation, parent_1[i]));
            }
            continue;
        }
        var fields = [];
        // TODO: Directives?
        for (var fieldName in parsedOperation) {
            fields.push(fieldName);
            var nextParsedQuery = parsedOperation[fieldName].children;
            if (nextParsedQuery) {
                stack.push(new OperationWalkNode(nextParsedQuery, get(parent_1, fieldName)));
            }
        }
        if (fields.length) {
            var shouldStop = visitor(parent_1, fields);
            if (shouldStop)
                return;
        }
    }
}
exports.walkOperation = walkOperation;
function get(value, key) {
    // Remember: arrays are typeof 'object', too.
    return value !== null && typeof value === 'object' ? value[key] : undefined;
}
exports.get = get;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQTtJQUNFLDJCQUNrQixlQUF5QyxFQUN6QyxNQUFrQjtRQURsQixvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7UUFDekMsV0FBTSxHQUFOLE1BQU0sQ0FBWTtJQUNqQyxDQUFDO0lBQ04sd0JBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQztBQU9EOzs7R0FHRztBQUNILHVCQUE4QixhQUF1QyxFQUFFLE1BQThCLEVBQUUsT0FBeUI7SUFFOUgsNEVBQTRFO0lBQzVFLHFDQUFxQztJQUNyQyxJQUFNLEtBQUssR0FBRyxDQUFDLElBQUksaUJBQWlCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFN0QsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFFO1FBQ2IsSUFBQSxnQkFBMEMsRUFBeEMsb0NBQWUsRUFBRSxvQkFBTSxDQUFrQjtRQUNqRCxpRUFBaUU7UUFDakUsSUFBSSxRQUFNLEtBQUssSUFBSTtZQUFFLFNBQVM7UUFFOUIsc0JBQXNCO1FBQ3RCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFNLENBQUMsRUFBRTtZQUN6Qix5RUFBeUU7WUFDekUsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsZUFBZSxFQUFFLFFBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0Q7WUFDRCxTQUFTO1NBQ1Y7UUFFRCxJQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsb0JBQW9CO1FBQ3BCLEtBQUssSUFBTSxTQUFTLElBQUksZUFBZSxFQUFFO1lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsSUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUM1RCxJQUFJLGVBQWUsRUFBRTtnQkFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsUUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1RTtTQUNGO1FBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2pCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDM0MsSUFBSSxVQUFVO2dCQUFFLE9BQU87U0FDeEI7S0FDRjtBQUNILENBQUM7QUFuQ0Qsc0NBbUNDO0FBRUQsYUFBb0IsS0FBVSxFQUFFLEdBQWE7SUFDM0MsNkNBQTZDO0lBQzdDLE9BQU8sS0FBSyxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQzlFLENBQUM7QUFIRCxrQkFHQyJ9