"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../../../../helpers");
describe("overlapping fragments", function () {
    var snapshot;
    beforeAll(function () {
        var cyclicRefQuery = "\n      query {\n        myDetailedBar {\n          ...DetailedBarFragment\n        }\n        myFooOrBar {\n          # FooFragment defines 'payload' but BarFragment doesn't,\n          # despite 'payload' being a valid field on Bar.\n          ...FooFragment\n          ...BarFragment\n        }\n      }\n\n      fragment FooFragment on Foo {\n        id\n        payload\n      }\n\n      fragment BarFragment on Bar {\n        id\n        fizz\n      }\n\n      fragment DetailedBarFragment on Bar {\n        ...BarFragment\n        payload\n      }\n    ";
        var result = helpers_1.createSnapshot({
            myDetailedBar: {
                id: 'Bar:1',
                fizz: 'buzz',
                payload: 'huge',
            },
            myFooOrBar: {
                id: 'Bar:1',
                fizz: 'buzz',
            },
        }, cyclicRefQuery);
        snapshot = result.snapshot;
    });
    it.skip("writing an entity with overlapping fragment fields should not lose data", function () {
        var bar = snapshot.getNodeData('Bar:1');
        expect(bar.id).to.eq('Bar:1');
        expect(bar.fizz).to.eq('buzz');
        // If this assertion fails, the representation of `Bar:1` in the
        // `myFooOrBar` field is causing its `payload` field to be nullified
        // because `payload` is in the potential selection set, but only for the
        // `Foo` type.
        expect(bar.payload).to.eq('huge');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxhcHBpbmdGcmFnbWVudEZpZWxkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm92ZXJsYXBwaW5nRnJhZ21lbnRGaWVsZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQ0FBcUQ7QUFFckQsUUFBUSxDQUFDLHVCQUF1QixFQUFFO0lBQ2hDLElBQUksUUFBdUIsQ0FBQztJQUM1QixTQUFTLENBQUM7UUFDUixJQUFNLGNBQWMsR0FBRyxrakJBMkJ0QixDQUFDO1FBRUYsSUFBTSxNQUFNLEdBQUcsd0JBQWMsQ0FDM0I7WUFDRSxhQUFhLEVBQUU7Z0JBQ2IsRUFBRSxFQUFFLE9BQU87Z0JBQ1gsSUFBSSxFQUFFLE1BQU07Z0JBQ1osT0FBTyxFQUFFLE1BQU07YUFDaEI7WUFDRCxVQUFVLEVBQUU7Z0JBQ1YsRUFBRSxFQUFFLE9BQU87Z0JBQ1gsSUFBSSxFQUFFLE1BQU07YUFDYjtTQUNGLEVBQ0QsY0FBYyxDQUNmLENBQUM7UUFFRixRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUM3QixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxJQUFJLENBQUMseUVBQXlFLEVBQUU7UUFDakYsSUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUxQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9CLGdFQUFnRTtRQUNoRSxvRUFBb0U7UUFDcEUsd0VBQXdFO1FBQ3hFLGNBQWM7UUFDZCxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyJ9