import { Color } from '../../utils/color';
import { PrimitiveType } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { QuillPointsInfo } from '../../utils/quillPointsInfo';
import { SVGPrimitive } from '../svgPrimitive';

export class Quill extends SVGPrimitive {

  constructor(strokeColor: Color) {
    super();
    this.strokeColor = Color.copyColor(strokeColor);
    this.linePoints.push('');
  }
  SELECTABLE = true;
  selected = false;
  type = PrimitiveType.Quill;
  linePoints: string[] = [];
  points: QuillPointsInfo[] = [];
  lengthX = 0;
  lengthY = 0;

  static createCopy(primitive: SVGPrimitive): Quill {
    const quill: Quill = primitive as Quill;
    const newQuill: Quill = new Quill(Color.copyColor(quill.strokeColor));
    newQuill.linePoints = quill.linePoints;
    newQuill.topLeftCorner = Point.copyPoint(quill.topLeftCorner);
    newQuill.bottomRightCorner = Point.copyPoint(quill.bottomRightCorner);
    quill.points.forEach((quillPoints: QuillPointsInfo) => {
      if (quillPoints.points.length === 4) {
        newQuill.points.push(
          new QuillPointsInfo(quillPoints.points[0], quillPoints.points[1], quillPoints.points[2], quillPoints.points[3]),
        );
      }
    });

    newQuill.rotation = quill.rotation;
    newQuill.scaleX = quill.scaleX;
    newQuill.scaleY = quill.scaleY;
    newQuill.transformations = quill.transformations;
    return newQuill;
  }

  scale(translation: Point, scaleFactorX: number, scaleFactorY: number): void {
    const center: Point = this.getCenter();
    this.points.forEach((quillPoints: QuillPointsInfo) => {
      quillPoints.points.forEach((point: Point) => {
        const distanceToCenter: Point = Point.substractPoints(point, center);
        point.x = center.x + distanceToCenter.x * scaleFactorX;
        point.y = center.y + distanceToCenter.y * scaleFactorY;
      });
    });
    this.move(translation);
  }

  // Mise a jour suite a changement d'angle d'orientation du curseur
  changeAngle(currentPosition: Point, oldAngle: number, newAngle: number, baseLength: number): void {
    // Vieux Points
    this.calculateLengths(oldAngle, baseLength);
    const firstPoint = Point.copyPoint(currentPosition);
    firstPoint.addXY(this.lengthX, this.lengthY);
    const secondPoint = Point.copyPoint(currentPosition);
    secondPoint.addXY(-this.lengthX, -this.lengthY);

    // Nouveaux Points
    this.calculateLengths(newAngle, baseLength);
    const thirdPoint = Point.copyPoint(currentPosition);
    thirdPoint.addXY(-this.lengthX, -this.lengthY);
    const fourthPoint = Point.copyPoint(currentPosition);
    fourthPoint.addXY(this.lengthX, this.lengthY);

    const quillPoints: QuillPointsInfo = new QuillPointsInfo(firstPoint, secondPoint, thirdPoint, fourthPoint);
    this.points.push(quillPoints);
    this.linePoints.push(quillPoints.toString());
  }

  // Mise a jour suite a un deplacement du curseur
  addPoints(currentPosition: Point, oldPosition: Point, angle: number, baseLength: number): void {
    this.calculateLengths(angle, baseLength);
    const firstPoint = Point.copyPoint(oldPosition);
    firstPoint.addXY(this.lengthX, this.lengthY);
    const secondPoint = Point.copyPoint(oldPosition);
    secondPoint.addXY(-this.lengthX, -this.lengthY);
    const thirdPoint = Point.copyPoint(currentPosition);
    thirdPoint.addXY(-this.lengthX, -this.lengthY);
    const fourthPoint = Point.copyPoint(currentPosition);
    fourthPoint.addXY(this.lengthX, this.lengthY);

    const quillPoints: QuillPointsInfo = new QuillPointsInfo(firstPoint, secondPoint, thirdPoint, fourthPoint);
    this.points.push(quillPoints);
    this.linePoints.push(quillPoints.toString());
  }

  calculateLengths(angle: number, baseLength: number): void {
    const rads = (angle * Math.PI) / 180;
    this.lengthY = Math.round((-baseLength / 2) * Math.sin(rads));
    this.lengthX = Math.round((baseLength / 2) * Math.cos(rads));
  }

  rebuildLinePoints(): void {
    this.linePoints = [];
    this.points.forEach((quillPoints: QuillPointsInfo) => {
      this.linePoints.push(quillPoints.toString());
    });
  }

  move(translation: Point): void {
    this.points.forEach((quillPoints: QuillPointsInfo) => {
      quillPoints.move(translation);
    });
    this.rebuildLinePoints();
    this.moveCorners(translation);
  }

  copy(): Quill {
    return Quill.createCopy(this);
  }
}
