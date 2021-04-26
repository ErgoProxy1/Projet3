import { Path } from '../svgPrimitives/path/path';
import { Pen } from '../svgPrimitives/pen/pen';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { Color } from '../utils/color';
import { PrimitiveType, Texture } from '../utils/constantsAndEnums';
import { ToolCommand } from './toolCommand';

export class DrawingToolCommand implements ToolCommand {
  path: Path;
  readonly STROKE_WIDTH: number;
  constructor(strokeColor: Color, strokeWidth: number, type: PrimitiveType, texture: Texture = Texture.Basic) {

    this.path = (type === PrimitiveType.Pen) ?
      new Pen(strokeColor, strokeWidth, type, texture) : new Path(strokeColor, strokeWidth, type, texture);

    this.STROKE_WIDTH = this.path.strokeWidth;
  }

  apply(primitives: SVGPrimitive[]): void {
    primitives.push(this.path);
  }

  cancel(primitives: SVGPrimitive[]): void {
    const index = primitives.indexOf(this.path, 0);
    if (index > -1) {
      primitives.splice(index, 1);
    }
  }
}
