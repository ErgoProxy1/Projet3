import { Ellipse } from '../svgPrimitives/ellipse/ellipse';
import { Line } from '../svgPrimitives/line/line';
import { Path } from '../svgPrimitives/path/path';
import { Polygon } from '../svgPrimitives/polygon/polygon';
import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { TextPrimitive } from '../svgPrimitives/text/textPrimitive';
import { Color } from '../utils/color';
import { ALIGNS, FONTS, LineCap, LineJoin, Pattern, PrimitiveType, StrokeType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { CollisionDetectionService } from './collision-detection.service';

// tslint:disable: no-string-literal
describe('CollisionDetectionService', () => {

    let service: CollisionDetectionService;
    beforeEach(() => {
    service = new CollisionDetectionService();
  });

  // Collision entre lignes checkCollisionBetweenLines
    it('Lines shouldn\'t collide', () => {
    // La première ligne sera fix
    const line1PointA: Point = new Point(3, 10);
    const line1PointB: Point = new Point(8, 10);

    // La deuxième ligne changera pour tester plusieurs cas
    let line2PointA: Point = new Point(0, 0);
    let line2PointB: Point = new Point(10, 0);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(false);

    line2PointA = new Point(3, 9);
    line2PointB = new Point(8, 9);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(false);

    line2PointA = new Point(2, 0);
    line2PointB = new Point(2, 9);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(false);

    line2PointA = new Point(9, 0);
    line2PointB = new Point(9, 9);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(false);

    line2PointA = new Point(0, 0);
    line2PointB = new Point(9, 11);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(false);

  });

    it('Lines should collide', () => {
    // La première ligne sera fix
    const line1PointA: Point = new Point(3, 10);
    const line1PointB: Point = new Point(8, 10);

    // La deuxième ligne changera pour tester plusieurs cas
    let line2PointA: Point = new Point(3, 10);
    let line2PointB: Point = new Point(8, 10);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(true);

    line2PointA = new Point(5, 0);
    line2PointB = new Point(5, 10);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(true);

    line2PointA = new Point(0, 0);
    line2PointB = new Point(8, 11);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(true);

    line2PointA = new Point(0, 0);
    line2PointB = new Point(3, 10);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(true);

    line2PointA = new Point(8, 10);
    line2PointB = new Point(0, 0);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(true);

    line2PointA = new Point(10, 0);
    line2PointB = new Point(0, 20);
    expect(service['checkCollisionBetweenLines'](line1PointA, line1PointB, line2PointA, line2PointB)).toBe(true);

  });

  // Collision entre un rectangle et une ligne
    it('Rectangle and line shouldn\'t collide', () => {
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 3, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    let points: Point[] = [];
    points.push(new Point(5, 20));
    points.push(new Point(7, 22));
    points.push(new Point(9, 22));
    points.push(new Point(9, 20));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, false)).toBe(false);

    points = [];
    points.push(new Point(8, 11));
    points.push(new Point(11, 11));
    points.push(new Point(9, 12));
    points.push(new Point(10, 9));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, false)).toBe(false);
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, true)).toBe(false);

    points = [];
    points.push(new Point(25, 19));
    points.push(new Point(29, 15));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, false)).toBe(false);

    points = [];
    points.push(new Point(28, 6));
    points.push(new Point(30, 2));
    points.push(new Point(22, 1));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, false)).toBe(false);
  });

  // Collision entre un rectangle et une ligne
    it('Rectangle and line should collide', () => {
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 3, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    let points: Point[] = [];
    points.push(new Point(4, 22));
    points.push(new Point(8, 19));
    points.push(new Point(2, 5));
    points.push(new Point(1, 20));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, false)).toBe(true);

    points = [];
    points.push(new Point(14, 22));
    points.push(new Point(14, 10));
    points.push(new Point(19, 10));
    points.push(new Point(12, 14));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, false)).toBe(true);

    points = [];
    points.push(new Point(9, 20));
    points.push(new Point(28, 20));
    points.push(new Point(20, 0));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, true)).toBe(true);

    points = [];
    points.push(new Point(28, 6));
    points.push(new Point(30, 2));
    points.push(new Point(22, 1));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, true)).toBe(true);

    points = [];
    points.push(new Point(0, 0));
    points.push(new Point(15, 0));
    points.push(new Point(15, 25));
    expect(service['checkCollisionBetweenRectangleLines'](rectangle, points, true)).toBe(true);
  });

  // Collision entre 2 rectangles
    it('Rectangles shouldn\'t collide' , () => {
    const rec1TopLeft: Point = new Point(5, 15);
    const rec1BottomRight: Point = new Point(25, 5);
    let rec2TopLeft: Point = new Point(12, 23);
    let rec2BottomRight: Point = new Point(15, 20);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(false);

    rec2TopLeft = new Point(26, 15);
    rec2BottomRight = new Point(29, 9);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(false);

    rec2TopLeft = new Point(0, 5);
    rec2BottomRight = new Point(4, 0);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(false);

  });

  // Collision entre 2 rectangles
    it('Rectangles should collide' , () => {
    const rec1TopLeft: Point = new Point(5, 5);
    const rec1BottomRight: Point = new Point(25, 15);
    let rec2TopLeft: Point = new Point(4, 4);
    let rec2BottomRight: Point = new Point(6, 6);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(true);

    rec2TopLeft = new Point(4, 4);
    rec2BottomRight = new Point(5, 5);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(true);

    rec2TopLeft = new Point(24, 4);
    rec2BottomRight = new Point(26, 6);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(true);

    rec2TopLeft = new Point(24, 14);
    rec2BottomRight = new Point(26, 16);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(true);

    rec2TopLeft = new Point(4, 14);
    rec2BottomRight = new Point(6, 16);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(true);

    rec2TopLeft = new Point(9, 9);
    rec2BottomRight = new Point(12, 12);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(true);

    rec2TopLeft = new Point(2, 2);
    rec2BottomRight = new Point(30, 20);
    expect(service['checkCollisionBetweenRectangles'](rec1TopLeft, rec1BottomRight, rec2TopLeft, rec2BottomRight)).toBe(true);

  });

  // Collision rectangle with text
    it('Rectangles and text shouldn\'t collide' , () => {
    const dummyText: TextPrimitive = new TextPrimitive(2, new Color(0, 0, 0), FONTS[0], ALIGNS[0], new Point(0, 0, ), true, true);
    dummyText['topLeftCorner'] = new Point(5, 5);
    dummyText['bottomRightCorner'] = new Point(25, 15);
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 3, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(2, 2);
    rectangle.setCenter(new Point(2, 2));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(false);

    rectangle.setCenter(new Point(10, 2));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(false);

    rectangle.setCenter(new Point(20, 20));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(false);

  });

  // Collision rectangle with text
    it('Rectangles and text should collide' , () => {
    const dummyText: TextPrimitive = new TextPrimitive(2, new Color(0, 0, 0), FONTS[0], ALIGNS[0], new Point(0, 0, ), true, true);
    dummyText['topLeftCorner'] = new Point(5, 5);
    dummyText['bottomRightCorner'] = new Point(25, 15);
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 3, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(2, 2);
    rectangle.setCenter(new Point(5, 5));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(true);

    rectangle.setCenter(new Point(25, 5));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(true);

    rectangle.setCenter(new Point(25, 15));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(true);

    rectangle.setCenter(new Point(5, 15));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(true);

    rectangle.setCenter(new Point(15, 10));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(true);
    rectangle.setNewDimension(30, 20);
    rectangle.setCenter(new Point(15, 10));
    expect(service['checkCollisionWithText'](rectangle, dummyText)).toBe(true);
  });

  // Collision rectangle with Ellipse
    it('Rectangles and ellipse shouldn\'t collide' , () => {
    const dummyEllipse: Ellipse = new Ellipse(new Color(0, 0, 0), new Color(0, 0, 0),
                                    1, StrokeType.FullWithOutline, new Point(15, 10), 20, 10);
    dummyEllipse['setWidth'](20);
    dummyEllipse['setHeight'](10);
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0),
                                    3, StrokeType.FullWithOutline, new Point(0, 0), 2, 2);
    rectangle.setNewDimension(2, 2);
    rectangle.setCenter(new Point(2, 2));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(false);

    rectangle.setCenter(new Point(10, 2));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(false);

    rectangle.setCenter(new Point(20, 20));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(false);
  });

    it('Rectangles and ellipse shouldn\'t collide if rectangle only in bounding box' , () => {
    const dummyEllipse: Ellipse = new Ellipse(new Color(0, 0, 0), new Color(0, 0, 0),
                                    1, StrokeType.FullWithOutline, new Point(15, 10), 20, 10);
    dummyEllipse['setWidth'](20);
    dummyEllipse['setHeight'](10);
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0),
                                    3, StrokeType.FullWithOutline, new Point(0, 0), 2, 2);
    rectangle.setNewDimension(2, 2);
    rectangle.setCenter(new Point(4, 4));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(false);

  });

  // Collision rectangle with Ellipse
    it('Rectangles and ellipse should collide' , () => {
    const dummyEllipse: Ellipse = new Ellipse(new Color(0, 0, 0), new Color(0, 0, 0),
                                    1, StrokeType.FullWithOutline, new Point(15, 10), 20, 10);
    dummyEllipse['setWidth'](20);
    dummyEllipse['setHeight'](10);
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0),
                                    3, StrokeType.FullWithOutline, new Point(0, 0), 2, 2);
    rectangle.setNewDimension(2, 2);
    rectangle.setCenter(new Point(15, 5));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(true);

    rectangle.setCenter(new Point(25, 10));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(true);

    rectangle.setCenter(new Point(15, 15));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(true);

    rectangle.setCenter(new Point(5, 10));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(true);

    rectangle.setCenter(new Point(15, 10));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(true);

    rectangle.setNewDimension(30, 20);
    rectangle.setCenter(new Point(15, 10));
    expect(service['checkCollisionWithEllipse'](rectangle, dummyEllipse)).toBe(true);
  });

  // Collision rectangle and line
    it('Rectangles and Line shouldn\'t collide' , () => {
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 3, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    const line: Line = new Line(new Color(0, 0, 0), 2, Pattern.FullLine, LineJoin.Round, LineCap.Round, 2, 2);
    line.points = [];
    line.points.push(new Point(5, 20));
    line.points.push(new Point(7, 22));
    line.points.push(new Point(9, 22));
    line.points.push(new Point(9, 20));
    expect(service['checkCollisionWithLine'](rectangle, line)).toBe(false);

    line.points = [];
    line.points.push(new Point(25, 19));
    line.points.push(new Point(29, 15));
    expect(service['checkCollisionWithLine'](rectangle, line)).toBe(false);

    line.points = [];
    line.points.push(new Point(28, 6));
    line.points.push(new Point(30, 2));
    line.points.push(new Point(22, 1));
    expect(service['checkCollisionWithLine'](rectangle, line)).toBe(false);

    line.points = [];
    line.points.push(new Point(2, 2));
    line.points.push(new Point(30, 2));
    line.points.push(new Point(30, 25));
    line.points.push(new Point(2, 25));
    expect(service['checkCollisionWithLine'](rectangle, line)).toBe(false);

  });

  // Collision rectangle with Line
    it('Rectangles and Line should collide' , () => {
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 3, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    const line: Line = new Line(new Color(0, 0, 0), 2, Pattern.FullLine, LineJoin.Round, LineCap.Round, 2, 2);
    line.points = [];
    line.points.push(new Point(5, 5));
    line.points.push(new Point(10, 10));
    line.points.push(new Point(9, 22));
    line.points.push(new Point(9, 20));
    expect(service['checkCollisionWithLine'](rectangle, line)).toBe(true);

    line.points = [];
    line.points.push(new Point(10, 10));
    line.points.push(new Point(10, 11));
    expect(service['checkCollisionWithLine'](rectangle, line)).toBe(true);

    line.points = [];
    line.points.push(new Point(2, 10));
    line.points.push(new Point(10, 2));
    line.points.push(new Point(22, 1));
    expect(service['checkCollisionWithLine'](rectangle, line)).toBe(true);

    line.points = [];
    line.points.push(new Point(2, 2));
    line.points.push(new Point(30, 2));
    line.points.push(new Point(2, 3));
    line.points.push(new Point(30, 3));
    line.points.push(new Point(2, 4));
    line.points.push(new Point(30, 4));
    line.points.push(new Point(30, 22));
    line.points.push(new Point(25, 22));
    line.points.push(new Point(15, 15));
    line.points.push(new Point(30, 3));
    expect(service['checkCollisionWithLine'](rectangle, line)).toBe(true);
  });

  // Collision rectangle and path
    it('Rectangles and path shouldn\'t collide' , () => {
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 3, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    const paint: Path = new Path(new Color(0, 0, 0), 2, PrimitiveType.Paint);
    paint.points = [];
    paint.points.push(new Point(5, 20));
    paint.points.push(new Point(7, 22));
    paint.points.push(new Point(9, 22));
    paint.points.push(new Point(9, 20));
    expect(service['checkCollisionWithPath'](rectangle, paint)).toBe(false);

    paint.points = [];
    paint.points.push(new Point(25, 19));
    paint.points.push(new Point(29, 15));
    expect(service['checkCollisionWithPath'](rectangle, paint)).toBe(false);

    paint.points = [];
    paint.points.push(new Point(28, 6));
    paint.points.push(new Point(30, 2));
    paint.points.push(new Point(22, 1));
    expect(service['checkCollisionWithPath'](rectangle, paint)).toBe(false);

    paint.points = [];
    paint.points.push(new Point(2, 2));
    paint.points.push(new Point(30, 2));
    paint.points.push(new Point(30, 25));
    paint.points.push(new Point(2, 25));
    expect(service['checkCollisionWithPath'](rectangle, paint)).toBe(false);

  });

  // Collision rectangle with Path
    it('Rectangles and Path should collide' , () => {
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 3, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    const paint: Path = new Path(new Color(0, 0, 0), 2, PrimitiveType.Paint);
    paint.points = [];
    paint.points.push(new Point(5, 5));
    paint.points.push(new Point(10, 10));
    paint.points.push(new Point(9, 22));
    paint.points.push(new Point(9, 20));
    expect(service['checkCollisionWithPath'](rectangle, paint)).toBe(true);

    paint.points = [];
    paint.points.push(new Point(10, 10));
    paint.points.push(new Point(10, 11));
    expect(service['checkCollisionWithPath'](rectangle, paint)).toBe(true);

    paint.points = [];
    paint.points.push(new Point(2, 10));
    paint.points.push(new Point(10, 2));
    paint.points.push(new Point(22, 1));
    expect(service['checkCollisionWithPath'](rectangle, paint)).toBe(true);

    paint.points = [];
    paint.points.push(new Point(2, 2));
    paint.points.push(new Point(30, 2));
    paint.points.push(new Point(2, 3));
    paint.points.push(new Point(30, 3));
    paint.points.push(new Point(2, 4));
    paint.points.push(new Point(30, 4));
    paint.points.push(new Point(30, 22));
    paint.points.push(new Point(25, 22));
    paint.points.push(new Point(15, 15));
    paint.points.push(new Point(30, 3));
    expect(service['checkCollisionWithPath'](rectangle, paint)).toBe(true);
  });

  // Collision entre 2 rectangles
    it('Rectangles shouldn\'t collide' , () => {
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    const rectangle2: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle2.setNewDimension(2, 2);
    rectangle2.setCenter(new Point(1, 1));
    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(false);

    rectangle2.setNewDimension(10, 10);
    rectangle2.setCenter(new Point(100, 100));
    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(false);
    rectangle2.setNewDimension(5, 2);
    rectangle2.setCenter(new Point(30, 45));
    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(false);

  });

  // Collision entre 2 rectangles
    it('Rectangles should collide' , () => {
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    const rectangle2: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle2.setNewDimension(2, 2);
    rectangle2.setCenter(new Point(5, 5));
    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(true);

    rectangle2.setNewDimension(1, 1);
    rectangle2.setCenter(new Point(5, 5));
    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(true);

    rectangle2.setNewDimension(2, 2);
    rectangle2.setCenter(new Point(25, 15));
    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(true);

    rectangle2.setNewDimension(2, 2);
    rectangle2.setCenter(new Point(5, 15));

    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(true);

    rectangle2.setNewDimension(3, 3);
    rectangle2.setCenter(new Point(10.5, 10.5));

    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(true);

    rectangle2.setNewDimension(28, 18);
    rectangle2.setCenter(new Point(14, 9));

    expect(service['checkCollisionWithRectangle'](rectangle, rectangle2)).toBe(true);

  });

  // Détection rectangle et polygone
    it('Rectangle and polygon shouldn\'t collide' , () => {
    const polygon: Polygon = new Polygon(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(15, 10));
    polygon.points = [];
    polygon.points.push(new Point(15, 6));
    polygon.points.push(new Point(7, 15));
    polygon.points.push(new Point(23, 15));
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(2, 2);
    rectangle.setCenter(new Point(5, 5));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(false);

    rectangle.setCenter(new Point(10, 8));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(false);

    rectangle.setCenter(new Point(35, 35));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(false);

  });

  // Collision entre rectangle et polygone
    it('Rectangle and polygon should collide' , () => {
    const polygon: Polygon = new Polygon(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(15, 10));
    polygon.points = [];
    polygon.points.push(new Point(15, 6));
    polygon.points.push(new Point(7, 15));
    polygon.points.push(new Point(23, 15));
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(2, 2);
    rectangle.setCenter(new Point(15, 15));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(true);

    rectangle.setCenter(new Point(19, 10));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(true);

    rectangle.setCenter(new Point(24, 15));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(true);

    rectangle.setCenter(new Point(15, 14));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(true);

    rectangle.setCenter(new Point(8, 13));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(true);

    rectangle.setCenter(new Point(11, 10));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(true);

  });

  // rectangle à l'intérieur d'un polygone et vice versa
    it('Rectangle inside polygon should collide and vice versa' , () => {
    const polygon: Polygon = new Polygon(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(15, 10));
    polygon.points = [];
    polygon.points.push(new Point(15, 6));
    polygon.points.push(new Point(7, 15));
    polygon.points.push(new Point(23, 15));
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));

    rectangle.setNewDimension(2, 2);
    rectangle.setCenter(new Point(15, 10));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(true);

    rectangle.setNewDimension(30, 20);
    rectangle.setCenter(new Point(16, 11));
    expect(service['checkCollisionWithPolygon'](rectangle, polygon)).toBe(true);
  });

  // test de testCollision entre un rectangle et une primitive
    it('The collisions should all be true for a specific prmitive', () => {
    const eraser: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));
    eraser.setNewDimension(2, 2);
    // polygon
    const polygon: Polygon = new Polygon(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(15, 10));
    polygon.points = [];
    polygon.points.push(new Point(15, 6));
    polygon.points.push(new Point(7, 15));
    polygon.points.push(new Point(23, 15));

    eraser.setCenter(new Point(15, 6));
    expect(service['checkCollision'](eraser, polygon)).toBe(true);

    // rectangle
    const rectangle: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 1, StrokeType.FullWithOutline, new Point(0, 0));
    rectangle.setNewDimension(20, 10);
    rectangle.setCenter(new Point(15, 10));
    expect(service['checkCollision'](eraser, rectangle)).toBe(true);

    // Pencil
    const pencil: Path = new Path(new Color(0, 0, 0), 2, PrimitiveType.Pencil);
    pencil.points = [];
    pencil.points.push(new Point(5, 5));
    pencil.points.push(new Point(10, 10));
    pencil.points.push(new Point(9, 22));
    pencil.points.push(new Point(9, 20));
    eraser.setCenter(new Point(7, 7));
    expect(service['checkCollision'](eraser, pencil)).toBe(true);

    // Paint
    const paint: Path = new Path(new Color(0, 0, 0), 2, PrimitiveType.Paint);
    paint.points = [];
    paint.points.push(new Point(5, 5));
    paint.points.push(new Point(10, 10));
    paint.points.push(new Point(9, 22));
    paint.points.push(new Point(9, 20));
    eraser.setCenter(new Point(7, 7));
    expect(service['checkCollision'](eraser, paint)).toBe(true);

    // Pen
    const pen: Path = new Path(new Color(0, 0, 0), 2, PrimitiveType.Pen);
    pen.points = [];
    pen.points.push(new Point(5, 5));
    pen.points.push(new Point(10, 10));
    pen.points.push(new Point(9, 22));
    pen.points.push(new Point(9, 20));
    eraser.setCenter(new Point(7, 7));
    expect(service['checkCollision'](eraser, pen)).toBe(true);

    // Line

    const line: Line = new Line(new Color(0, 0, 0), 2, Pattern.FullLine, LineJoin.Round, LineCap.Round, 2, 2);
    line.points = [];
    line.points.push(new Point(5, 5));
    line.points.push(new Point(10, 10));
    line.points.push(new Point(9, 22));
    line.points.push(new Point(9, 20));
    eraser.setCenter(new Point(8, 8));
    expect(service['checkCollision'](eraser, line)).toBe(true);

    // Ellipse
    const dummyEllipse: Ellipse = new Ellipse(new Color(0, 0, 0), new Color(0, 0, 0),
                                    1, StrokeType.FullWithOutline, new Point(15, 10), 20, 10);
    dummyEllipse['topLeftCorner'] = new Point(5, 5);
    dummyEllipse['bottomRightCorner'] = new Point(25, 15);
    eraser.setCenter(new Point(8, 8));
    expect(service['checkCollision'](eraser, dummyEllipse)).toBe(true);

    const dummyText: TextPrimitive = new TextPrimitive(2, new Color(0, 0, 0), FONTS[0], ALIGNS[0], new Point(0, 0, ), true, true);
    dummyText['topLeftCorner'] = new Point(5, 5);
    dummyText['bottomRightCorner'] = new Point(25, 15);
    eraser.setCenter(new Point(8, 8));
    expect(service['checkCollision'](eraser, dummyText)).toBe(true);
  });

  // Colision entre 2 polygons
    it('the two polygon shouldn\'t collide', () => {
    const polygonA: Point[] = [];
    polygonA.push(new Point(5, 2));
    polygonA.push(new Point(9, 5));
    polygonA.push(new Point(9, 11));
    polygonA.push(new Point(4, 8));
    polygonA.push(new Point(2, 5));

    let polygonB: Point[] = [];
    polygonB.push(new Point(10, 2));
    polygonB.push(new Point(10, 5));
    polygonB.push(new Point(11, 11));
    polygonB.push(new Point(15, 2));

    expect(service['checkPolygonInPolygon'](polygonA, polygonB)).toBe(false);

    polygonB = [];
    expect(service['checkPolygonInPolygon'](polygonA, polygonB)).toBe(false);

    polygonB = [];
    polygonB.push(new Point(25, 2));
    polygonB.push(new Point(25, 25));
    polygonB.push(new Point(14, 1));

    expect(service['checkPolygonInPolygon'](polygonA, polygonB)).toBe(false);
  });

    it('the two polygon should collide', () => {
    const polygonA: Point[] = [];
    polygonA.push(new Point(5, 2));
    polygonA.push(new Point(9, 5));
    polygonA.push(new Point(9, 11));
    polygonA.push(new Point(4, 8));
    polygonA.push(new Point(2, 5));

    let polygonB: Point[] = [];
    polygonB.push(new Point(5, 4));
    polygonB.push(new Point(8, 6));
    polygonB.push(new Point(8, 8));
    polygonB.push(new Point(7, 9));
    polygonB.push(new Point(7, 7));
    polygonB.push(new Point(6, 7));
    polygonB.push(new Point(4, 6));

    expect(service['checkPolygonInPolygon'](polygonA, polygonB)).toBe(true);

    polygonB = [];
    polygonB.push(new Point(0, 0));
    polygonB.push(new Point(10, 0));
    polygonB.push(new Point(10, 12));
    polygonB.push(new Point(2, 10));
    polygonB.push(new Point(2, 7));
    polygonB.push(new Point(1, 6));
    expect(service['checkPolygonInPolygon'](polygonA, polygonB)).toBe(true);
  });

  // collision entre point et polygon
    it('The method to check point in polygon should correctly works', () => {
    const polygonA: Point[] = [];
    polygonA.push(new Point(5, 2));
    polygonA.push(new Point(9, 5));
    polygonA.push(new Point(9, 11));
    polygonA.push(new Point(4, 8));
    polygonA.push(new Point(2, 5));
    expect(service['pointInPolygon'](polygonA, new Point(5, 5))).toBe(true);
    expect(service['pointInPolygon'](polygonA, new Point(8, 9))).toBe(true);
    expect(service['pointInPolygon'](polygonA, new Point(4, 7))).toBe(true);
    expect(service['pointInPolygon'](polygonA, new Point(3, 7))).toBe(false);
    expect(service['pointInPolygon'](polygonA, new Point(0, 0))).toBe(false);
    expect(service['pointInPolygon'](polygonA, new Point(10, 10))).toBe(false);
    expect(service['pointInPolygon'](polygonA, new Point(9, 11.65))).toBe(false);
  });

});
