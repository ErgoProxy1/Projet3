import { TestBed } from '@angular/core/testing';
import { Color } from '../../utils/color';
import { MIN_STROKE_WIDTH, PrimitiveType, Texture } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Pen } from './pen';

// tslint:disable: no-string-literal
describe('Pen', () => {
  let pen: Pen;
  const nullTranslation = new Point(0, 0);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pen = new Pen(Color.BLACK, MIN_STROKE_WIDTH, PrimitiveType.Paint, Texture.Degraded);

  });

  it('should be properly created', () => {
    expect(pen).toBeTruthy();
    expect(pen.commandSvg.length).toBe(0);
    expect(pen.strokeColor).toEqual(Color.BLACK);
    expect(pen.strokeWidth).toBe(MIN_STROKE_WIDTH);
    expect(pen.texture).toBe(Texture.Degraded);
    expect(pen.type).toBe(PrimitiveType.Paint);
    expect(pen.headPoints.length).toBe(0);
  });

  it('should have default texture if not specified', () => {
    pen = new Pen(Color.BLACK, PrimitiveType.Paint, MIN_STROKE_WIDTH);
    expect(pen.texture).toBe(Texture.Basic);
  });

  it('should correctly add the first point', () => {
    expect(pen.commandSvg.length).toBe(0);
    pen.addPoint(new Point(10, 20));
    expect(pen.commandSvg).toBe('M10 20 L10 20');
  });

  it('#addPoint should correctly add points after the first one', () => {
    expect(pen.commandSvg.length).toBe(0);
    pen.addPoint(new Point(10, 20));
    pen.addPoint(new Point(30, 40));
    expect(pen.commandSvg).toBe('M10 20 L10 20 L30 40');
    pen.addPoint(new Point(50, 60));
    expect(pen.commandSvg).toBe('M10 20 L10 20 L30 40 L50 60');
  });

  it('#createCopy correctly copies the pen', () => {
    const newPen = Pen.createCopy(pen);
    expect(newPen).toEqual(pen);
  });

  it('#addPath should correctely change the attributes paths and points', () => {
    pen.addPath(new Point(10, 20), 14);
    pen.addPath(new Point(30, 40), 13);
    pen.addPath(new Point(35, 45), 12);
    pen.addPath(new Point(50, 45), 11);
    pen.addPath(new Point(50, 60), 10);
    expect(pen.headPoints.length).toBe(2);
    expect(pen.points.length).toBe(0);
    expect(pen.paths[pen.paths.length - 1].commandSVG).toEqual('M50 45 L50 45 L50 60');
    expect(pen.paths[pen.paths.length - 1].strokeWidth).toBe(10);
    pen.addPath(new Point(100, 70), 9);
    expect(pen.paths[pen.paths.length - 1].commandSVG).toEqual('M50 60 L50 60 L100 70');
    expect(pen.paths[pen.paths.length - 1].strokeWidth).toBe(9);
  });

  it('#move should correctly change the position of the pen', () => {
    expect(pen.headPoints.length).toEqual(0);
    const newPen: Pen = pen.copy();
    const translation: Point = new Point(100, 100);
    for (let i = 0; i < 3; i++) {
      pen.addPath(new Point(i * 10, (i + 1) * 10), i * 5);
      pen.addPoint(new Point(i * 10, (i + 1) * 10));
      newPen.addPath(Point.sumPoints(new Point(i * 10, (i + 1) * 10), translation), i * 5);
      newPen.addPoint(Point.sumPoints(new Point(i * 10, (i + 1) * 10), translation));
    }
    pen.move(translation);
    newPen['topLeftCorner'] = translation;
    newPen['bottomRightCorner'] = translation;
    expect(newPen).toEqual(pen);
  });

  it('should not change the path if scale is called with no translation and with scale factors equal to 1', () => {
    // Scale conservé
    pen.addPoint(new Point(100, 100));
    pen.addPoint(new Point(200, 100));
    pen.addPath(new Point(100, 100), 10);
    pen.addPath(new Point(200, 100), 10);
    pen.scale(nullTranslation, 1, 1);
    expect(pen.points.length).toEqual(2);
    expect(pen.points[0].x).toEqual(100);
    expect(pen.points[0].y).toEqual(100);
    expect(pen.points[1].x).toEqual(200);
    expect(pen.points[1].y).toEqual(100);
    expect(pen.paths.length).toEqual(2);
  });

  it('should only scale the path in the x axis if the y scale factor is equal to 1', () => {
    // En X seulement
    pen.addPoint(new Point(100, 100));
    pen.addPoint(new Point(200, 100));
    pen.addPath(new Point(100, 100), 10);
    pen.addPath(new Point(200, 100), 10);
    pen.scale(nullTranslation, 2, 1);
    expect(pen.points[0].x).toEqual(200);
    expect(pen.points[0].y).toEqual(100);
    expect(pen.points[1].x).toEqual(400);
    expect(pen.points[1].y).toEqual(100);
  });

  it('should only scale the pen in the y axis if the x scale factor is equal to 1', () => {
    // En Y seulement
    pen.addPoint(new Point(100, 100));
    pen.addPoint(new Point(100, 200));
    pen.addPath(new Point(100, 100), 10);
    pen.addPath(new Point(100, 200), 10);
    pen.scale(nullTranslation, 1, 2);
    expect(pen.points[0].x).toEqual(100);
    expect(pen.points[0].y).toEqual(200);
    expect(pen.points[1].x).toEqual(100);
    expect(pen.points[1].y).toEqual(400);
  });

  it('should scale the pen in both axes if both scale factors are different than 1', () => {
    // Combiné
    pen.addPoint(new Point(100, 100));
    pen.addPoint(new Point(200, 200));
    pen.addPath(new Point(100, 100), 10);
    pen.addPath(new Point(200, 200), 10);
    pen.scale(nullTranslation, 2, 2);
    expect(pen.points[0].x).toEqual(200);
    expect(pen.points[0].y).toEqual(200);
    expect(pen.points[1].x).toEqual(400);
    expect(pen.points[1].y).toEqual(400);
  });
});
