import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { Point } from './point';

export class GeometryHelper {

  static isPrimitiveIntersectingRectangle(primitive: SVGPrimitive, rectangle: Rectangle): boolean {
    const RECTANGLE_TOP_LEFT: Point = rectangle.getTopLeftCorner();
    const RECTANGLE_BOTTOM_RIGHT: Point = rectangle.getBottomRightCorner();
    const PRIMITIVE_TOP_LEFT: Point = primitive.getTopLeftCorner();
    const PRIMITIVE_BOTTOM_RIGHT: Point = primitive.getBottomRightCorner();

    const RECTANGLE_LEFT: number = RECTANGLE_TOP_LEFT.x;
    const RECTANGLE_TOP: number = RECTANGLE_TOP_LEFT.y;
    const RECTANGLE_RIGHT: number = RECTANGLE_BOTTOM_RIGHT.x;
    const RECTANGLE_BOTTOM: number = RECTANGLE_BOTTOM_RIGHT.y;

    const PRIMITIVE_LEFT: number = PRIMITIVE_TOP_LEFT.x;
    const PRIMITIVE_TOP: number = PRIMITIVE_TOP_LEFT.y;
    const PRIMITIVE_RIGHT: number = PRIMITIVE_BOTTOM_RIGHT.x;
    const PRIMITIVE_BOTTOM: number = PRIMITIVE_BOTTOM_RIGHT.y;

    return !(PRIMITIVE_LEFT > RECTANGLE_RIGHT || PRIMITIVE_TOP > RECTANGLE_BOTTOM
            || PRIMITIVE_RIGHT < RECTANGLE_LEFT || PRIMITIVE_BOTTOM < RECTANGLE_TOP);
  }

  static isPointInsideRectangle(point: Point, rectangle: Rectangle): boolean {
    const RECTANGLE_TOP_LEFT: Point = rectangle.getTopLeftCorner();
    const RECTANGLE_BOTTOM_RIGHT: Point = rectangle.getBottomRightCorner();
    return point.x > RECTANGLE_TOP_LEFT.x && point.y > RECTANGLE_TOP_LEFT.y
          && point.x < RECTANGLE_BOTTOM_RIGHT.x && point.y < RECTANGLE_BOTTOM_RIGHT.y;
  }
}
