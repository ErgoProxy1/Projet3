export class MathUtils {
    static roundToNearestMultipleOf(valueToRound: number, roundingValue: number): number {
        return Math.floor(
            valueToRound / roundingValue) * roundingValue + (valueToRound % roundingValue > roundingValue / 2 ? roundingValue : 0
        );
    }

}
