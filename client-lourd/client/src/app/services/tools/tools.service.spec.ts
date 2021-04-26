import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CanvasControllerService } from '../canvasController/canvas-controller.service';
import { DrawingService } from '../drawing/drawing.service';
import { ToolType } from '../utils/constantsAndEnums';
import { PencilTool } from './pencilTool';
import { ToolsService } from './tools.service';
import { EraserTool } from './eraserTool';

describe('ToolsService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    providers: [CanvasControllerService, DrawingService],
    imports: [HttpClientModule],
  }));

  it('should be created', () => {
    const service: ToolsService = TestBed.inject(ToolsService);
    expect(service).toBeTruthy();
  });

  it('Selected tool type is correctly detected', () => {
    const service: ToolsService = TestBed.inject(ToolsService);
    const controller: CanvasControllerService = TestBed.inject(CanvasControllerService);
    let toolType: ToolType = ToolType.Eraser;

    toolType = ToolType.Pencil;
    service.newToolSelected(toolType);
    expect(controller.tool).toEqual(jasmine.any(PencilTool));

    toolType = ToolType.Eraser;
    service.newToolSelected(toolType);
    expect(controller.tool).toEqual(jasmine.any(EraserTool))

    toolType = ToolType.None;
    service.newToolSelected(toolType);
    expect(controller.tool).toBeUndefined();
  });
});
