import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GameService } from '../gameService/game-service.service';
import { KeyboardService } from '../keyboard/keyboard.service';
import { PencilTool } from '../tools/pencilTool';
import { Tool } from '../tools/tool';
import { TutorialService } from '../tutorial/tutorial.service';
import { Color } from '../utils/color';
import { KeyboardShortcutType, LEFT_MOUSE_BUTTON,
  PENCIL_DEFAULT_STROKE_WIDTH,
  RIGHT_MOUSE_BUTTON, ToolType } from '../utils/constantsAndEnums';
import { EraserTool } from './eraserTool';
import { Grid } from './grid';

@Injectable({
  providedIn: 'root',
})

export class ToolsService {
  private selectedTool: Subject<Tool>;
  primaryColor: Color = new Color(0, 0, 0);
  secondaryColor: Color = new Color(255, 255, 255);

  eyeDropperPrimaryObservable: Observable<Color>;
  private eyeDropperPrimarySubject = new Subject<Color>();

  eyeDropperSecondaryObservable: Observable<Color>;
  private eyeDropperSecondarySubject = new Subject<Color>();

  selectorObservable: Observable<boolean>;
  selectorSubject: Subject<boolean> = new Subject<boolean>();
  selectorInUse = false;

  private gridSubject: Subject<Grid>;
  gridInfo: Grid;
  readonly TOOLS: Map<ToolType, Tool>;

  pencilWidth = PENCIL_DEFAULT_STROKE_WIDTH;

  constructor(private keyboardService: KeyboardService, private _tutorial: TutorialService, private _game: GameService) {
    this.gridInfo = new Grid();
    this.gridSubject = new Subject<Grid>();

    this.TOOLS = new Map<ToolType, Tool>([
      [ToolType.Pencil, new PencilTool(this.primaryColor)],
      [ToolType.GridTool, new Grid()],
      [ToolType.Eraser, new EraserTool()],
    ]);
    this.selectedTool = new Subject<Tool>();
    this.eyeDropperPrimaryObservable = this.eyeDropperPrimarySubject.asObservable();
    this.eyeDropperSecondaryObservable = this.eyeDropperSecondarySubject.asObservable();
    this.selectorObservable = this.selectorSubject.asObservable();

    this._game.clearToolObservable.subscribe(() => {
      this.newToolSelected(ToolType.None);
    })

    this._game.selectPencilObservable.subscribe(() => {
      this.newToolSelected(ToolType.Pencil);
    })

    this.keyboardService.getKeyboardShortcutType().subscribe((key: KeyboardShortcutType) => {
      if (key === KeyboardShortcutType.Grid) {
        this.showGrid(!this.gridInfo.toShow);
      } else if (key === KeyboardShortcutType.ZoomInGrid) {
        this.gridInfo.sizeOfSquare(this.gridInfo.sizeOfSquare() + (5 - this.gridInfo.sizeOfSquare() % 5));
        this.gridSubject.next(this.gridInfo);
      } else if (key === KeyboardShortcutType.ZoomOutGrid) {
        this.gridInfo.sizeOfSquare(this.gridInfo.sizeOfSquare() - (5 - this.gridInfo.sizeOfSquare() % 5));
        this.gridSubject.next(this.gridInfo);
      }
    });
  }

  newToolSelected(toolType: ToolType): void {
    if (this.TOOLS.has(toolType)) {
      this.selectedTool.next(this.TOOLS.get(toolType));
    } else if (toolType === ToolType.GridTool || toolType === ToolType.None) {
      this.selectedTool.next();
    }
    this.keyboardService.textToolActive = false;
  }

  subscribeToToolChanged(): Observable<Tool> {
    return this.selectedTool.asObservable();
  }

  sendBackgroundColorToDropper(event: PointerEvent, background: string): void {
    const colorValues: string[] = background.split('rgba(')[1].split(',');
    const backgroundColor: Color = new Color(Number(colorValues[0]),
      Number(colorValues[1]),
      Number(colorValues[2]),
      Number(colorValues[3].split(')')[0]));
    if (event.button === LEFT_MOUSE_BUTTON) {
      this.sendPrimaryToColorTool(backgroundColor);
    } else if (event.button === RIGHT_MOUSE_BUTTON) {
      this.sendSecondaryToColorTool(backgroundColor);
    }
  }

  sendPrimaryToColorTool(color: Color): void {
    this.eyeDropperPrimarySubject.next(color);
  }

  sendSecondaryToColorTool(color: Color): void {
    this.eyeDropperSecondarySubject.next(color);
  }

  changeGridProperties(sizeOfSquare: number, transparency: number): void {
    this.gridInfo.sizeOfSquare(sizeOfSquare);
    this.gridInfo.changeTransparency(transparency);
    this.gridSubject.next(this.gridInfo);
  }

  showGrid(show: boolean): void {
    if(this._tutorial.curState === 7){
      this._tutorial.nextStep();
      this._tutorial.loadExampleImage();
    }
    this.gridInfo.toShow = show;
    this.gridSubject.next(this.gridInfo);
  }

  subscribeToGrid(): Observable<Grid> {
    return this.gridSubject.asObservable();
  }
}
