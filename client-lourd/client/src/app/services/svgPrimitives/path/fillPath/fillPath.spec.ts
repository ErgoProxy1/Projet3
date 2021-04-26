import { TestBed } from '@angular/core/testing';
import { Color } from 'src/app/services/utils/color';
import { Contouring, MIN_STROKE_WIDTH, PrimitiveType, StrokeType } from 'src/app/services/utils/constantsAndEnums';
import { Point } from 'src/app/services/utils/point';
import { FillingPath } from './fillPath';

// tslint:disable: no-string-literal
describe('fillPath', () => {
  let fillingPath: FillingPath;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fillingPath = new FillingPath(Color.BLACK, Color.BLACK, MIN_STROKE_WIDTH, PrimitiveType.Fill, StrokeType.FullWithOutline);
  });

  it('should setCorners correctly', () => {
    const expectedTopLeftCorner = new Point(10, 10);
    const expectedBottomRightCorner = new Point(20, 20);
    fillingPath.setCorners(new Point(10, 10), new Point(20, 20));
    expect(fillingPath.getTopLeftCorner()).toEqual(expectedTopLeftCorner);
    expect(fillingPath.getBottomRightCorner()).toEqual(expectedBottomRightCorner);
  });

  it('should move correctly', () => {
    const fillingPathPoint = new Point(100, 100);
    const contouringPoint = new Point(105, 105);
    const expectedContouringPoint = new Point(106, 106);
    const contouring: Contouring = {
      type: 'm',
      points: [contouringPoint],
    };
    const expectedContouring = {
      type: 'm',
      points: [expectedContouringPoint],
    };
    const translation = new Point(1, 1);
    fillingPath['fillingPoints'].push(fillingPathPoint);
    fillingPath['contourPoints'].push(contouring);
    fillingPath.move(translation);
    expect(fillingPath.fillingPoints[0]).toEqual(new Point(101, 101));
    expect(fillingPath.contourPoints[0]).toEqual(expectedContouring);
  });

  it('should create a copy of itself', () => {
    const primitiveBase = new FillingPath(new Color(123, 123, 123), new Color(234, 234, 234), 5
      , PrimitiveType.Fill, StrokeType.Full);
    primitiveBase.commandSvg = 'test';
    primitiveBase['topLeftCorner'] = new Point(0, 0);
    primitiveBase['bottomRightCorner'] = new Point(0, 0);
    primitiveBase.points = [];

    primitiveBase['rotation'] = 23;
    primitiveBase['scaleX'] = 2;
    primitiveBase['scaleX'] = 24;
    primitiveBase['transformations'] = '';
    primitiveBase.contourPath = '';
    primitiveBase.contourPoints = [];
    expect(FillingPath.createCopy(primitiveBase)).toEqual(primitiveBase);
  });
  it('should create a copy of itself', () => {
    const primitiveBase = new FillingPath(new Color(123, 123, 123), new Color(234, 234, 234), 5
      , PrimitiveType.Fill, StrokeType.Full);
    primitiveBase.commandSvg = 'test';
    primitiveBase['topLeftCorner'] = new Point(0, 0);
    primitiveBase['bottomRightCorner'] = new Point(0, 0);
    primitiveBase.points = [];

    primitiveBase['rotation'] = 23;
    primitiveBase['scaleX'] = 2;
    primitiveBase['scaleX'] = 24;
    primitiveBase['transformations'] = '';
    primitiveBase.contourPath = '';
    primitiveBase.contourPoints = [];
    expect(primitiveBase.copy()).toEqual(primitiveBase);
  });

  it('Should buildCommandSVG correctly', () => {
    fillingPath.fillingPoints.push(new Point(0, 0));
    fillingPath.fillingPoints.push(new Point(10, 0));
    fillingPath.fillingPoints.push(new Point(0, 4));
    fillingPath.fillingPoints.push(new Point(10, 4));
    fillingPath.fillingPoints.push(new Point(0, 8));
    fillingPath.fillingPoints.push(new Point(10, 8));
    fillingPath['buildCommandSVG']();
    const expectedString = ' M0 0  L0 0  L10 0  M0 4  L0 4  L10 4  M0 8  L0 8  L10 8 ';
    expect(fillingPath['commandSvg']).toEqual(expectedString);

  });

  it('Should buildContourPath correctly', () => {
    fillingPath.contourPoints.push({
      type: 'm',
      points: [new Point(0, 0)],
    });
    fillingPath.contourPoints.push({
      type: 'c',
      points: [new Point(0, 0), new Point(10, 10), new Point(23, 23)],
    });
    fillingPath.contourPoints.push({
      type: 'l',
      points: [new Point(53, 53)],
    });
    fillingPath['buildContourPath']();
    const expectedContourString = ' M0 0  C0 0, 10 10, 23 23  L53 53 ';
    expect(fillingPath['contourPath']).toEqual(expectedContourString);

  });

  it('Should buildCommandSVG correctly', () => {
    fillingPath.fillingPoints.push(new Point(0, 0));
    fillingPath.fillingPoints.push(new Point(10, 0));
    fillingPath.fillingPoints.push(new Point(0, 4));
    fillingPath.fillingPoints.push(new Point(10, 4));
    fillingPath.fillingPoints.push(new Point(0, 8));
    fillingPath.fillingPoints.push(new Point(10, 8));
    const expectedString = ' M0 0  L0 0  L10 0  M0 4  L0 4  L10 4  M0 8  L0 8  L10 8 ';

    fillingPath.contourPoints.push({
      type: 'm',
      points: [new Point(0, 0)],
    });
    fillingPath.contourPoints.push({
      type: 'c',
      points: [new Point(0, 0), new Point(10, 10), new Point(23, 23)],
    });
    fillingPath.contourPoints.push({
      type: 'l',
      points: [new Point(53, 53)],
    });
    fillingPath['buildContourPath']();
    const expectedContourString = ' M0 0  C0 0, 10 10, 23 23  L53 53 ';

    fillingPath.draw();
    expect(fillingPath['commandSvg']).toEqual(expectedString);
    expect(fillingPath['contourPath']).toEqual(expectedContourString);
    fillingPath['strokeType'] = StrokeType.Outline;
    fillingPath.draw();
    expect(fillingPath['commandSvg']).toEqual(expectedString);
    expect(fillingPath['contourPath']).toEqual(expectedContourString);
    fillingPath['strokeType'] = StrokeType.Full;
    fillingPath.draw();
    expect(fillingPath['commandSvg']).toEqual(expectedString);
    expect(fillingPath['contourPath']).toEqual(expectedContourString);

  });

  it('Should scale correctly', () => {
    fillingPath.fillingPoints.push(new Point(0, 0));
    fillingPath.fillingPoints.push(new Point(10, 0));
    fillingPath.fillingPoints.push(new Point(0, 4));
    fillingPath.fillingPoints.push(new Point(10, 4));
    fillingPath.fillingPoints.push(new Point(0, 8));
    fillingPath.fillingPoints.push(new Point(10, 8));
    const expectedString = ' M0 0  L0 0  L10 0  M0 4  L0 4  L10 4  M0 8  L0 8  L10 8 ';

    fillingPath.contourPoints.push({
      type: 'm',
      points: [new Point(0, 0)],
    });
    fillingPath.contourPoints.push({
      type: 'c',
      points: [new Point(0, 0), new Point(10, 10), new Point(23, 23)],
    });
    fillingPath.contourPoints.push({
      type: 'l',
      points: [new Point(53, 53)],
    });
    // Point bidon
    fillingPath.contourPoints.push({
      type: 't',
      points: [new Point(53, 53), new Point(53, 53), new Point(53, 53)],
    });
    fillingPath['buildContourPath']();
    const expectedContourString = ' M0 0  C0 0, 10 10, 23 23  L53 53 ';

    fillingPath.scale(new Point(0, 0), 2, -2);
    expect(fillingPath['commandSvg']).not.toEqual(expectedString);
    expect(fillingPath['contourPath']).not.toEqual(expectedContourString);

  });

});
