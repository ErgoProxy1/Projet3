import { Color } from 'src/app/services/utils/color';
import { HandleType, StrokeType } from 'src/app/services/utils/constantsAndEnums';
import { Point } from 'src/app/services/utils/point';
import { Ellipse } from '../ellipse';

export class Handle extends Ellipse {
    SELECTABLE = false;
    handleType: HandleType;

    constructor(position: Point, handleType: HandleType) {
        super(Color.WHITE, Color.BLACK, 1, StrokeType.FullWithOutline, position, 5, 5);
        this.handleType = handleType;
    }
}
