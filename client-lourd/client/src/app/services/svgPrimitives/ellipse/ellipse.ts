import { Color } from '../../utils/color';
import { PrimitiveType, StrokeType } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Shape } from '../shape/shape';
import { SVGPrimitive } from '../svgPrimitive';

export class Ellipse extends Shape {

  radiusX: number;
  radiusY: number;
  type = PrimitiveType.Ellipse;

  constructor(fillColor: Color, strokeColor: Color, strokeWidth: number, strokeType: StrokeType,
              center: Point, radiusX: number = 0, radiusY: number = 0) {
    super(fillColor, strokeColor, strokeWidth, strokeType, center, 2 * radiusX, 2 * radiusY);
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.center = Point.copyPoint(center);
  }

  static createCopy(primitive: SVGPrimitive): Ellipse {
    const ellipse: Ellipse = primitive as Ellipse;
    const newCenter: Point = Point.copyPoint(ellipse.center);
    const newEllipse: Ellipse = new Ellipse(Color.copyColor(ellipse.fillColor),
      Color.copyColor(ellipse.strokeColor), ellipse.strokeWidth, ellipse.strokeType,
      newCenter, ellipse.radiusX, ellipse.radiusY);
    newEllipse.width = ellipse.width;
    newEllipse.height = ellipse.height;
    newEllipse.absoluteHeight = ellipse.absoluteHeight;
    newEllipse.absoluteWidth = ellipse.absoluteWidth;
    newEllipse.corner1 = Point.copyPoint(ellipse.corner1);
    newEllipse.corner2 = Point.copyPoint(ellipse.corner2);
    newEllipse.topLeftCorner = Point.copyPoint(ellipse.topLeftCorner);
    newEllipse.bottomRightCorner = Point.copyPoint(ellipse.bottomRightCorner);
    newEllipse.isRegular = ellipse.isRegular;

    newEllipse.rotation = ellipse.rotation;
    newEllipse.scaleX = ellipse.scaleX;
    newEllipse.scaleY = ellipse.scaleY;
    newEllipse.transformations = ellipse.transformations;

    return newEllipse;
  }

  resize(corner1: Point, corner2: Point, isRegular: boolean, updateCorners = false): void {
    super.resize(corner1, corner2, isRegular, updateCorners);
    this.radiusX = this.getAbsoluteWidth() / 2.0;
    this.radiusY = this.getAbsoluteHeight() / 2.0;
  }

  getCenter(): Point {
    return this.center;
  }

  copy(): Ellipse {
    return Ellipse.createCopy(this);
  }

  move(translation: Point): void {
    this.resize(Point.sumPoints(this.corner1, translation), Point.sumPoints(this.corner2, translation), this.isRegular);
    this.moveCorners(translation);
  }
}
