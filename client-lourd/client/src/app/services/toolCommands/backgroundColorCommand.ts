import { DrawingService } from '../drawing/drawing.service';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { Color } from '../utils/color';
import { ToolCommand } from './toolCommand';

export class BackgroundColorCommand implements ToolCommand {
    lastColor: Color;
    newColor: Color;

    constructor(private drawingService: DrawingService, newColor: Color, lastColor: Color) {
        this.newColor = Color.copyColor(newColor);
        this.lastColor = Color.copyColor(lastColor);
    }

    apply(primitives: SVGPrimitive[]): void {
        this.drawingService.sendBackgroundColorData(this.newColor);
    }

    cancel(primitives: SVGPrimitive[]): void {
        this.drawingService.sendBackgroundColorData(this.lastColor);
    }
}
