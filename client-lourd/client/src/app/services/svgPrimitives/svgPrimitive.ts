import { Color } from '../utils/color';
import { ORIGIN, PrimitiveType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';

export abstract class SVGPrimitive {
  readonly type: PrimitiveType;
  selected = false;
  readonly SELECTABLE: boolean;
  protected topLeftCorner: Point = new Point(0, 0);
  protected bottomRightCorner: Point = new Point(0, 0);
  toShow = true;
  fillColor: Color;
  strokeColor: Color;

  protected scaleX = 1;
  protected scaleY = 1;

  protected transformations: string;
  lastTransformation: string;
  indexRotation = 1;
  protected rotation = 0;
  rotationGroupOrigin: Point = Point.copyPoint(ORIGIN);
  rotationCenterOrigin: Point = Point.copyPoint(ORIGIN);
  aroundCenter = false;

  constructor() {
    this.createTransformationsStrings();
  }

  setCorners(topLeftCorner: Point, bottomRightCorner: Point): void {
    if (bottomRightCorner.x > topLeftCorner.x && bottomRightCorner.y > topLeftCorner.y) {
      this.topLeftCorner = topLeftCorner;
      this.bottomRightCorner = bottomRightCorner;
    }
  }

  getTopLeftCorner(): Point {
    return new Point(this.topLeftCorner.x, this.topLeftCorner.y);
  }

  getBottomRightCorner(): Point {
    return new Point(this.bottomRightCorner.x, this.bottomRightCorner.y);
  }

  abstract move(vector: Point): void;

  getScaleX(): number {
    return this.scaleX;
  }

  getScaleY(): number {
    return this.scaleY;
  }

  abstract scale(translation: Point, scaleFactorX: number, scaleFactorY: number): void;

  setRotationGroupOrigin(center: Point) {
    this.rotationGroupOrigin = Point.copyPoint(center);
    this.lastTransformation = this.transformations;
    this.rotationCenterOrigin = this.getCenter();
  }

  rotate(angle: number, aroundCenter: boolean, final: boolean) {
    if (this.SELECTABLE) {
      const rotationCenter: Point = aroundCenter ? this.rotationCenterOrigin : this.rotationGroupOrigin;
      if (!final) {
        this.transformations = `rotate(${angle},${rotationCenter.x},${rotationCenter.y})` + this.transformations;
      } else {
        this.transformations = `rotate(${angle},${rotationCenter.x},${rotationCenter.y}) ${this.lastTransformation}`;
      }
    }
  }

  protected moveCorners(vector: Point): void {
    this.bottomRightCorner.addPoint(Point.copyPoint(vector));
    this.topLeftCorner.addPoint(Point.copyPoint(vector));
  }

  protected createTransformationsStrings(): void {
    const scaleString = `scale(${this.scaleX},${this.scaleY}) `;
    this.transformations = scaleString;
  }

  getCenter(): Point {
    let xCenter: number = (this.bottomRightCorner.x + this.topLeftCorner.x) / 2.0;
    let yCenter: number = (this.bottomRightCorner.y + this.topLeftCorner.y) / 2.0;
    if (xCenter < 0) {
      xCenter = xCenter * (-1);
    }
    if (yCenter < 0) {
      yCenter = yCenter * (-1);
    }
    const point: Point = new Point(xCenter, yCenter);
    return point;
  }
  abstract copy(): SVGPrimitive;
}
