import { Color } from '../../utils/color';
import { PrimitiveType, StrokeType } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { SVGPrimitive } from '../svgPrimitive';

export abstract class Shape extends SVGPrimitive {
  strokeWidth: number;
  strokeType: StrokeType;
  protected width: number;
  protected height: number;
  protected absoluteWidth: number;
  protected absoluteHeight: number;
  center: Point;
  corner1: Point;
  corner2: Point;
  type = PrimitiveType.Abstract;
  SELECTABLE = true;
  selected = false;
  protected isRegular = false;

  constructor(fillColor: Color, strokeColor: Color,
              strokeWidth: number,
              strokeType: StrokeType,
              center: Point,
              width: number,
              height: number) {
    super();
    this.fillColor = Color.copyColor(fillColor);
    this.strokeColor = Color.copyColor(strokeColor);
    this.strokeWidth = strokeWidth;
    this.strokeType = strokeType;
    this.center = center;
    this.corner1 = Point.copyPoint(center);
    this.corner1.addXY(-width / 2.0, -height / 2.0);
    this.corner2 = Point.copyPoint(center);
    this.corner2.addXY(width / 2.0, height / 2.0);
    this.setWidth(width);
    this.setHeight(height);
    switch (strokeType) {
      case StrokeType.FullWithOutline: {
        break;
      }
      case StrokeType.Full: {
        this.strokeColor = Color.copyColor(Color.TRANSPARENT);
        break;
      }
      case StrokeType.Outline: {
        this.fillColor = Color.copyColor(Color.TRANSPARENT);
        break;
      }
    }
  }

  resize(corner1: Point, corner2: Point, isRegular: boolean, updateCorners: boolean = false): void {
    this.isRegular = isRegular;
    const width = corner2.x - corner1.x;
    const height = corner2.y - corner1.y;
    this.center = new Point((corner1.x + corner2.x) / 2.0, (corner1.y + corner2.y) / 2.0);
    this.setWidth(width);
    this.setHeight(height);
    if (isRegular) {
      this.absoluteWidth = this.absoluteHeight = Math.min(this.absoluteWidth, this.absoluteHeight);
      this.width = this.width < 0 ? -this.absoluteWidth : this.absoluteWidth;
      this.height = this.height < 0 ? -this.absoluteHeight : this.absoluteHeight;
      // On deplace le centre pour que la forme soit pres du coin1
      this.center.x -= (width - this.width) / 2.0;
      this.center.y -= (height - this.height) / 2.0;
    }
    this.corner1 = corner1;
    this.corner2 = corner2;
    if (updateCorners) {
      this.updateCorners();
    }
  }

  protected setWidth(width: number): void {
    this.width = width;
    this.absoluteWidth = Math.abs(width);
  }

  protected setHeight(height: number): void {
    this.height = height;
    this.absoluteHeight = Math.abs(height);
  }

  getAbsoluteWidth(): number {
    const num = this.absoluteWidth;
    return num;
  }

  getAbsoluteHeight(): number {
    const num = this.absoluteHeight;
    return num;
  }
  /**
   *  Met a jour les coins de la primitive directement pour eviter de passer par le calcul du boundingbox.
   */
  protected updateCorners(): void {
    const topLeft: Point = new Point(Math.min(this.corner1.x, this.corner1.x + this.width),
    Math.min(this.corner1.y, this.corner1.y + this.height));
    const bottomRight: Point = new Point(Math.max(this.corner1.x, this.corner1.x + this.width),
    Math.max(this.corner1.y, this.corner1.y + this.height));
    if (this.strokeType !== StrokeType.Full) {
      topLeft.addXY(-this.strokeWidth / 2.0, -this.strokeWidth / 2.0);
      bottomRight.addXY(this.strokeWidth / 2.0, this.strokeWidth / 2.0);
    }
    // this.centerOriginSet = false;
    this.setCorners(topLeft, bottomRight);
  }

  scale(translation: Point, scaleFactorX: number, scaleFactorY: number): void {
    this.corner1.x = this.center.x - this.width / 2.0 * scaleFactorX;
    this.corner2.x = this.center.x + this.width / 2.0 * scaleFactorX;
    this.corner1.y = this.center.y - this.height / 2.0 * scaleFactorY;
    this.corner2.y = this.center.y + this.height / 2.0 * scaleFactorY;
    this.resize(this.corner1, this.corner2, this.isRegular);
    this.move(translation);
  }

  setCorners(topLeftCorner: Point, bottomRightCorner: Point): void {
    super.setCorners(topLeftCorner, bottomRightCorner);
  }

  getCenter(): Point {
    return this.center;
  }
}
