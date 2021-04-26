import { Color } from '../utils/color';
import { PrimitiveType } from '../utils/constantsAndEnums';
import { DrawingToolCommand } from './drawingToolCommand';

export class PencilToolCommand extends DrawingToolCommand {
  constructor(strokeColor: Color, strokeWidth: number) {
    super(strokeColor, strokeWidth, PrimitiveType.Pencil);
  }
}
