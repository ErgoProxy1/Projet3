import { Color } from '../../utils/color';
import { PrimitiveType } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { QuillPointsInfo } from '../../utils/quillPointsInfo';
import { Quill } from './quill';

// tslint:disable: no-string-literal
describe('Quill', () => {
  let quill: Quill;

  beforeEach(() => {
    quill = new Quill(Color.BLACK);
  });

  it('is properly constructed', () => {
    expect(quill).toBeTruthy();
    expect(quill.SELECTABLE).toBe(true);
    expect(quill.selected).toBe(false);
    expect(quill.type).toBe(PrimitiveType.Quill);
    expect(quill.strokeColor).toEqual(Color.BLACK);
    expect(quill.linePoints).toEqual(['']);
  });

  it('angle is properly changed', () => {
    quill.changeAngle(new Point(55, 55), 15, 30, 20);
    expect(quill.points).toEqual(
      [new QuillPointsInfo(new Point(65, 52), new Point(45, 58), new Point(46, 60), new Point(64, 50))],
    );
    expect(quill.linePoints).toEqual(
      ['', '65,52 45,58 46,60 64,50 '],
    );
  });

  it('points are properly calculated and added', () => {
    quill.addPoints(new Point(55, 55), new Point(50, 50), 30, 20);
    expect(quill.points).toEqual(
      [new QuillPointsInfo(new Point(59, 45), new Point(41, 55), new Point(46, 60), new Point(64, 50))],
    );
    expect(quill.linePoints).toEqual(
      ['', '59,45 41,55 46,60 64,50 '],
    );
  });

  it('lengths are properly calculated', () => {
    quill.calculateLengths(30, 20);
    expect(quill.lengthX).toBe(9);
    expect(quill.lengthY).toBe(-5);
  });

  it('is properly copied', () => {
    quill.linePoints.push('100,100 150,100 100,150 150,150');
    const copyQuill = quill.copy();
    expect(copyQuill.SELECTABLE).toBe(true);
    expect(copyQuill.selected).toBe(false);
    expect(copyQuill.type).toBe(PrimitiveType.Quill);
    expect(copyQuill.strokeColor).toEqual(Color.BLACK);
    expect(copyQuill.linePoints).toEqual(['', '100,100 150,100 100,150 150,150']);
  });

  it('#move should correctly change the position of the quill', () => {
    const newQuill: Quill = quill.copy();
    quill.points = [new QuillPointsInfo(new Point(0, 0), new Point(100, 0), new Point(0, 10), new Point(100, 10)),
                    new QuillPointsInfo(new Point(0, 10), new Point(100, 10), new Point(0, 20), new Point(100, 20))];
    const translation: Point = new Point(100, 100);
    quill.move(translation);
    newQuill.points = [new QuillPointsInfo(new Point(100, 100), new Point(200, 100), new Point(100, 110), new Point(200, 110)),
                      new QuillPointsInfo(new Point(100, 110), new Point(200, 110), new Point(100, 120), new Point(200, 120))];
    newQuill.rebuildLinePoints();
    newQuill['topLeftCorner'] = translation;
    newQuill['bottomRightCorner'] = translation;
    expect(newQuill).toEqual(quill);
  });
});
