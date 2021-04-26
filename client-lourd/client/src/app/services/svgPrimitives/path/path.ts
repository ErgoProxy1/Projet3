import { Color } from '../../utils/color';
import { PrimitiveType, Texture } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { SVGPrimitive } from '../svgPrimitive';

export class Path extends SVGPrimitive {
  strokeWidth: number;
  texture: Texture;
  commandSvg: string;
  type: PrimitiveType;
  SELECTABLE = true;
  selected = false;
  points: Point[] = [];

  constructor(strokeColor: Color, strokeWidth: number, type: PrimitiveType, texture: Texture = Texture.Basic) {
    super();
    this.strokeColor = Color.copyColor(strokeColor);
    this.strokeWidth = strokeWidth;
    this.type = type;
    this.texture = texture;
    this.commandSvg = '';
  }

  static createCopy(primitive: SVGPrimitive): Path {
    const path: Path = primitive as Path;
    const newPath: Path = new Path(Color.copyColor(path.strokeColor), path.strokeWidth, path.type, path.texture);

    newPath.commandSvg = path.commandSvg;
    newPath.topLeftCorner = Point.copyPoint(path.topLeftCorner);
    newPath.bottomRightCorner = Point.copyPoint(path.bottomRightCorner);
    newPath.points = [];
    path.points.forEach((point: Point) => {
      newPath.points.push(Point.copyPoint(point));
    });

    newPath.rotation = path.rotation;
    newPath.scaleX = path.scaleX;
    newPath.scaleY = path.scaleY;
    newPath.transformations = path.transformations;

    return newPath;
  }

  scale(translation: Point, scaleFactorX: number, scaleFactorY: number): void {
    const center: Point = this.getCenter();
    this.points.forEach((point: Point) => {
      const distanceToCenter: Point = Point.substractPoints(point, center);
      point.x = center.x + distanceToCenter.x * scaleFactorX;
      point.y = center.y + distanceToCenter.y * scaleFactorY;
    });
    this.move(translation);
  }

  addPoint(point: Point): void {
    this.points.push(point);
    this.commandSvg += (this.commandSvg.length === 0) ?
                      (`M${+point.x} ${+point.y} L${+point.x} ${+point.y}`) : (` L${+point.x} ${+point.y}`);
  }

  move(translation: Point): void {
    this.points.forEach((point: Point) => {
      point.addPoint(translation);
    });
    this.builCommandSVG();
    this.moveCorners(translation);
    // super.move(translation);
  }

  copy(): Path {
    return Path.createCopy(this);
  }

  protected builCommandSVG(): void {
    if (this.points.length > 0) {
      this.commandSvg = `M${+this.points[0].x} ${+this.points[0].y}`;
      this.points.forEach((point: Point) => {
        this.commandSvg += (` L${+point.x} ${+point.y}`);
      });
    } else {
      this.commandSvg = '';
    }
  }
}
