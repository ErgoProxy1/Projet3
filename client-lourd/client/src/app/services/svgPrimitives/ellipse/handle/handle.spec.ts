import { Color } from 'src/app/services/utils/color';
import { HandleType, StrokeType } from 'src/app/services/utils/constantsAndEnums';
import { Point } from 'src/app/services/utils/point';
import { Handle } from './handle';

describe('Handle', () => {
    let handle: Handle;

    beforeEach(() => {
        handle = new Handle(new Point(100, 100), HandleType.None);
    });

    it('Properly constructed', () => {
        expect(handle.fillColor).toEqual(Color.WHITE);
        expect(handle.strokeColor).toEqual(Color.BLACK);
        expect(handle.strokeWidth).toBe(1);
        expect(handle.strokeType).toBe(StrokeType.FullWithOutline);
        expect(handle.center).toEqual(new Point(100, 100));
        expect(handle.radiusX).toEqual(5);
        expect(handle.radiusY).toEqual(5);
    });
});
