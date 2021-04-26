import { Color } from '../../utils/color';
import { GridAlignment, HandleType, ORIGIN, PrimitiveType, StrokeType } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Handle } from '../ellipse/handle/handle';
import { Shape } from '../shape/shape';
import { SVGPrimitive } from '../svgPrimitive';

export class Rectangle extends Shape {
  position: Point; // coin superieur gauche du rectangle
  type = PrimitiveType.Rectangle;

  constructor(fillColor: Color, strokeColor: Color, strokeWidth: number, strokeType: StrokeType,
              position: Point, width: number = 0, height: number = 0) {
    super(fillColor, strokeColor, strokeWidth, strokeType, new Point(position.x + width / 2.0, position.y + height / 2.0), width, height);
    this.position = position;
  }

  static createCopy(primitive: SVGPrimitive): Rectangle {
    const rectangle: Rectangle = primitive as Rectangle;
    const newRectangle: Rectangle = new Rectangle(Color.copyColor(rectangle.fillColor), Color.copyColor(rectangle.strokeColor),
      rectangle.strokeWidth, rectangle.strokeType, Point.copyPoint(rectangle.position), rectangle.width, rectangle.height);
    newRectangle.absoluteHeight = rectangle.absoluteHeight;
    newRectangle.absoluteWidth = rectangle.absoluteWidth;
    newRectangle.corner1 = Point.copyPoint(rectangle.corner1);
    newRectangle.corner2 = Point.copyPoint(rectangle.corner2);
    newRectangle.center = Point.copyPoint(rectangle.center);
    newRectangle.topLeftCorner = Point.copyPoint(rectangle.topLeftCorner);
    newRectangle.bottomRightCorner = Point.copyPoint(rectangle.bottomRightCorner);
    newRectangle.rotationGroupOrigin = Point.copyPoint(rectangle.rotationGroupOrigin);
    newRectangle.rotationCenterOrigin = Point.copyPoint(rectangle.rotationCenterOrigin);
    newRectangle.isRegular = rectangle.isRegular;

    newRectangle.rotation = rectangle.rotation;
    newRectangle.scaleX = rectangle.scaleX;
    newRectangle.scaleY = rectangle.scaleY;
    newRectangle.transformations = rectangle.transformations;

    return newRectangle;
  }

  resize(corner1: Point, corner2: Point, isRegular: boolean, updateCorners = false): void {
    super.resize(corner1, corner2, isRegular, updateCorners);
    this.position = Point.copyPoint(this.center);
    this.position.addXY(-this.getAbsoluteWidth() / 2.0, -this.getAbsoluteHeight() / 2.0);
  }

  setNewDimension(width: number, height: number): void {
    this.setWidth(width);
    this.setHeight(height);
  }

  copy(): Rectangle {
    return Rectangle.createCopy(this);
  }

  setCenter(position: Point): void {
    this.position = new Point(position.x - this.width / 2.0, position.y - this.height / 2.0);
    this.corner1 = this.position;
    this.updateCorners();
  }

  setPosition(position: Point): void {
    this.position = Point.copyPoint(position);
    this.corner1 = this.position;
    this.updateCorners();
  }

  move(translation: Point): void {
    this.resize(Point.sumPoints(this.corner1, translation), Point.sumPoints(this.corner2, translation), this.isRegular);
    this.moveCorners(translation);
  }

  getCenterLeftPosition(): Point {
    return new Point(this.topLeftCorner.x, this.center.y);
  }

  getCenterRightPosition(): Point {
    return new Point(this.bottomRightCorner.x, this.center.y);
  }

  getTopCenterPosition(): Point {
    return new Point(this.center.x, this.topLeftCorner.y);
  }

  getBottomCenterPosition(): Point {
    return new Point(this.center.x, this.bottomRightCorner.y);
  }

  getTopRightCorner(): Point {
    return new Point(this.bottomRightCorner.x, this.topLeftCorner.y);
  }

  getBottomLeftCorner(): Point {
    return new Point(this.topLeftCorner.x, this.bottomRightCorner.y);
  }

  getAlignmentPosition(alignment: GridAlignment): Point {
    switch (alignment) {
      case GridAlignment.TopLeft:
        return this.getTopLeftCorner();
      case GridAlignment.CenterLeft:
        return this.getCenterLeftPosition();
      case GridAlignment.BottomLeft:
        return this.getBottomLeftCorner();
      case GridAlignment.BottomCenter:
        return this.getBottomCenterPosition();
      case GridAlignment.BottomRight:
        return this.getBottomRightCorner();
      case GridAlignment.CenterRight:
        return this.getCenterRightPosition();
      case GridAlignment.TopRight:
        return this.getTopRightCorner();
      case GridAlignment.TopCenter:
        return this.getTopCenterPosition();
      case GridAlignment.Center:
        return this.getCenter();
      default:
        return Point.copyPoint(ORIGIN);
    }
  }

  scale(translation: Point, scaleFactorX: number, scaleFactorY: number, updateCorners: boolean = false) {
    super.scale(translation, scaleFactorX, scaleFactorY);
    if (updateCorners) {
      this.updateCorners();
    }
  }

  getHandles(): Handle[] {
    const handles: Handle[] = [];
    handles.push(new Handle(this.getTopLeftCorner(), HandleType.TopLeft));
    handles.push(new Handle(this.getCenterLeftPosition(), HandleType.Left));
    handles.push(new Handle(this.getBottomLeftCorner(), HandleType.BottomLeft));
    handles.push(new Handle(this.getBottomCenterPosition(), HandleType.Bottom));
    handles.push(new Handle(this.getBottomRightCorner(), HandleType.BottomRight));
    handles.push(new Handle(this.getCenterRightPosition(), HandleType.Right));
    handles.push(new Handle(this.getTopRightCorner(), HandleType.TopRight));
    handles.push(new Handle(this.getTopCenterPosition(), HandleType.Top));

    return handles;
  }
}
