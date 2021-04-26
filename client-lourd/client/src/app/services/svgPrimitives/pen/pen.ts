import { Color } from '../../utils/color';
import { PrimitiveType, Texture } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Path } from '../path/path';
import { SVGPrimitive } from '../svgPrimitive';

interface PenPath {
  commandSVG: string;
  strokeWidth: number;
}

export class Pen extends Path {
  headPoints: Point[] = [];
  paths: PenPath[] = [];

  constructor(strokeColor: Color, strokeWidth: number, type: PrimitiveType, texture: Texture = Texture.Basic) {
    super(strokeColor, strokeWidth, type, texture);
  }

  static createCopy(primitive: SVGPrimitive): Pen {
    const pen: Pen = primitive as Pen;
    const newPen: Pen = new Pen(Color.copyColor(pen.strokeColor), pen.strokeWidth, pen.type, pen.texture);

    newPen.paths = [];
    pen.paths.forEach((path: PenPath) => {
      newPen.paths.push(path);
    });
    newPen.headPoints = [];
    pen.headPoints.forEach((point: Point) => {
      newPen.headPoints.push(Point.copyPoint(point));
    });
    newPen.commandSvg = pen.commandSvg;
    newPen.topLeftCorner = Point.copyPoint(pen.topLeftCorner);
    newPen.bottomRightCorner = Point.copyPoint(pen.bottomRightCorner);
    newPen.points = [];
    pen.points.forEach((point: Point) => {
      newPen.points.push(Point.copyPoint(point));
    });

    newPen.rotation = pen.rotation;
    newPen.scaleX = pen.scaleX;
    newPen.scaleY = pen.scaleY;
    newPen.transformations = pen.transformations;

    return newPen;
  }

  protected buildPath(currentPoints: Point[]): string {
    let path = '';
    if (currentPoints.length > 0) {
      path = `M${currentPoints[0].x} ${currentPoints[0].y}`;
      currentPoints.forEach((point: Point) => {
        path += ` L${point.x} ${point.y}`;
      });
    }
    return path;
  }

  addPath(point: Point, strokeWidth: number): void {
    if (this.headPoints.length > 0) {
      this.headPoints = this.headPoints.slice(this.headPoints.length - 1);
    }
    this.headPoints.push(Point.copyPoint(point));
    this.paths.push({commandSVG: this.buildPath(this.headPoints), strokeWidth});
  }

  move(translation: Point): void {
    super.move(translation);
    this.headPoints.forEach((point: Point) => {
      point.addPoint(translation);
    });
    this.rebuildPaths();
  }

  copy(): Pen {
    return Pen.createCopy(this);
  }

  private rebuildPaths(): void {
    const rebuiltPaths: PenPath[] = [];
    for (let i = 0; i < this.paths.length; i++) {
      if (i === 0 && i < this.paths.length) {
        rebuiltPaths.push({commandSVG: this.buildPath([this.points[i]]), strokeWidth: this.paths[i].strokeWidth});
      } else {
        rebuiltPaths.push({commandSVG: this.buildPath([this.points[i - 1], this.points[i]]), strokeWidth: this.paths[i].strokeWidth});
      }
    }
    this.paths = rebuiltPaths;
  }
}
