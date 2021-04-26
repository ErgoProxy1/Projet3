import { Color } from '../../utils/color';
import { PrimitiveType, StrokeType } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Shape } from '../shape/shape';
import { SVGPrimitive } from '../svgPrimitive';

export class Polygon extends Shape {

  radius: number; // rayon du cercle dans lequel le polygone sera tracé
  sidesNumber: number; // nombre de côtés
  points: Point[] = []; // array de points
  listPoints = '';
  type = PrimitiveType.Polygon;

  constructor(fillColor: Color, strokeColor: Color, strokeWidth: number, strokeType: StrokeType,
              center: Point, sidesNumber: number = 3 , radius: number = 0) {
    super(fillColor, strokeColor, strokeWidth, strokeType, center, radius * 2, radius * 2);
    this.radius = radius;
    this.sidesNumber = sidesNumber;
    this.center = center;
    this.updatePoints();
  }

  static createCopy(primitive: SVGPrimitive): Polygon {
    const polygon: Polygon = primitive as Polygon;
    const newCenter: Point = Point.copyPoint(polygon.center);
    const newPolygon: Polygon = new Polygon(Color.copyColor(polygon.fillColor), Color.copyColor(polygon.strokeColor),
      polygon.strokeWidth, polygon.strokeType, newCenter, polygon.sidesNumber, polygon.radius);

    newPolygon.points = [];
    polygon.points.forEach((point: Point) => {
      newPolygon.points.push(Point.copyPoint(point));
    });
    newPolygon.listPoints = polygon.listPoints;
    newPolygon.width = polygon.width;
    newPolygon.height = polygon.height;
    newPolygon.absoluteHeight = polygon.absoluteHeight;
    newPolygon.absoluteWidth = polygon.absoluteWidth;
    newPolygon.corner1 = Point.copyPoint(polygon.corner1);
    newPolygon.corner2 = Point.copyPoint(polygon.corner2);
    newPolygon.topLeftCorner = Point.copyPoint(polygon.topLeftCorner);
    newPolygon.bottomRightCorner = Point.copyPoint(polygon.bottomRightCorner);
    newPolygon.isRegular = polygon.isRegular;

    newPolygon.rotation = polygon.rotation;
    newPolygon.scaleX = polygon.scaleX;
    newPolygon.scaleY = polygon.scaleY;
    newPolygon.transformations = polygon.transformations;

    newPolygon.rotationGroupOrigin = Point.copyPoint(polygon.rotationGroupOrigin);
    newPolygon.createTransformationsStrings();
    return newPolygon;
  }

  resize(corner1: Point, corner2: Point, isRegular: boolean = true): void {
    if (corner1.x !== corner2.x && corner1.y !== corner2.y) {
      super.resize(corner1, corner2, isRegular);
      this.radius = Math.min(this.getAbsoluteWidth() / 2.0, this.getAbsoluteHeight() / 2.0);
      this.updatePoints();
    }
  }

  pointsToString(): void {
    this.listPoints = '';
    for (const point of this.points) {
      const buffer = `${point.x} ${point.y},`;
      this.listPoints += buffer;
    }
    this.listPoints = this.listPoints.substring(0, this.listPoints.length - 1);
  }

  private updatePoints(): void {
    let minX: number = Number.MAX_SAFE_INTEGER;
    let maxX: number = Number.MIN_SAFE_INTEGER;
    let minY: number = Number.MAX_SAFE_INTEGER;
    let maxY: number = Number.MIN_SAFE_INTEGER;
    const angle: number = ((2 * Math.PI) / this.sidesNumber);
    const polygonAngle: number = ((this.sidesNumber - 2) * Math.PI) / this.sidesNumber;
    const hasOutline: boolean = this.strokeType === StrokeType.Outline || this.strokeType === StrokeType.FullWithOutline;
    const adjustedRadius: number = hasOutline ? this.radius >= this.strokeWidth ?
                                                  this.radius - (this.strokeWidth * 0.5) / Math.sin(polygonAngle * 0.5) :
                                                  0 :
                                                this.radius;
    for (let i = 0; i <= this.sidesNumber ; i++) {
      this.points[i] = new Point((this.center.x) - adjustedRadius * Math.sin(i * angle),
        (this.center.y ) - adjustedRadius * Math.cos(i * angle));

      minX = Math.min(minX, this.points[i].x);
      maxX = Math.max(maxX, this.points[i].x);
      minY = Math.min(minY, this.points[i].y);
      maxY = Math.max(maxY, this.points[i].y);
    }
    this.pointsToString();
  }

  getCenter(): Point {
    return this.center;
  }

  copy(): Polygon {
    return Polygon.createCopy(this);
  }

  move(translation: Point): void {
    this.points.forEach((point: Point) => {
      point.addPoint(translation);
    });
    this.pointsToString();
    this.corner1.addPoint(translation);
    this.corner2.addPoint(translation);
    this.center.addPoint(translation);
    this.moveCorners(translation);
  }

  scale(translation: Point, scaleFactorX: number, scaleFactorY: number): void {
    const center: Point = this.getCenter();
    this.points.forEach((point: Point) => {
      const distanceToCenter: Point = Point.substractPoints(point, center);
      point.x = center.x + distanceToCenter.x * scaleFactorX;
      point.y = center.y + distanceToCenter.y * scaleFactorY;
    });
    this.setWidth(this.width * scaleFactorX);
    this.setHeight(this.height * scaleFactorY);
    this.corner1.x = center.x - this.width / 2.0;
    this.corner1.y = center.y - this.width / 2.0;
    this.corner2.x = center.x - this.width / 2.0;
    this.corner2.y = center.y - this.width / 2.0;
    this.move(translation);
  }
}
