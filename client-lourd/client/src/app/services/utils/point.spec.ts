import { Point } from './point';

describe('Point', () => {

  it('#addPoint should return a new point that is the sum of this point and the other', () => {
    const point1: Point = new Point(10, 20);
    const point2: Point = new Point(30, 40);
    point1.addPoint(point2);
    const expectedSum: Point = new Point(40, 60);
    expect(point1).toEqual(expectedSum);
  });

  it('#sumPoints should return a new point that is the sum of both points', () => {
    const point1: Point = new Point(10, 20);
    const point2: Point = new Point(30, 40);

    const expectedSum: Point = new Point(40, 60);
    expect(Point.sumPoints(point1, point2)).toEqual(expectedSum);
  });

  it('#addXY should return a new point of which the coordinates are the sum of this point\'s coordinates and the other\'s', () => {
    const point: Point = new Point(10, 20);
    point.addXY(-30, -40);
    const expectedSum: Point = new Point(-20, -20);
    expect(point).toEqual(expectedSum);
  });

  it('#copyPoint should return a new point that is the same as the other', () => {
    const point: Point = new Point(10, 20);
    expect(Point.copyPoint(point)).toEqual(point);
  });

  it('Should be the same point', () => {
    let pointA: Point = new Point(0, 0);
    let pointB: Point = new Point(0, 0);
    expect(Point.isSamePoint(pointA, pointB)).toBe(true);

    pointA = new Point(0.45, 0.33);
    pointB = new Point(-0.321, -0.21);
    expect(Point.isSamePoint(pointA, pointB)).toBe(true);

    pointA = new Point(10.45, 10.33);
    pointB = new Point(10.321, 10.21);
    expect(Point.isSamePoint(pointA, pointB)).toBe(true);

    pointA = new Point(9.55, 9.83);
    pointB = new Point(10.321, 10.21);
    expect(Point.isSamePoint(pointA, pointB)).toBe(true);

    pointA = new Point(234, 67767);
    pointB = new Point(234, 67767);
    expect(Point.isSamePoint(pointA, pointB)).toBe(true);
  });

  it('Shouldn\'t be the same point', () => {
    let pointA: Point = new Point(0, 0);
    let pointB: Point = new Point(0, 10);
    expect(Point.isSamePoint(pointA, pointB)).toBe(false);

    pointA = new Point(0.45, 0.33);
    pointB = new Point(-0.821, -0.21);
    expect(Point.isSamePoint(pointA, pointB)).toBe(false);

    pointA = new Point(10.55, 10.33);
    pointB = new Point(10.321, 10.21);
    expect(Point.isSamePoint(pointA, pointB)).toBe(false);

    pointA = new Point(9, 9.83);
    pointB = new Point(10.321, 10.21);
    expect(Point.isSamePoint(pointA, pointB)).toBe(false);

    pointA = new Point(23575532, 67767);
    pointB = new Point(234, 67767);
    expect(Point.isSamePoint(pointA, pointB)).toBe(false);
  });
});
