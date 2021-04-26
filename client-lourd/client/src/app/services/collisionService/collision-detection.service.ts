import { Injectable } from '@angular/core';
import { Ellipse } from '../svgPrimitives/ellipse/ellipse';
import { Line } from '../svgPrimitives/line/line';
import { FillingPath } from '../svgPrimitives/path/fillPath/fillPath';
import { Path } from '../svgPrimitives/path/path';
import { Polygon } from '../svgPrimitives/polygon/polygon';
import { Quill } from '../svgPrimitives/quill/quill';
import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { Spraypaint } from '../svgPrimitives/spraypaint/spraypaint';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { TextPrimitive } from '../svgPrimitives/text/textPrimitive';
import { PrimitiveType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';

@Injectable()
export class CollisionDetectionService {

  checkCollision(eraser: Rectangle, shape: SVGPrimitive): boolean {
    let collisionDetected = false;
    const eraserCopy = Rectangle.createCopy(eraser);
    eraserCopy.setPosition(eraserCopy.position);
    switch (shape.type) {
      case PrimitiveType.Pencil:
      case PrimitiveType.Paint:
      case PrimitiveType.Pen:
        collisionDetected = this.checkCollisionWithPath(eraserCopy, (shape as Path));
        break;

      case PrimitiveType.Fill:
        collisionDetected = this.checkCollisionWithFill(eraserCopy, (shape as FillingPath));
        break;
      case PrimitiveType.Line:
        collisionDetected = this.checkCollisionWithLine(eraserCopy, (shape as Line));
        break;

      case PrimitiveType.Rectangle:
        collisionDetected = this.checkCollisionWithRectangle(eraserCopy, (shape as Rectangle));
        break;
      case PrimitiveType.Polygon:
        collisionDetected = this.checkCollisionWithPolygon(eraserCopy, (shape as Polygon));
        break;
      case PrimitiveType.Ellipse:
        collisionDetected = this.checkCollisionWithEllipse(eraserCopy, (shape as Ellipse));
        break;

      case PrimitiveType.Text:
        collisionDetected = this.checkCollisionWithText(eraserCopy, (shape as TextPrimitive));
        break;
      case PrimitiveType.Quill:
        collisionDetected = this.checkCollisionWithQuill(eraserCopy, (shape as Quill));
        break;
      case PrimitiveType.Spraypaint:
        collisionDetected = this.checkCollisionWithSpraypaint(eraserCopy, (shape as Spraypaint));
        break;
    }
    return collisionDetected;
  }

  private checkCollisionWithRectangle(eraser: Rectangle, rectangle: Rectangle): boolean {
    return this.checkCollisionBetweenRectangles(eraser.getTopLeftCorner(),
      eraser.getBottomRightCorner(), rectangle.getTopLeftCorner(), rectangle.getBottomRightCorner());
  }

  private checkCollisionWithPath(eraser: Rectangle, path: Path): boolean {
    let hasPointInsideEraser = false;

    // vérification avec les points d'abords
    path.points.some((point) => {
      const cornerLeft: Point = new Point(point.x - path.strokeWidth / 2, point.y - path.strokeWidth / 2);
      const cornerRight: Point = new Point(point.x + path.strokeWidth / 2, point.y + path.strokeWidth / 2);
      hasPointInsideEraser = this.checkCollisionBetweenRectangles(eraser.getTopLeftCorner(), eraser.getBottomRightCorner(),
        cornerLeft, cornerRight);
      return hasPointInsideEraser;
    });

    if (hasPointInsideEraser) {
      return hasPointInsideEraser;
    }
    // vérification avec les ligne entre les points
    return this.checkCollisionBetweenRectangleLines(eraser, path.points, false);
  }

  private checkCollisionWithFill(eraser: Rectangle, fillingPath: FillingPath): boolean {
    // vérification avec les points d'abords
    let hasPointInsideEraser = false;
    fillingPath.fillingPoints.some((point) => {
      const cornerLeft: Point = new Point(point.x - fillingPath.strokeWidth / 2, point.y - fillingPath.strokeWidth / 2);
      const cornerRight: Point = new Point(point.x + fillingPath.strokeWidth / 2, point.y + fillingPath.strokeWidth / 2);
      hasPointInsideEraser = this.checkCollisionBetweenRectangles(eraser.getTopLeftCorner(), eraser.getBottomRightCorner(),
        cornerLeft, cornerRight);
      return hasPointInsideEraser;
    });
    if (hasPointInsideEraser) {
      return hasPointInsideEraser;
    }
    // vérification avec les ligne entre les points
    for (let i = 0; i < fillingPath.fillingPoints.length - 2; i += 2) {
      const currentPoint: Point = fillingPath.fillingPoints[i];
      const nextPoint: Point = fillingPath.fillingPoints[(i + 1) === fillingPath.fillingPoints.length ? 0 : i + 1];
      // arrête gauche
      let point1: Point = new Point(eraser.getTopLeftCorner().x, eraser.getTopLeftCorner().y);
      let point2: Point = new Point(eraser.getTopLeftCorner().x, eraser.getBottomRightCorner().y);
      if (this.checkCollisionBetweenLines(point1, point2, currentPoint, nextPoint)) {
        return true;
      }
      // arrête droit
      point1 = new Point(eraser.getBottomRightCorner().x, eraser.getTopLeftCorner().y);
      point2 = new Point(eraser.getBottomRightCorner().x, eraser.getBottomRightCorner().y);
      if (this.checkCollisionBetweenLines(point1, point2, currentPoint, nextPoint)) {
        return true;
      }
      // arrête du haut
      point1 = new Point(eraser.getTopLeftCorner().x, eraser.getTopLeftCorner().y);
      point2 = new Point(eraser.getBottomRightCorner().x, eraser.getTopLeftCorner().y);
      if (this.checkCollisionBetweenLines(point1, point2, currentPoint, nextPoint)) {
        return true;
      }
      // arrête du bas
      point1 = new Point(eraser.getTopLeftCorner().x, eraser.getBottomRightCorner().y);
      point2 = new Point(eraser.getBottomRightCorner().x, eraser.getBottomRightCorner().y);
      if (this.checkCollisionBetweenLines(point1, point2, currentPoint, nextPoint)) {
        return true;
      }
    }
    return false;
  }

  private checkCollisionWithLine(eraser: Rectangle, line: Line): boolean {

    let hasPointInsideEraser = false;
    // vérification avec les points d'abords
    line.points.some((point) => {
      const cornerLeft: Point = new Point(point.x - line.strokeWidth / 2, point.y - line.strokeWidth / 2);
      const cornerRight: Point = new Point(point.x + line.strokeWidth / 2, point.y + line.strokeWidth / 2);
      hasPointInsideEraser = this.checkCollisionBetweenRectangles(eraser.getTopLeftCorner(), eraser.getBottomRightCorner(),
        cornerLeft, cornerRight);
      return hasPointInsideEraser;
    });

    if (hasPointInsideEraser) {
      return hasPointInsideEraser;
    }
    // vérification avec les ligne entre les points
    return this.checkCollisionBetweenRectangleLines(eraser, line.points, line.closePath);
  }

  private checkCollisionWithPolygon(eraser: Rectangle, polygon: Polygon): boolean {
    // vérification avec les points d'abords
    let hasPointInsideEraser = false;
    polygon.points.some((point) => {
      hasPointInsideEraser = (point.x >= eraser.getTopLeftCorner().x && point.x <= eraser.getBottomRightCorner().x &&
        point.y >= eraser.getTopLeftCorner().y && point.y <= eraser.getBottomRightCorner().y);
      return hasPointInsideEraser;
    });

    if (hasPointInsideEraser) {
      return hasPointInsideEraser;
    }

    // On créé un tableau de point de rectangle pour simuler un polygon
    const polygonA: Point[] = [];
    polygonA.push(Point.copyPoint(eraser.getTopLeftCorner()));
    polygonA.push(new Point(eraser.getBottomRightCorner().x, eraser.getTopLeftCorner().y));
    polygonA.push(Point.copyPoint(eraser.getBottomRightCorner()));
    polygonA.push(new Point(eraser.getTopLeftCorner().x, eraser.getBottomRightCorner().y));

    if (this.checkPolygonInPolygon(polygonA, polygon.points)) {
      return true;
    }

    // vérification avec les ligne entre les points
    return this.checkCollisionBetweenRectangleLines(eraser, polygon.points, true);

  }

  private checkCollisionWithEllipse(rectangle: Rectangle, ellipse: Ellipse): boolean {

    // Généré quelques points sur le périmètre du rectangle
    const width = rectangle.getBottomRightCorner().x - rectangle.getTopLeftCorner().x;
    const height = rectangle.getBottomRightCorner().y - rectangle.getTopLeftCorner().y;
    const pointsToCheck: Point[] = [];

    pointsToCheck.push(Point.copyPoint(rectangle.getTopLeftCorner()));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x + width / 4, rectangle.getTopLeftCorner().y));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x + width / 2, rectangle.getTopLeftCorner().y));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x + 3 * width / 4, rectangle.getTopLeftCorner().y));

    pointsToCheck.push(new Point(rectangle.getBottomRightCorner().x, rectangle.getTopLeftCorner().y));
    pointsToCheck.push(new Point(rectangle.getBottomRightCorner().x, rectangle.getTopLeftCorner().y + height / 4));
    pointsToCheck.push(new Point(rectangle.getBottomRightCorner().x, rectangle.getTopLeftCorner().y + height / 2));
    pointsToCheck.push(new Point(rectangle.getBottomRightCorner().x, rectangle.getTopLeftCorner().y + 3 * height / 4));

    pointsToCheck.push(Point.copyPoint(rectangle.getBottomRightCorner()));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x + width / 4, rectangle.getBottomRightCorner().y));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x + width / 2, rectangle.getBottomRightCorner().y));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x + 3 * width / 4, rectangle.getBottomRightCorner().y));

    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x, rectangle.getBottomRightCorner().y));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x, rectangle.getTopLeftCorner().y + height / 4));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x, rectangle.getTopLeftCorner().y + height / 2));
    pointsToCheck.push(new Point(rectangle.getTopLeftCorner().x, rectangle.getTopLeftCorner().y + 3 * height / 4));

    const xRadius = ellipse.getAbsoluteWidth() / 2 + ellipse.strokeWidth / 2;
    const yRadius = ellipse.getAbsoluteHeight() / 2 + ellipse.strokeWidth / 2;
    for (const point of pointsToCheck) {
      if (Math.pow((point.x - ellipse.center.x) / xRadius, 2) + Math.pow((point.y - ellipse.center.y) / yRadius, 2) <= 1) {
        return true;
      }
    }

    // test si rectangle plus gros qu'ellipse
    return (ellipse.center.x >= rectangle.getTopLeftCorner().x && ellipse.center.x <= rectangle.getBottomRightCorner().x &&
      ellipse.center.y >= rectangle.getTopLeftCorner().y && ellipse.center.y <= rectangle.getBottomRightCorner().y);
  }

  private checkCollisionWithText(eraser: Rectangle, text: TextPrimitive): boolean {
    return this.checkCollisionBetweenRectangles(eraser.getTopLeftCorner(),
      eraser.getBottomRightCorner(), text.getTopLeftCorner(), text.getBottomRightCorner());
  }

  private checkCollisionWithQuill(eraser: Rectangle, quill: Quill): boolean {
    const polygonA: Point[] = [];
    polygonA.push(Point.copyPoint(eraser.getTopLeftCorner()));
    polygonA.push(new Point(eraser.getBottomRightCorner().x, eraser.getTopLeftCorner().y));
    polygonA.push(Point.copyPoint(eraser.getBottomRightCorner()));
    polygonA.push(new Point(eraser.getTopLeftCorner().x, eraser.getBottomRightCorner().y));
    let quillpoints: Point[];
    for (const quillPoint of quill.points) {
      quillpoints = [];
      quillPoint.points.forEach((point: Point) => {
        quillpoints.push(point);
      });
      if (this.checkPolygonInPolygon(polygonA, quillpoints) || this.checkCollisionBetweenRectangleLines(eraser, quillpoints, false)) {
        return true;
      }
    }
    return false;
  }

  private checkCollisionWithSpraypaint(eraser: Rectangle, spray: Spraypaint): boolean {
    const eraserPoint: Point[] = [];

    eraserPoint.push(Point.copyPoint(eraser.getTopLeftCorner()));
    eraserPoint.push(new Point(eraser.getBottomRightCorner().x, eraser.getTopLeftCorner().y));
    eraserPoint.push(Point.copyPoint(eraser.getBottomRightCorner()));
    eraserPoint.push(new Point(eraser.getTopLeftCorner().x, eraser.getBottomRightCorner().y));
    for (const point of spray.centerPoints) {
      if (this.pointInPolygon(eraserPoint, point)) {
        return true;
      }
    }
    return false;
  }

  private checkCollisionBetweenRectangles(rec1TopLeft: Point, rec1BottomRight: Point, rec2TopLeft: Point, rec2BottomRight: Point): boolean {
    if (((rec1TopLeft.x >= rec2TopLeft.x && rec1TopLeft.x <= rec2BottomRight.x) ||
      (rec1BottomRight.x >= rec2TopLeft.x && rec1BottomRight.x <= rec2BottomRight.x)) &&
      ((rec1TopLeft.y <= rec2BottomRight.y && rec1TopLeft.y >= rec2TopLeft.y) ||
        (rec1BottomRight.y <= rec2BottomRight.y && rec1BottomRight.y >= rec2TopLeft.y))) {

      return true;
    }
    // Pour le cas où l'élément courant est plus petit que l'élément passé en paramètre
    return (((rec2TopLeft.x >= rec1TopLeft.x && rec2TopLeft.x <= rec1BottomRight.x) ||
      (rec2BottomRight.x >= rec1TopLeft.x && rec2BottomRight.x <= rec1BottomRight.x)) &&
      ((rec2TopLeft.y <= rec1BottomRight.y && rec2TopLeft.y >= rec1TopLeft.y) ||
        (rec2BottomRight.y <= rec1BottomRight.y && rec2BottomRight.y >= rec1TopLeft.y)));
  }

  // Je transpose le rectangle en 4 lignes selon ses arrêts
  private checkCollisionBetweenRectangleLines(rectangle: Rectangle, linePoints: Point[], closeShape: boolean): boolean {
    // si on a une forme fermé, on doit vérifier le dernier point avec le premier, donc on va itérer jusqu'au dernier
    const upperBound = closeShape ? linePoints.length : linePoints.length - 1;

    for (let i = 0; i < upperBound; i++) {
      const currentPoint: Point = linePoints[i];
      const nextPoint: Point = linePoints[(i + 1) === linePoints.length ? 0 : i + 1];
      // arrête gauche
      let point1: Point = new Point(rectangle.getTopLeftCorner().x, rectangle.getTopLeftCorner().y);
      let point2: Point = new Point(rectangle.getTopLeftCorner().x, rectangle.getBottomRightCorner().y);
      if (this.checkCollisionBetweenLines(point1, point2, currentPoint, nextPoint)) {
        return true;
      }
      // arrête droit
      point1 = new Point(rectangle.getBottomRightCorner().x, rectangle.getTopLeftCorner().y);
      point2 = new Point(rectangle.getBottomRightCorner().x, rectangle.getBottomRightCorner().y);
      if (this.checkCollisionBetweenLines(point1, point2, currentPoint, nextPoint)) {
        return true;
      }
      // arrête du haut
      point1 = new Point(rectangle.getTopLeftCorner().x, rectangle.getTopLeftCorner().y);
      point2 = new Point(rectangle.getBottomRightCorner().x, rectangle.getTopLeftCorner().y);
      if (this.checkCollisionBetweenLines(point1, point2, currentPoint, nextPoint)) {
        return true;
      }
      // arrête du bas
      point1 = new Point(rectangle.getTopLeftCorner().x, rectangle.getBottomRightCorner().y);
      point2 = new Point(rectangle.getBottomRightCorner().x, rectangle.getBottomRightCorner().y);
      if (this.checkCollisionBetweenLines(point1, point2, currentPoint, nextPoint)) {
        return true;
      }
    }
    return false;
  }

  // Code pris sur le web. Voici la source de ce code : http://www.jeffreythompson.org/collision-detection/line-rect.php
  private checkCollisionBetweenLines(l1Point1: Point, l1Point2: Point, l2Point1: Point, l2Point2: Point): boolean {
    // calcul de direction des lignes
    if (Point.isSamePoint(l1Point1, l2Point1) || Point.isSamePoint(l1Point1, l2Point2) ||
      Point.isSamePoint(l1Point2, l2Point1) || Point.isSamePoint(l1Point2, l2Point2)) {
      return true;
    }
    const uA: number = ((l2Point2.x - l2Point1.x) * (l1Point1.y - l2Point1.y) - (l2Point2.y - l2Point1.y) * (l1Point1.x - l2Point1.x)) /
      ((l2Point2.y - l2Point1.y) * (l1Point2.x - l1Point1.x) - (l2Point2.x - l2Point1.x) * (l1Point2.y - l1Point1.y));
    const uB: number = ((l1Point2.x - l1Point1.x) * (l1Point1.y - l2Point1.y) - (l1Point2.y - l1Point1.y) * (l1Point1.x - l2Point1.x)) /
      ((l2Point2.y - l2Point1.y) * (l1Point2.x - l1Point1.x) - (l2Point2.x - l2Point1.x) * (l1Point2.y - l1Point1.y));
    // si uA et uB sont entre [0,1], les lignes se touchent
    return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1);
  }

  private checkPolygonInPolygon(polygonA: Point[], polygonB: Point[]): boolean {
    // 1. si A dans B alors n'importe quel point de A se trouve dans B
    // 1. si B dans A alors n'importe quel point de B se trouve dans A
    return (this.pointInPolygon(polygonB, polygonA[0])) || (this.pointInPolygon(polygonA, polygonB[0]));
  }

  // Point dans un polygon. Voici la source du code: http://www.jeffreythompson.org/collision-detection/poly-point.php
  private pointInPolygon(polygonPoints: Point[], pointToCheck: Point) {
    if (!pointToCheck || polygonPoints.length === 0) { // Cas où un polygon n'a pas de point ou on a pas de point
      return false;
    }
    let areColliding = false;
    let next = 0;
    for (let current = 0; current < polygonPoints.length; current++) {
      next = current + 1;
      if (next === polygonPoints.length) {
        next = 0;
      }
      const currentPoint: Point = polygonPoints[current];
      const nextPoint: Point = polygonPoints[next];

      if (((currentPoint.y >= pointToCheck.y && nextPoint.y < pointToCheck.y) ||
        (currentPoint.y < pointToCheck.y && nextPoint.y >= pointToCheck.y)) &&
        (pointToCheck.x < (nextPoint.x - currentPoint.x) * (pointToCheck.y - currentPoint.y) /
          (nextPoint.y - currentPoint.y) + currentPoint.x)) {
        areColliding = !areColliding;
      }
    }
    return areColliding;
  }
}
