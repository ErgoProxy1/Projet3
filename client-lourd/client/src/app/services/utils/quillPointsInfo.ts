import { Point } from './point';

export class QuillPointsInfo {
    points: Point[] = [];

    constructor(firstPoint: Point, secondPoint: Point, thirdPoint: Point , fourthPoint: Point) {
      this.points.push(Point.copyPoint(firstPoint));
      this.points.push(Point.copyPoint(secondPoint));
      this.points.push(Point.copyPoint(thirdPoint));
      this.points.push(Point.copyPoint(fourthPoint));
    }

    toString(): string {
      let converted = '';
      this.points.forEach((point: Point) => {
        converted += point.toString();
      });
      return converted;
    }

    move(translation: Point): void {
      this.points.forEach((point: Point) => {
        point.addPoint(Point.copyPoint(translation));
      });
    }
  }
