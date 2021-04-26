import { Color } from '../utils/color';
// tslint:disable-next-line
import { DEFAULT_GRID_ALPHA, DEFAULT_GRID_SIZE, MAX_ALPHA, MAX_GRID_SIZE, MIN_GRID_ALPHA, MIN_GRID_SIZE, ToolType } from '../utils/constantsAndEnums';

import { Observable } from 'rxjs';
import { ToolCommand } from '../toolCommands/toolCommand';
import { Tool } from './tool';

export class Grid extends Tool {
  TYPE = ToolType.GridTool;

  private sizeOfSquareGrid: number;
  colorStroke: Color;
  toShow: boolean;

  constructor() {
    super();
    this.sizeOfSquareGrid = DEFAULT_GRID_SIZE;
    this.colorStroke = new Color(0, 0, 0, DEFAULT_GRID_ALPHA);
    this.toShow = false;
  }

  changeTransparency(transparency: number) {
    if (transparency > MAX_ALPHA) {
      transparency = MAX_ALPHA;
    } else if (transparency < MIN_GRID_ALPHA) {
      transparency = MIN_GRID_ALPHA;
    }
    this.colorStroke.a = transparency;
  }

  sizeOfSquare(size?: number): number {
    if (size && size < MIN_GRID_SIZE) {
      size = MIN_GRID_SIZE;
    } else if (size && size > MAX_GRID_SIZE) {
      size = MAX_GRID_SIZE;
    }
    this.sizeOfSquareGrid = size ? size : this.sizeOfSquareGrid;
    return this.sizeOfSquareGrid;
  }

  subscribeToCommand(): Observable<ToolCommand> {
    return new Observable();
  }

}
