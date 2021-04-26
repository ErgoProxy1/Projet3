import { TestBed } from '@angular/core/testing';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { Color } from '../utils/color';
import { PrimitiveType, Texture } from '../utils/constantsAndEnums';
import { DrawingToolCommand } from './drawingToolCommand';

describe('DrawingToolCommand', () => {
    let drawingToolCommand: DrawingToolCommand;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      drawingToolCommand = new DrawingToolCommand(new Color(200, 150, 100, 1), 10, PrimitiveType.Paint, Texture.Degraded);
    });

    it('should be properly created', () => {
        expect(drawingToolCommand).toBeTruthy();
        expect(drawingToolCommand.path).not.toBeNull();
      });

    it('#apply should add the current path to the list of primitives', () => {
      const primitives: SVGPrimitive[] = [];
      drawingToolCommand.apply(primitives);
      expect(primitives).toContain(drawingToolCommand.path);
    });

    it('#cancel should remove the current path from the list of primitives', () => {
      const primitives: SVGPrimitive[] = [drawingToolCommand.path];
      drawingToolCommand.cancel(primitives);
      expect(primitives).not.toContain(drawingToolCommand.path);
    });

  });
