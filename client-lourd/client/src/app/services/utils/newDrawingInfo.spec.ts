import { Color } from './color';
import {NewDrawingInfo} from './newDrawingInfo';

describe('NewDrawingInfo', () => {
    it('Constructor creates object correctly', () => {
        const newDrawingInfo: NewDrawingInfo = new NewDrawingInfo(200, 300, new Color(128, 64, 32, 1));
        expect(newDrawingInfo.width).toBe(200);
        expect(newDrawingInfo.height).toBe(300);
        expect(newDrawingInfo.color.r).toBe(128);
        expect(newDrawingInfo.color.g).toBe(64);
        expect(newDrawingInfo.color.b).toBe(32);
        expect(newDrawingInfo.color.a).toBe(1);
    });
});
