import { Color } from 'src/app/services/utils/color';
import { Contouring, DEFAULT_FILL_STROKE_WIDTH, StrokeType } from 'src/app/services/utils/constantsAndEnums';
import { PrimitiveType } from '../../../utils/constantsAndEnums';
import { Point } from '../../../utils/point';
import { SVGPrimitive } from '../../svgPrimitive';
import { Path } from '../path';

export class FillingPath extends Path {
  fillColor: Color;
  strokeType: StrokeType;
  contourPath: string;
  fillingPoints: Point[];
  contourPoints: Contouring[];
  fillStrokeWidth = DEFAULT_FILL_STROKE_WIDTH;

  constructor(fillColor: Color, strokeColor: Color, strokeWidth: number, type: PrimitiveType, strokeType: StrokeType) {
    super(strokeColor, strokeWidth, type);
    this.fillColor = fillColor;
    this.strokeType = strokeType;
    this.fillingPoints = [];
    this.contourPoints = [];
  }

  static createCopy(primitive: SVGPrimitive): FillingPath {
    const path: FillingPath = primitive as FillingPath;
    const newPath: FillingPath = new FillingPath(Color.copyColor(path.fillColor), Color.copyColor(path.strokeColor),
      path.strokeWidth, path.type, path.strokeType);

    newPath.commandSvg = path.commandSvg;
    newPath.topLeftCorner = Point.copyPoint(path.topLeftCorner);
    newPath.bottomRightCorner = Point.copyPoint(path.bottomRightCorner);

    newPath.fillStrokeWidth = path.fillStrokeWidth;

    newPath.rotation = path.rotation;
    newPath.scaleX = path.scaleX;
    newPath.scaleY = path.scaleY;
    newPath.transformations = path.transformations;
    newPath.contourPath = path.contourPath;
    path.fillingPoints.forEach((point: Point) => {
      newPath.fillingPoints.push(Point.copyPoint(point));
    });
    path.contourPoints.forEach((contour: Contouring) => {
      const copyPoints: Point[] = [];
      contour.points.forEach((point: Point) => {
        copyPoints.push(Point.copyPoint(point));
      });
      newPath.contourPoints.push({
        type: contour.type,
        points: copyPoints,
      });
    });

    return newPath;
  }

  copy(): FillingPath {
    return FillingPath.createCopy(this);
  }

  scale(translation: Point, scaleFactorX: number, scaleFactorY: number): void {
    const center: Point = this.getCenter();
    this.fillingPoints.forEach((point: Point) => {
      const distanceToCenter: Point = Point.substractPoints(point, center);
      point.x = center.x + distanceToCenter.x * scaleFactorX;
      point.y = center.y + distanceToCenter.y * scaleFactorY;
    });
    this.contourPoints.forEach((contour: Contouring) => {
      contour.points.forEach((point: Point) => {
        const distanceToCenter: Point = Point.substractPoints(point, center);
        point.x = center.x + distanceToCenter.x * scaleFactorX;
        point.y = center.y + distanceToCenter.y * scaleFactorY;
      });
    });
    this.fillStrokeWidth*= Math.abs(scaleFactorY);
    this.move(translation);
  }

  move(translation: Point): void {
    this.fillingPoints.forEach((point: Point) => {
      point.addPoint(translation);
    });
    this.contourPoints.forEach((contour: Contouring) => {
      contour.points.forEach((point: Point) => {
        point.addPoint(translation);
      });
    });
    this.draw();
    this.moveCorners(translation);
  }

  draw(): void {
    if (this.strokeType === StrokeType.Outline) {
      this.fillColor = Color.copyColor(Color.TRANSPARENT);
    }
    if (this.strokeType === StrokeType.Full) {
      this.strokeColor = Color.copyColor(Color.TRANSPARENT);
    }
    this.buildCommandSVG();
    this.buildContourPath();
  }

  protected buildCommandSVG(): void {
    this.commandSvg = '';
    for (let i = 0; i <= this.fillingPoints.length - 2; i += 2) {
      this.commandSvg += ` M${+this.fillingPoints[i].x} ${+this.fillingPoints[i].y} `;
      this.commandSvg += ` L${+this.fillingPoints[i].x} ${+this.fillingPoints[i].y} `;
      this.commandSvg += ` L${+this.fillingPoints[i + 1].x} ${+this.fillingPoints[i + 1].y} `;
    }
  }

  private buildContourPath(): void {
    this.contourPath = '';
    this.contourPoints.forEach((contouring: Contouring) => {
      if (contouring.type === 'm') {
        this.contourPath += ` M${+contouring.points[0].x} ${+contouring.points[0].y} `;
      } else if (contouring.type === 'c') {
        // tslint:disable-next-line: max-line-length
        this.contourPath += ` C${+(contouring.points[0].x)} ${+contouring.points[0].y}, ${+(contouring.points[1].x)} ${+contouring.points[1].y}, ${+(contouring.points[2].x)} ${+contouring.points[2].y} `;
      } else if (contouring.type === 'l') {
        this.contourPath += ` L${+(contouring.points[0].x)} ${+contouring.points[0].y} `;
      }
    });
  }

  setCorners(topLeftCorner: Point, bottomRightCorner: Point): void {
    this.topLeftCorner = topLeftCorner;
    this.bottomRightCorner = bottomRightCorner;
  }
}
