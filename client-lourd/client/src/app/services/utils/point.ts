import { MathUtils } from './mathUtils';

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static copyPoint(point: Point): Point {
    return new Point(point.x, point.y);
  }

  static isSamePoint(pointA: Point, pointB: Point): boolean {
    return( Math.round(pointA.x) === Math.round(pointB.x) &&
        Math.round(pointA.y) === Math.round(pointB.y));
  }

  static sumPoints(point1: Point, point2: Point): Point {
    return new Point(point1.x + point2.x, point1.y + point2.y);
  }

  static substractPoints(point1: Point, point2: Point): Point {
    return new Point(point1.x - point2.x, point1.y - point2.y);
  }

  addPoint(point: Point): void {
    this.x += point.x;
    this.y += point.y;
  }

  substractPoint(point: Point): void {
    this.x -= point.x;
    this.y -= point.y;
  }

  addXY(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  multiply(factor: number): void {
    this.x *= factor;
    this.y *= factor;
  }

  toString(): string {
    return `${this.x},${this.y} `;
  }

  roundToNearestMultipleOf(value: number) {
    this.x = MathUtils.roundToNearestMultipleOf(this.x, value);
    this.y = MathUtils.roundToNearestMultipleOf(this.y, value);
  }
}
