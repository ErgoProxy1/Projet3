import { TestBed } from '@angular/core/testing';
import { Color } from '../../utils/color';
import { DEFAULT_STROKE_WIDTH, PrimitiveType, StrokeType } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Polygon } from './polygon';

// tslint:disable: no-string-literal
describe('Polygon', () => {
  const origin: Point = new Point(0, 0);
  let polygon: Polygon;
  const corner1: Point = new Point(100, 100);
  const corner2: Point = new Point(300, 300);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    polygon = new Polygon(Color.WHITE, Color.BLACK, DEFAULT_STROKE_WIDTH, StrokeType.FullWithOutline, origin, 5, 40);
  });

  it('should be created', () => {
    expect(polygon).toBeTruthy();
    expect(polygon.fillColor).toEqual(Color.WHITE);
    expect(polygon.strokeColor).toEqual(Color.BLACK);
    expect(polygon.strokeWidth).toEqual(DEFAULT_STROKE_WIDTH);
    expect(polygon.strokeType).toEqual(StrokeType.FullWithOutline);
    expect(polygon.center).toEqual(origin);
    expect(polygon.sidesNumber).toEqual(5);
    expect(polygon.radius).toEqual(40);
    expect(polygon.type).toEqual(PrimitiveType.Polygon);
  });

  it('should return the correct absolute width and height', () => {
    expect(polygon.getAbsoluteHeight()).toEqual(80);
    expect(polygon.getAbsoluteWidth()).toEqual(80);
  });

  it('should return the right number of coordinates for the polygon', () => {
    polygon.resize(corner1, corner2, true);
    expect(polygon.points.length).toEqual(6);
  });

  it('should return a good form of string', () => {
    polygon.points = [new Point(0, 0),
    new Point(10, 10),
    new Point(20, 20),
    new Point(30, 30),
    new Point(0, 0),
    ];
    polygon.pointsToString();
    expect(polygon.listPoints).toEqual('0 0,10 10,20 20,30 30,0 0');
  });

  it('should have width and height equal to 0, number of sides equal to 3, if not specified', () => {
    polygon = new Polygon(Color.WHITE, Color.BLACK, DEFAULT_STROKE_WIDTH, StrokeType.FullWithOutline,
      origin);
    expect(polygon.getAbsoluteHeight()).toEqual(0);
    expect(polygon.getAbsoluteWidth()).toEqual(0);
    expect(polygon.sidesNumber).toEqual(3);
  });

  it('should correctly update center position after being resized', () => {
    polygon.resize(corner1, corner2, false);
    const expectedCenter: Point = new Point(200, 200);
    expect(polygon.getCenter()).toEqual(expectedCenter);
  });

  it('#createCopy correctly copies the polygon', () => {
    const newPolygon = Polygon.createCopy(polygon);
    expect(newPolygon).toEqual(polygon);
  });

  it('#move should correctly change the position of the polygon', () => {
    const translation: Point = new Point(100, 100);
    const newPolygon: Polygon = new Polygon(Color.WHITE, Color.BLACK, DEFAULT_STROKE_WIDTH, StrokeType.FullWithOutline, translation, 5, 40);
    polygon.move(translation);
    newPolygon['topLeftCorner'] = translation;
    newPolygon['bottomRightCorner'] = translation;
    expect(newPolygon).toEqual(polygon);
  });
});
