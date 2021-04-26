import { Path } from '../svgPrimitives/path/path';
import { DrawingToolCommand } from '../toolCommands/drawingToolCommand';
import { Color } from '../utils/color';
import { KeyboardEventType, MouseEventType, PrimitiveType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import {PencilTool} from './pencilTool';

describe('PencilTool', () => {
    let tool: PencilTool = new PencilTool(new Color(128, 64, 32, 0.5));
    const commandAttributeName = 'command';

    beforeEach(() => {
        tool = new PencilTool(new Color(128, 64, 32, 0.5));
      });

    it('Beginning is correctly identified', () => {
        const expected: Path = new Path(new Color(128, 64, 32, 0.5), 5, PrimitiveType.Pencil);
        expected.addPoint(new Point(50, 50));
        tool.mouseEvent(MouseEventType.MouseDownLeft, new Point(50, 50));
        expect(tool.getTemporaryPrimitives()).toEqual([expected]);
    });

    it('Path is properly updated', () => {
        const expected: Path = new Path(new Color(128, 64, 32, 0.5), 5, PrimitiveType.Pencil);
        expected.addPoint(new Point(50, 50));
        expected.addPoint(new Point(51, 51));
        tool.mouseEvent(MouseEventType.MouseDownLeft, new Point(50, 50));
        tool.mouseEvent(MouseEventType.MouseMove, new Point(51, 51));
        expect(tool.getTemporaryPrimitives()).toEqual([expected]);
    });

    it('Path properly finishes', () => {
        const expected: DrawingToolCommand = new DrawingToolCommand(new Color(128, 64, 32, 0.5), 5, PrimitiveType.Pencil);
        expected.path.addPoint(new Point(50, 50));
        expected.path.addPoint(new Point(51, 51));
        expected.path.addPoint(new Point(52, 52));
        tool.mouseEvent(MouseEventType.MouseDownLeft, new Point(50, 50));
        tool.mouseEvent(MouseEventType.MouseMove, new Point(51, 51));
        tool.mouseEvent(MouseEventType.MouseUpLeft, new Point(52, 52));
        expect(tool[commandAttributeName]).toEqual(expected);
    });

    it('Other functions return empty arrays', () => {
        tool.mouseEvent(MouseEventType.MouseDownRight, new Point(0, 0));
        expect(tool.getTemporaryPrimitives()).toEqual([]);
        tool.mouseEvent(MouseEventType.MouseUpRight, new Point(0, 0));
        expect(tool.getTemporaryPrimitives()).toEqual([]);
        tool.mouseEvent(MouseEventType.InvalidEvent, new Point(0, 0));
        expect(tool.getTemporaryPrimitives()).toEqual([]);
        tool.keyboardEvent(KeyboardEventType.InvalidEvent);
        expect(tool.getTemporaryPrimitives()).toEqual([]);
        tool.mouseWheelEvent(0);
        expect(tool.getTemporaryPrimitives()).toEqual([]);
    });
});
