import { Path } from '../svgPrimitives/path/path';
import { DrawingToolCommand } from '../toolCommands/drawingToolCommand';
import { Color } from '../utils/color';
import { PrimitiveType, ToolType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { DrawingTool } from './drawingTool';

export class PencilTool extends DrawingTool {
  TYPE = ToolType.Pencil;
  path: Path;

  constructor(strokeColor: Color) {
    super(strokeColor);
  }

  protected begin(position: Point): void {
    this.command = new DrawingToolCommand(this.strokeColor, this.strokeWidth, PrimitiveType.Pencil);
    super.begin(position);
  }
}
