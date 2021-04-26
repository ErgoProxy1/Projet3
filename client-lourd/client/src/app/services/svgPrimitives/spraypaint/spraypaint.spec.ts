import { TestBed } from '@angular/core/testing';
import { Color } from '../../utils/color';
import { DEFAULT_SPRAYPAINT_DELAY, DEFAULT_SPRAYPAINT_RANGE,
  PrimitiveType, SPRAYPAINT_FLOW_SIZE } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { Spraypaint } from './spraypaint';

// tslint:disable: no-string-literal
describe('Spraypaint', () => {
  let spraypaint: Spraypaint;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    spraypaint = new Spraypaint(Color.BLACK, DEFAULT_SPRAYPAINT_DELAY, DEFAULT_SPRAYPAINT_RANGE);
  });

  it('should be properly created', () => {
    expect(spraypaint).toBeTruthy();
    expect(spraypaint.points.length).toBe(0);
    expect(spraypaint.strokeColor).toEqual(Color.BLACK);
    expect(spraypaint.range).toBe(DEFAULT_SPRAYPAINT_RANGE);
    expect(spraypaint.type).toBe(PrimitiveType.Spraypaint);
    expect(spraypaint.paintDelay).toBe(DEFAULT_SPRAYPAINT_DELAY);
  });

  it('#createCopy correctly copies the spraypaint', () => {
    const newSpraypaint = Spraypaint.createCopy(spraypaint);
    expect(newSpraypaint).toEqual(spraypaint);
  });

  it('#spray should correctly spray the spraypaint points', () => {
    spraypaint.spray(new Point(50, 100));
    expect(spraypaint.points.length).toEqual(SPRAYPAINT_FLOW_SIZE);
  });

  it('#copy should correctly copies the spraypaint', () => {
    const newSpraypaint = spraypaint.copy();
    expect(newSpraypaint).toEqual(spraypaint);
  });

  it('#move should correctly change the position of the spraypaint', () => {
    const newSpraypaint: Spraypaint = spraypaint.copy();
    spraypaint.points = [new Point(0, 0), new Point(50, 50), new Point(25, 25)];
    newSpraypaint.points = [new Point(100, 100), new Point(150, 150), new Point(125, 125)];
    const translation: Point = new Point(100, 100);
    spraypaint.move(translation);
    newSpraypaint['topLeftCorner'] = translation;
    newSpraypaint['bottomRightCorner'] = translation;
    expect(newSpraypaint).toEqual(spraypaint);
  });

});
