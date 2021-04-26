import { TestBed } from '@angular/core/testing';
import { Color } from '../../utils/color';
import { MIN_STROKE_WIDTH, PrimitiveType, Texture } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Path } from './path';

// tslint:disable: no-string-literal
describe('Path', () => {
  let path: Path;
  const nullTranslation = new Point(0, 0);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    path = new Path(Color.BLACK, MIN_STROKE_WIDTH, PrimitiveType.Paint, Texture.Degraded);

  });

  it('should not change the path if scale is called with no translation and with scale factors equal to 1', () => {
    // Scale conservé
    path.addPoint(new Point(100, 100));
    path.addPoint(new Point(200, 100));
    path.scale(nullTranslation, 1, 1);
    expect(path.points.length).toEqual(2);
    expect(path.points[0].x).toEqual(100);
    expect(path.points[0].y).toEqual(100);
    expect(path.points[1].x).toEqual(200);
    expect(path.points[1].y).toEqual(100);
  });

  it('should only scale the path in the x axis if the y scale factor is equal to 1', () => {
    // En X seulement
    path.addPoint(new Point(100, 100));
    path.addPoint(new Point(200, 100));
    path.scale(nullTranslation, 2, 1);
    expect(path.points[0].x).toEqual(200);
    expect(path.points[0].y).toEqual(100);
    expect(path.points[1].x).toEqual(400);
    expect(path.points[1].y).toEqual(100);
  });

  it('should only scale the path in the y axis if the x scale factor is equal to 1', () => {
    // En Y seulement
    path.addPoint(new Point(100, 100));
    path.addPoint(new Point(100, 200));
    path.scale(nullTranslation, 1, 2);
    expect(path.points[0].x).toEqual(100);
    expect(path.points[0].y).toEqual(200);
    expect(path.points[1].x).toEqual(100);
    expect(path.points[1].y).toEqual(400);
  });

  it('should scale the path in both axes if both scale factors are different than 1', () => {
    // Combiné
    path.addPoint(new Point(100, 100));
    path.addPoint(new Point(200, 200));
    path.scale(nullTranslation, 2, 2);
    expect(path.points[0].x).toEqual(200);
    expect(path.points[0].y).toEqual(200);
    expect(path.points[1].x).toEqual(400);
    expect(path.points[1].y).toEqual(400);
  });

  it('should be properly created', () => {
    expect(path).toBeTruthy();
    expect(path.commandSvg.length).toBe(0);
    expect(path.strokeColor).toEqual(Color.BLACK);
    expect(path.strokeWidth).toBe(MIN_STROKE_WIDTH);
    expect(path.texture).toBe(Texture.Degraded);
    expect(path.type).toBe(PrimitiveType.Paint);
  });

  it('should have default texture if not specified', () => {
    path = new Path(Color.BLACK, PrimitiveType.Paint, MIN_STROKE_WIDTH);
    expect(path.texture).toBe(Texture.Basic);
  });

  it('should correctly add the first point', () => {
    expect(path.commandSvg.length).toBe(0);
    path.addPoint(new Point(10, 20));
    expect(path.commandSvg).toBe('M10 20 L10 20');
  });

  it('should correctly add points after the first one', () => {
    expect(path.commandSvg.length).toBe(0);
    path.addPoint(new Point(10, 20));
    path.addPoint(new Point(30, 40));
    expect(path.commandSvg).toBe('M10 20 L10 20 L30 40');
    path.addPoint(new Point(50, 60));
    expect(path.commandSvg).toBe('M10 20 L10 20 L30 40 L50 60');
  });

  it('#createCopy correctly copies the path', () => {
    const newPath = Path.createCopy(path);
    expect(newPath).toEqual(path);
  });

  it('#move should correctly change the position of the path', () => {
    const newPath: Path = path.copy();
    const pathPoints: Point[] = [new Point(0, 0), new Point(50, 50), new Point(25, 25)];
    pathPoints.forEach((point: Point) => {
      path.addPoint(point);
    });
    const newPathPoints: Point[] = [new Point(100, 100), new Point(150, 150), new Point(125, 125)];
    newPathPoints.forEach((point: Point) => {
      newPath.addPoint(point);
    });
    const translation: Point = new Point(100, 100);
    path.move(translation);
    newPath['topLeftCorner'] = translation;
    newPath['bottomRightCorner'] = translation;
    expect(newPath).toEqual(path);
  });
});
