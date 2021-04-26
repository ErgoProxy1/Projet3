import { Color } from '../../utils/color';
import { LineCap, LineJoin, Pattern, PrimitiveType, ROUNDING_FACTOR } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { SVGPrimitive } from '../svgPrimitive';

export class Line extends SVGPrimitive {

  type = PrimitiveType.Line;
  SELECTABLE = true;
  selected = false;
  strokeWidth: number;
  points: Point[] = [];
  tempPoint: Point;
  linePoints = '';                          // Le string de points utilisé dans le html
  pattern: Pattern;                         // Le motif de la ligne
  lineCap: LineCap;                         // Permet de définir la forme de la fin des lignes
  lineJoin: LineJoin;                       // Permet de définir la forme de la jonction des lignes.
  circlePoints: Point[] = [];
  circleRadius: number;
  lineRounding: number;
  closePath: boolean;

  constructor(strokeColor: Color,
              strokeWidth: number,
              pattern: Pattern,
              lineJoin: LineJoin,
              lineCap: LineCap,
              circleRadius: number,
              lineRounding: number) {
    super();
    this.strokeColor = Color.copyColor(strokeColor);
    this.strokeWidth = strokeWidth;
    this.pattern = pattern;
    this.lineJoin = lineJoin;
    this.lineCap = lineCap;
    this.circleRadius = circleRadius;
    this.lineRounding = lineRounding;
    this.closePath = false;
  }

  static createCopy(primitive: SVGPrimitive): Line {
    const line: Line = primitive as Line;
    const newLine: Line = new Line(Color.copyColor(line.strokeColor),
    line.strokeWidth, line.pattern, line.lineJoin, line.lineCap, line.circleRadius, line.lineRounding);
    newLine.points = [];
    line.points.forEach((point: Point) => {
      newLine.points.push(Point.copyPoint(point));
    });
    newLine.tempPoint = Point.copyPoint(line.tempPoint);
    newLine.linePoints = line.linePoints;
    newLine.circlePoints = line.circlePoints;
    newLine.topLeftCorner = Point.copyPoint(line.topLeftCorner);
    newLine.bottomRightCorner = Point.copyPoint(line.bottomRightCorner);
    newLine.closePath = line.closePath;

    newLine.rotation = line.rotation;
    newLine.scaleX = line.scaleX;
    newLine.scaleY = line.scaleY;
    newLine.transformations = line.transformations;

    return newLine;
  }

  scale(translation: Point, scaleFactorX: number, scaleFactorY: number) {
    const center: Point = this.getCenter();
    this.points.forEach((point: Point) => {
      const distanceToCenter: Point = Point.substractPoints(point, center);
      point.x = center.x + distanceToCenter.x * scaleFactorX;
      point.y = center.y + distanceToCenter.y * scaleFactorY;
    });
    const distanceFromTempPointToCenter = Point.substractPoints(this.tempPoint, center);
    this.tempPoint.x = center.x + distanceFromTempPointToCenter.x * scaleFactorX;
    this.tempPoint.y = center.y + distanceFromTempPointToCenter.y * scaleFactorY;
    this.move(translation);
  }

  addPoint(point: Point): void {
    this.points.push(point);
    this.tempPoint = point;
  }

  update(position: Point): void {
    this.tempPoint = Point.copyPoint(position);
    this.lineJoin !== LineJoin.BezierRound ? this.setPath() : this.setRoundingPath();
  }

  setPath(): void {
    let path = '';
    this.points.forEach((point) => {
      if (path.length === 0) {
        path += `M${point.x} ${point.y}`;
      } else if (this.points.length > 0) {
        path += ` L${point.x} ${point.y}`;
      }
    });
    if (this.tempPoint !== undefined && this.points.length > 0) {
      path += ` L${this.tempPoint.x} ${this.tempPoint.y}`;
    }
    this.linePoints = path;
  }

  /**
   * Cette méthode permet de générer la commande de la courbe de Bezier
   * lorsque l'option special rouding est activée.
   */
  setRoundingPath(): void {
    let path = '';
    if (path.length === 0 && this.points.length >= 1) {
      path = `M${this.points[0].x} ${this.points[0].y}`;
    }
    if (this.points.length === 2 ) {
      path += ` L${this.points[1].x + ((this.points[0].x -
        this.points[1].x) * ROUNDING_FACTOR)} ${this.points[1].y + ((this.points[0].y - this.points[1].y) * ROUNDING_FACTOR)}`;
    }
    if (this.points.length >= 3) {
      for (let i = 3; i <= this.points.length; i++) {
        path += `${this.roundingButt(this.points[i - 3], this.points[i - 2], this.points[i - 1], this.lineRounding)}`;
      }
      const len = this.points.length;
      path += `${this.roundingButt(this.points[len - 2], this.points[len - 1], this.tempPoint, this.lineRounding)}`;
    }
    path += (this.tempPoint !== undefined) ? ` L${this.tempPoint.x} ${this.tempPoint.y}` : '' ;
    this.linePoints = path;
  }

  /**
   * Cette méthode permet d'implémenter la courbe de Bezier à la jonction des lignes SVG.
   * Les paramètres correspondent aux point de la commande "C x1 y1, x y , x2 y2" pour la primitive <path> de SVG
   * @param startCtrlPoint, correspond au point de controle de la courbe :x1 y1.
   * @param slopeCtrlPoint, correspond au point courant: x y
   * @param endCtrlPoint, correspont au point de fin: x2 y2
   * @param roundingFactor est le rayon de courbure de la courbe.
   * @return La méthode retourne la commande "C x1 y1, x y , x2 y2".
   */
  roundingButt(startCtrlPoint: Point, slopeCtrlPoint: Point, endCtrlPoint: Point, roundingFactor: number): string {

    let adjustedStartCtrlPt: Point;
    let adjustedEndCtrlPt: Point;

    if ((startCtrlPoint.x - slopeCtrlPoint.x) === 0 || (endCtrlPoint.x - slopeCtrlPoint.x) === 0) {
      return ` C${(startCtrlPoint.x + slopeCtrlPoint.x) / 2} ${(startCtrlPoint.y +
        slopeCtrlPoint.y) / 2}, ${slopeCtrlPoint.x} ${slopeCtrlPoint.y},
      ${(endCtrlPoint.x + slopeCtrlPoint.x) / 2} ${(endCtrlPoint.y + slopeCtrlPoint.y) / 2}`;
    }
    adjustedStartCtrlPt = this.adjustPoints(startCtrlPoint, slopeCtrlPoint, roundingFactor);
    adjustedEndCtrlPt = this.adjustPoints(endCtrlPoint, slopeCtrlPoint, roundingFactor);

    return ` C${adjustedStartCtrlPt.x} ${adjustedStartCtrlPt.y}, ${slopeCtrlPoint.x} ${slopeCtrlPoint.y},
    ${adjustedEndCtrlPt.x} ${adjustedEndCtrlPt.y}`;
  }

  /**
   * Permet de calculer les coordonnées du point situé à 10% de la fin du segment [startPoint, slopePoint];
   * ce point facilite la construction du rond à la fin de la ligne.
   * @param startPoint: point origine
   * @param slopePoint: point destination
   * @return retourne le point situé à 10% de slopePoint.
   */
  private adjustPoints(startPoint: Point, slopePoint: Point, roundingFactor: number): Point {
    return new Point(Math.sign(startPoint.x - slopePoint.x) *
                    roundingFactor *
                    Math.sqrt(1 / (1 + Math.pow((startPoint.y - slopePoint.y) / (startPoint.x - slopePoint.x), 2))) + slopePoint.x
                    ,
                    Math.sign((startPoint.y - slopePoint.y) ) *
                    roundingFactor *
                    ((startPoint.y - slopePoint.y) / (startPoint.x - slopePoint.x)) *
                    Math.sqrt(1 / (1 + Math.pow((startPoint.y - slopePoint.y) / (startPoint.x - slopePoint.x), 2))) + slopePoint.y);
  }

  move(translation: Point): void {
    this.points.forEach((point: Point) => {
      point.addPoint(translation);
    });
    this.tempPoint.addPoint(translation);
    this.update(this.tempPoint);
    this.moveCorners(translation);
  }

  copy(): Line {
    return Line.createCopy(this);
  }
}
