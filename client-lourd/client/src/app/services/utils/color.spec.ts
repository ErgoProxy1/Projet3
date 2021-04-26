import {Color} from './color';

describe('Color', () => {

    it('Copy of color is properly done', () => {
        const testColor: Color = new Color(128, 64, 32, 1);
        const copyColor: Color = Color.copyColor(testColor);
        expect(copyColor).toEqual(testColor);
    });

    it('Color is properly changed', () => {
        const testColor: Color = new Color(45, 64, 32, 1);
        const newColor: Color = new Color(32, 64, 128, 0.5);
        testColor.changeColor(newColor, 0.5);
        expect(testColor.r).toBe(32);
        expect(testColor.g).toBe(64);
        expect(testColor.b).toBe(128);
        expect(testColor.a).toBe(0.5);
    });

    it('Color properly converted to string', () => {
        const testColor: Color = new Color(128, 64, 32, 1);
        expect(testColor.asString()).toBe('rgba(128,64,32,1)');
    });
});
