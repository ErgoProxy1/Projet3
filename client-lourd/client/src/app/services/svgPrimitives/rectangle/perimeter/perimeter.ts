import { Color } from 'src/app/services/utils/color';
import { PrimitiveType, StrokeType } from 'src/app/services/utils/constantsAndEnums';
import { Point } from 'src/app/services/utils/point';
import { SVGPrimitive } from '../../svgPrimitive';
import { Rectangle } from '../rectangle';

export class Perimeter extends Rectangle {
    SELECTABLE = false;
    type = PrimitiveType.Perimeter;

    constructor(position: Point, strokeColor: Color = Color.BLACK) {
        super(Color.WHITE, strokeColor, 2, StrokeType.Outline, position);
    }
    createCopy(primitive: SVGPrimitive): Rectangle {
      return primitive as Rectangle;
    }
    resize(corner1: Point, corner2: Point): void {
      super.resize(corner1, corner2, false, true);
    }
}
