import { TestBed } from '@angular/core/testing';
import { Color } from '../../utils/color';
import { CIRCLE_RADIUS_FACTOR, DEFAULT_LINE_ROUNDING, LineCap,
  LineJoin, MIN_STROKE_WIDTH, Pattern, PrimitiveType } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Line } from './line';

// tslint:disable: no-string-literal
describe('Line', () => {
  let line: Line;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    line = new Line(Color.BLACK, MIN_STROKE_WIDTH, Pattern.FullLine, LineJoin.Miter,
      LineCap.Round, CIRCLE_RADIUS_FACTOR * MIN_STROKE_WIDTH, DEFAULT_LINE_ROUNDING);

  });

  it('should be properly created', () => {
    expect(line).toBeTruthy();
    expect(line.points.length).toBe(0);
    expect(line.strokeColor).toEqual(Color.BLACK);
    expect(line.strokeWidth).toBe(MIN_STROKE_WIDTH);
    expect(line.pattern).toBe(Pattern.FullLine);
    expect(line.lineJoin).toBe(LineJoin.Miter);
    expect(line.type).toBe(PrimitiveType.Line);
    expect(line.lineCap).toBe(LineCap.Round);
    expect(line.circleRadius).toBe(CIRCLE_RADIUS_FACTOR * MIN_STROKE_WIDTH);
    expect(line.linePoints).toEqual('');
    expect(line.circlePoints).toEqual([]);
    expect(line.lineRounding).toBe(DEFAULT_LINE_ROUNDING);
    expect(line.closePath).toEqual(false);

  });

  it('#addPoint should add a new point to the array attribute points', () => {
    const point: Point = new Point(100, 150);
    const len = line.points.length;
    line.addPoint(point);
    expect(line.points.length).toBe(len + 1);
    expect(line.points[len]).toEqual(point);
  });

  it('#setPath should set properly linePoints when the attribute points has a new point', () => {
    const point: Point = new Point(100, 150);
    const secondPoint: Point = new Point(200, 90);
    expect(line.linePoints).toBe('');
    line.addPoint(point);
    line.tempPoint = new Point(20, 25);
    line.setPath();
    expect(line.linePoints).toBe(`M${point.x} ${point.y} L${line.tempPoint.x} ${line.tempPoint.y}`);
    line.addPoint(secondPoint);
    line.setPath();
    expect(line.linePoints).toBe(`M${point.x} ${point.y} L${secondPoint.x} ${secondPoint.y} L${line.tempPoint.x} ${line.tempPoint.y}`);
  });

  it('#update should setup properly the linePoints and tempPoint attribute ', () => {
    const point: Point = new Point(100, 150);
    const secondPoint: Point = new Point(200, 90);
    expect(line.linePoints).toBe('');
    line.addPoint(point);
    line.update(point);
    expect(line.tempPoint).toEqual(point);
    expect(line.linePoints).toBe(`M${point.x} ${point.y} L${point.x} ${point.y}`);
    line.update(secondPoint);
    expect(line.tempPoint).toEqual(secondPoint);
    expect(line.linePoints).toBe(`M${point.x} ${point.y} L${secondPoint.x} ${secondPoint.y}`);
  });

  it('#createCopy correctly copies the line', () => {
    line.addPoint(new Point(0, 0));
    const newLine = Line.createCopy(line);
    expect(newLine).toEqual(line);
  });

  it('#roundingButt should correctly the bounding path ', () => {
    let startCtrlPoint: Point = new Point(100, 100);
    const slopeCtrlPoint: Point = new Point(200, 200);
    const endCtrlPoint: Point = new Point(300, 300);
    let roundingFactor = 20;

    expect(line.roundingButt(startCtrlPoint, slopeCtrlPoint, endCtrlPoint, roundingFactor)).
    toEqual(` C185.85786437626905 185.85786437626905, 200 200,
    214.14213562373095 214.14213562373095`);

    roundingFactor = 10;
    startCtrlPoint = new Point(0, 0);
    expect(line.roundingButt(startCtrlPoint, slopeCtrlPoint, endCtrlPoint, roundingFactor)).
    toEqual(` C192.92893218813452 192.92893218813452, 200 200,
    207.07106781186548 207.07106781186548`);
  });

  it('#setRoundingPath should correctly copies the line.Points', () => {
    line.tempPoint = new Point(100, 350);
    line.points.push(new Point(0, 0));
    line.points.push(new Point(10, 10));
    line.points.push(new Point(20, 20));
    line.points.push(new Point(30, 30));
    line.setRoundingPath();
    expect(line.linePoints).toEqual(`M0 0 C-4.142135623730951 -4.142135623730951, 10 10,
    24.14213562373095 24.14213562373095 C5.857864376269049 5.857864376269049, 20 20,
    34.14213562373095 34.14213562373095 C15.857864376269049 15.857864376269049, 30 30,
    34.273937576108644 49.538000347925234 L100 350`);
  });

  it('#createCopy should correctly create a line copy', () => {
    line.tempPoint = new Point(100, 350);
    const newLine = Line.createCopy(line);
    expect(newLine).toEqual(line);
  });

  it('#copy should correctly copies the line', () => {
    line.tempPoint = new Point(120, 150);
    expect(line.copy()).toEqual(line);
  });

  it('#move should correctly change the position of the line', () => {
    const newLine: Line = new Line(Color.BLACK, MIN_STROKE_WIDTH, Pattern.FullLine, LineJoin.Miter,
      LineCap.Round, CIRCLE_RADIUS_FACTOR * MIN_STROKE_WIDTH, DEFAULT_LINE_ROUNDING);
    const linePoints: Point[] = [new Point(0, 0), new Point(50, 50), new Point(25, 25)];
    linePoints.forEach((point: Point) => {
      line.addPoint(point);
      line.update(point);
    });
    const newLinePoints: Point[] = [new Point(100, 100), new Point(150, 150), new Point(125, 125)];
    newLinePoints.forEach((point: Point) => {
      newLine.addPoint(point);
      newLine.update(point);
    });
    const translation: Point = new Point(100, 100);
    line.move(translation);
    newLine['topLeftCorner'] = translation;
    newLine['bottomRightCorner'] = translation;
    expect(newLine).toEqual(line);
  });

  it('should scale correctly', () => {
    const nullTranslation = new Point(0, 0);

    line.addPoint(new Point(100, 100));
    line.addPoint(new Point(200, 100));

    // Scale conservé
    line.scale(nullTranslation, 1, 1);
    expect(line.points.length).toEqual(2);
    expect(line.points[0].x).toEqual(100);
    expect(line.points[0].y).toEqual(100);
    expect(line.points[1].x).toEqual(200);
    expect(line.points[1].y).toEqual(100);

    // En X seulement
    line.scale(nullTranslation, 2, 1);
    expect(line.points[0].x).toEqual(200);
    expect(line.points[0].y).toEqual(100);
    expect(line.points[1].x).toEqual(400);
    expect(line.points[1].y).toEqual(100);

    // En Y seulement
    line = new Line(Color.BLACK, MIN_STROKE_WIDTH, Pattern.FullLine, LineJoin.Miter,
      LineCap.Round, CIRCLE_RADIUS_FACTOR * MIN_STROKE_WIDTH, DEFAULT_LINE_ROUNDING);
    line.addPoint(new Point(100, 100));
    line.addPoint(new Point(100, 200));
    line.scale(nullTranslation, 1, 2);
    expect(line.points[0].x).toEqual(100);
    expect(line.points[0].y).toEqual(200);
    expect(line.points[1].x).toEqual(100);
    expect(line.points[1].y).toEqual(800);

    // Combiné
    line = new Line(Color.BLACK, MIN_STROKE_WIDTH, Pattern.FullLine, LineJoin.Miter,
      LineCap.Round, CIRCLE_RADIUS_FACTOR * MIN_STROKE_WIDTH, DEFAULT_LINE_ROUNDING);
    line.addPoint(new Point(100, 100));
    line.addPoint(new Point(200, 200));
    line.scale(nullTranslation, 2, 2);
    expect(line.points[0].x).toEqual(200);
    expect(line.points[0].y).toEqual(200);
    expect(line.points[1].x).toEqual(800);
    expect(line.points[1].y).toEqual(800);

    // Combiné négatif
    line = new Line(Color.BLACK, MIN_STROKE_WIDTH, Pattern.FullLine, LineJoin.Miter,
      LineCap.Round, CIRCLE_RADIUS_FACTOR * MIN_STROKE_WIDTH, DEFAULT_LINE_ROUNDING);
    line.addPoint(new Point(100, 100));
    line.addPoint(new Point(110, 110));
    line.scale(nullTranslation, -1, -1);
    expect(line.points[0].x).toEqual(-100);
    expect(line.points[0].y).toEqual(-100);
    expect(line.points[1].x).toEqual(110);
    expect(line.points[1].y).toEqual(110);
  });
});
