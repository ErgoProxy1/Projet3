// tslint:disable-next-line
import { KeyboardEventType, DEFAULT_GRID_SIZE, MAX_ALPHA, MAX_GRID_SIZE, MIN_GRID_ALPHA, MIN_GRID_SIZE, MouseEventType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { Grid } from './grid';

describe('Grid', () => {
    let grid: Grid;
    beforeEach(() => {
        grid = new Grid();
    });

    it('Should be truthy',  () => {
        expect(grid).toBeTruthy();
    });

    it('Should be initialized with DEFAULT_GRID_SIZE',  () => {
        expect(grid.sizeOfSquare()).toEqual(DEFAULT_GRID_SIZE);
    });

    it('Should not have size lower than MIN_GRID_SIZE',  () => {
        grid = new Grid();
        expect(grid.sizeOfSquare()).toEqual(DEFAULT_GRID_SIZE);
        expect(grid.sizeOfSquare(-123)).toEqual(MIN_GRID_SIZE);
    });

    it('Should have size of 25 after setting it',  () => {
        expect(grid.sizeOfSquare(25)).toEqual(25);
        expect(grid.sizeOfSquare()).toEqual(25);
    });

    it('Should have size of MAX_GRID_SIZE',  () => {
        grid = new Grid();
        expect(grid.sizeOfSquare(MAX_GRID_SIZE)).toEqual(MAX_GRID_SIZE);
        expect(grid.sizeOfSquare(MAX_GRID_SIZE + 2)).toEqual(MAX_GRID_SIZE);
        expect(grid.sizeOfSquare(MAX_GRID_SIZE * 2)).toEqual(MAX_GRID_SIZE);
    });

    it('Should have a transparency of MAX_ALPHA',  () => {
        grid = new Grid();
        expect(grid.colorStroke.a).toEqual(MAX_ALPHA / 2.0);
    });

    it('Should have Transparency of 0.7',  () => {
        grid.changeTransparency(0.7);
        expect(grid.colorStroke.a).toEqual(0.7);
    });

    it('Should have Transparency of 1',  () => {
        grid.changeTransparency(MAX_ALPHA);
        expect(grid.colorStroke.a).toEqual(MAX_ALPHA);
        grid.changeTransparency(1.213);
        expect(grid.colorStroke.a).toEqual(MAX_ALPHA);
        grid.changeTransparency(213213);
        expect(grid.colorStroke.a).toEqual(MAX_ALPHA);
    });

    it('Should have Transparency of minimum transparency',  () => {
        grid.changeTransparency(MIN_GRID_ALPHA);
        expect(grid.colorStroke.a).toEqual(MIN_GRID_ALPHA);
        grid.changeTransparency(-12);
        expect(grid.colorStroke.a).toEqual(MIN_GRID_ALPHA);
        grid.changeTransparency(-0.12);
        expect(grid.colorStroke.a).toEqual(MIN_GRID_ALPHA);
    });

    it('Unused functions behave as expected', () => {
        grid.mouseEvent(MouseEventType.MouseMove, new Point(50, 50));
        expect(grid.getTemporaryPrimitives()).toEqual([]);
        grid.keyboardEvent(KeyboardEventType.InvalidEvent);
        expect(grid.getTemporaryPrimitives()).toEqual([]);
        grid.mouseWheelEvent(1);
        expect(grid.getTemporaryPrimitives()).toEqual([]);
    });
});
