import { Color } from '../../utils/color';
import { PrimitiveType, SPRAYPAINT_FLOW_SIZE, SPRAYPAINT_POINT_SIZE } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { SVGPrimitive } from '../svgPrimitive';

export class Spraypaint extends SVGPrimitive {
  paintDelay: number;
  range: number;
  strokeColor: Color;
  points: Point[];
  centerPoints: Point[];
  readonly type: PrimitiveType;
  readonly POINT_SIZE: number = SPRAYPAINT_POINT_SIZE;
  SELECTABLE = true;

  constructor(strokeColor: Color, paintDelay: number, range: number) {
    super();
    this.strokeColor = Color.copyColor(strokeColor);
    this.paintDelay = paintDelay;
    this.range = range;
    this.type = PrimitiveType.Spraypaint;
    this.centerPoints = [];
    this.points = [];
  }

  static createCopy(primitive: SVGPrimitive): Spraypaint {
    const spraypaint: Spraypaint = primitive as Spraypaint;
    const newSpraypaint: Spraypaint = new Spraypaint(Color.copyColor(spraypaint.strokeColor),
      spraypaint.paintDelay, spraypaint.range);
    newSpraypaint.topLeftCorner = Point.copyPoint(spraypaint.topLeftCorner);
    newSpraypaint.bottomRightCorner = Point.copyPoint(spraypaint.bottomRightCorner);

    newSpraypaint.points = [];
    spraypaint.points.forEach((point: Point) => {
      newSpraypaint.points.push(Point.copyPoint(point));
    });
    newSpraypaint.centerPoints = [];
    spraypaint.centerPoints.forEach((point: Point) => {
      newSpraypaint.centerPoints.push(Point.copyPoint(point));
    });

    return newSpraypaint;
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

  copy(): Spraypaint {
    return Spraypaint.createCopy(this);
  }

  /**
   * Cette méthode permet de construire les points de l'aérosol.
   * Ces points doivent être contenus dans le disque formé par le diamètre
   * de l'aérosol. Ces points sont générés aléatoirement.
   * NOTE: Dans l'implémentation ci-dessous, pour parcourrir tous les points du cercle, l'angle
   *       teta devrait être égal à: 2 * k * PI * t, avec k constante dans Z, et t variable.
   *       Nous prenons convenablement k = 2, car 0 <= Math.random() < 1.
   * @param point le point sous le curseur.
   */
  spray(point: Point): void {
    for (let i = 0; i < SPRAYPAINT_FLOW_SIZE; i++) {
      const teta = 4 * Math.PI * Math.random();   // Voir note dans l'entête.
      const randomRadius = Math.random();
      this.points.push(new Point((randomRadius * (this.range / 2) * Math.cos(teta) + point.x),
        randomRadius * (this.range / 2) * Math.sin(teta) + point.y));
    }
    if (!this.centerPoints.some((pt) => {
      return Point.isSamePoint(pt, point);
    })) {
      this.centerPoints.push(Point.copyPoint(point));
    }
  }

  move(translation: Point): void {
    this.points.forEach((point: Point) => {
      point.addPoint(translation);
    });
    this.moveCorners(translation);
  }
}
