import { Color } from '../../utils/color';
import { ALIGNS, FONTS } from '../../utils/constantsAndEnums';
import { Point } from '../../utils/point';
import { TextPrimitive } from './textPrimitive';

// tslint:disable: no-string-literal
describe('TextPrimitive', () => {
  let text: TextPrimitive;

  beforeEach(() => {
    text = new TextPrimitive(16, new Color(0, 0, 0, 1), FONTS[0], ALIGNS[0], new Point(50, 50), true, false);
  });

  it('text primitive is properly constructed', () => {
    expect(text.fontWeight).toBe('bold');
    expect(text.fontStyle).toBe('normal');
    expect(text.size).toBe(16);
    expect(text.textColor).toEqual(new Color(0, 0, 0, 1));
    expect(text.font).toEqual(FONTS[0]);
    expect(text.align).toEqual(ALIGNS[0]);
    expect(text.position).toEqual(new Point(50, 50));
    expect(text.lines).toEqual([{ innertext: '', position: new Point(50, 50) }]);
  });

  it('text primitive is properly copied', () => {
    const copyText: TextPrimitive = text.copy();
    expect(copyText.fontWeight).toBe('bold');
    expect(copyText.fontStyle).toBe('normal');
    expect(copyText.size).toBe(16);
    expect(copyText.textColor).toEqual(new Color(0, 0, 0, 1));
    expect(copyText.font).toEqual(FONTS[0]);
    expect(copyText.align).toEqual(ALIGNS[0]);
    expect(copyText.position).toEqual(new Point(50, 50));
    expect(copyText.lines).toEqual([{ innertext: '', position: new Point(50, 50) }]);
  });

  it('#move should correctly change the position of the text', () => {
    const newText: TextPrimitive = text.copy();
    const translation: Point = new Point(100, 100);
    newText.position = new Point(150, 150);
    newText.lines[0].position = new Point(150, 150);
    newText.createTextTransformationsStrings();
    text.move(translation);
    newText['topLeftCorner'] = translation;
    newText['bottomRightCorner'] = translation;
    expect(newText).toEqual(text);
  });
});
