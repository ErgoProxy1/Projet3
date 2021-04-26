import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { Color } from '../utils/color';
import { StrokeType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { CanvasControllerService } from './canvas-controller.service';

describe('ControllerService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
  });

  it('should be created', () => {
    const service: CanvasControllerService = TestBed.inject(CanvasControllerService);
    expect(service).toBeTruthy();
  });

  it('#clearSVGElement should correctly clear the lists of primitives', () => {
    const service: CanvasControllerService = TestBed.inject(CanvasControllerService);
    service.primitivesToDraw = [new Rectangle(Color.WHITE, Color.BLACK, 1, StrokeType.FullWithOutline, new Point(0, 0))];
    service.clearSVGElements();
    expect(service.primitivesToDraw.length).toBe(0);
  });

  it('#setPrimitives should correctly update the lists of primitives', () => {
    const service: CanvasControllerService = TestBed.inject(CanvasControllerService);
    const primitives: SVGPrimitive[] = [new Rectangle(Color.WHITE, Color.BLACK, 1, StrokeType.FullWithOutline, new Point(0, 0))];
    service.setPrimitives(primitives);
    expect(service.primitivesToDraw).toEqual(primitives);
  });

});
