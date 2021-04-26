import { TestBed } from '@angular/core/testing';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { Color } from '../utils/color';
import { PencilToolCommand } from './pencilToolCommand';

describe('PaintBrushCommand', () => {
    let pencilToolCmd: PencilToolCommand;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      pencilToolCmd = new PencilToolCommand(new Color(200, 150, 100, 1), 10);
    });

    it('should be properly created', () => {
        expect(pencilToolCmd).toBeTruthy();
        expect(pencilToolCmd.path).not.toBeNull();
      });

    it('#apply should add the current path to the list of primitives', () => {
        const primitives: SVGPrimitive[] = [];
        pencilToolCmd.apply(primitives);
        expect(primitives).toContain(pencilToolCmd.path);
      });

    it('#cancel should remove the current path from the list of primitives', () => {
        const primitives: SVGPrimitive[] = [pencilToolCmd.path];
        pencilToolCmd.cancel(primitives);
        expect(primitives).not.toContain(pencilToolCmd.path);
      });
  });
