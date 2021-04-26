import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { DrawingService } from '../drawing/drawing.service';
import { GameService } from '../gameService/game-service.service';
import { KeyboardService } from '../keyboard/keyboard.service';
import { SocketService } from '../socket/socket.service';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { BackgroundColorCommand } from '../toolCommands/backgroundColorCommand';
import { ToolCommand } from '../toolCommands/toolCommand';
import { Tool } from '../tools/tool';
import { ToolsService } from '../tools/tools.service';
import { TutorialService } from '../tutorial/tutorial.service';
import { Color } from '../utils/color';
import { KeyboardEventType, KeyboardShortcutType, MouseEventType, ToolType } from '../utils/constantsAndEnums';
import { NewDrawingInfo } from '../utils/newDrawingInfo';
import { Point } from '../utils/point';

@Injectable({
  providedIn: 'root',
})

export class CanvasControllerService implements OnDestroy {
  private selectedToolSubscription: Subscription;
  private toolCommandSubscription: Subscription;
  private temporaryPrimitivesSubscription: Subscription;
  private newDrawingSubcription: Subscription;
  private newBackgroundColorSubscription: Subscription;
  tool: Tool;
  svgPrimitives: SVGPrimitive[] = [];
  temporaryPrimitives: SVGPrimitive[] = [];
  private executedCommands: ToolCommand[] = [];
  private cancelledCommands: ToolCommand[] = [];
  private keyboardShortcutSubscription: Subscription;
  primitivesToDraw: SVGPrimitive[] = [];
  changeDetectSubject = new Subject<void>();

  canvasInfo: NewDrawingInfo;

  private primitivesHTMLSubject = new Subject<boolean>();
  private primitivesHTMLSubjectString = new Subject<string>();

  constructor(
    private toolsService: ToolsService,
    private drawingService: DrawingService,
    private keyboardService: KeyboardService,
    private _tutorial: TutorialService,
    private _socket: SocketService
  ) {
    this.canvasInfo = new NewDrawingInfo(0, 0, new Color(0, 0, 0, 0));
    this.selectedToolSubscription = this.toolsService.subscribeToToolChanged().subscribe((toolSelected: Tool) => {
      if (this.tool) {
        this.tool.standby();
      }
      this.tool = toolSelected;
      if (this.tool) {
        this.tool.setActive(this.svgPrimitives);
      }

      this.temporaryPrimitives.length = 0;
      this.changeDetectSubject.next();

      if (this.toolCommandSubscription) {
        this.toolCommandSubscription.unsubscribe();
      }
      if (this.tool) {
        this.toolCommandSubscription = this.tool.subscribeToCommand().subscribe((command: ToolCommand) => {
          this.applyNewCommand(command);
        });
        this.temporaryPrimitivesSubscription = this.tool.subscribeToTemporaryPrimitivesAvailable().subscribe(() => {
          this.updatePrimitivesToDraw();
        });
      }
      this.updatePrimitivesToDraw();
    });

    this.keyboardShortcutSubscription = this.keyboardService.getKeyboardShortcutType().subscribe(
      (keyboardShortcutType: KeyboardShortcutType) => {
        if (keyboardShortcutType === KeyboardShortcutType.Undo) {
          this.undo();
        } else if (keyboardShortcutType === KeyboardShortcutType.Redo) {
          this.redo();
        }
      },
    );

    this.newDrawingSubcription = this.drawingService.drawingObservable.subscribe((newDrawing: NewDrawingInfo) => {
      this.canvasInfo = newDrawing;
    });

    this.newBackgroundColorSubscription = this.drawingService.backgroundColorObservable.subscribe((newColor: Color) => {
      this.canvasInfo.color = Color.copyColor(newColor);
      if (!TutorialService.instance.hasStarted() && GameService.instance.gameId.length > 0) this._socket.emit('update-background', JSON.stringify({ gameId: GameService.instance.gameId, color: this.canvasInfo.color }));
    });
  }

  ngOnDestroy(): void {
    this.selectedToolSubscription.unsubscribe();
    this.newDrawingSubcription.unsubscribe();
    this.newBackgroundColorSubscription.unsubscribe();
    if (this.toolCommandSubscription) {
      this.toolCommandSubscription.unsubscribe();
    }
    if (this.temporaryPrimitivesSubscription) {
      this.temporaryPrimitivesSubscription.unsubscribe();
    }
    this.keyboardShortcutSubscription.unsubscribe();
  }

  mouseEventOnCanvas(eventType: MouseEventType, position: Point, primitive?: SVGPrimitive): void {
    if (this.tool) {
      if (this._tutorial.curState === 1 || this._tutorial.curState === 3) {
        if (this.tool.TYPE === ToolType.Pencil && eventType === MouseEventType.MouseUpLeft) {
          if (this._tutorial.curState === 3) {
            let wow = new Audio();
            wow.src = 'assets/sounds/crowd_wow.mp3';
            wow.volume = 0.15;
            wow.load();
            wow.play();
          }
          this._tutorial.nextStep();
        }
      }
      this.tool.mouseEvent(eventType, position, primitive);
    }
  }

  keyboardEventOnCanvas(eventType: KeyboardEventType): void {
    if (this.tool) {
      this.tool.keyboardEvent(eventType);
    }
  }

  mouseWheelEventOnCanvas(delta: number): void {
    if (this.tool) {
      this.tool.mouseWheelEvent(delta);
    }
  }

  private applyNewCommand(command: ToolCommand): void {
    if (command) {
      command.apply(this.svgPrimitives);
      this.executedCommands.push(command);
      this.temporaryPrimitives.length = 0;
      this.changeDetectSubject.next();
      this.cancelledCommands.length = 0;
      this.updatePrimitivesToDraw();
      if (this.tool) {
        if (this.tool.TYPE === ToolType.Eraser) {
          if (!this._tutorial.hasStarted() && GameService.instance.gameId.length > 0) this._socket.emit('redraw-canvas', JSON.stringify({ gameId: GameService.instance.gameId, primitives: this.svgPrimitives }));
        }
      }
    }
  }

  undo(): void {
    const lastExecutedCommand: ToolCommand | undefined = this.executedCommands.pop();
    if (lastExecutedCommand) {
      this.cancelledCommands.push(lastExecutedCommand);
      lastExecutedCommand.cancel(this.svgPrimitives);
      this.updatePrimitivesToDraw();
      if (!this._tutorial.hasStarted() && GameService.instance.gameId.length > 0) this._socket.emit('redraw-canvas', JSON.stringify({ gameId: GameService.instance.gameId, primitives: this.svgPrimitives }));
    }
  }

  redo(): void {
    const lastCancelledCommand: ToolCommand | undefined = this.cancelledCommands.pop();
    if (lastCancelledCommand) {
      this.executedCommands.push(lastCancelledCommand);
      lastCancelledCommand.apply(this.svgPrimitives);
      this.updatePrimitivesToDraw();
      if (!this._tutorial.hasStarted() && GameService.instance.gameId.length > 0) this._socket.emit('redraw-canvas', JSON.stringify({ gameId: GameService.instance.gameId, primitives: this.svgPrimitives }));
    }
  }

  canUndo(): boolean {
    return this.executedCommands.length > 0;
  }

  canRedo(): boolean {
    return this.cancelledCommands.length > 0;
  }

  clearSVGElements(): void {
    this.svgPrimitives.length = 0;
    this.temporaryPrimitives.length = 0;
    this.primitivesToDraw.length = 0;
    this.executedCommands.length = 0;
    this.cancelledCommands.length = 0;
  }

  clearToolDate(): void {
    this.toolsService.newToolSelected(ToolType.None);
  }

  private updatePrimitivesToDraw(): void {
    if (this.tool) {
      this.temporaryPrimitives = this.tool.getTemporaryPrimitives();
      this.changeDetectSubject.next();
    }
    this.primitivesToDraw = this.svgPrimitives.concat(this.temporaryPrimitives);
  }

  setPrimitives(primitives: SVGPrimitive[]): void {
    this.svgPrimitives = primitives;
    if (this.tool) {
      this.tool.standby();
      this.tool.setActive(this.svgPrimitives);
    }
    this.updatePrimitivesToDraw();
  }

  setCanvasInfo(canvasInfo: NewDrawingInfo): void {
    this.canvasInfo = canvasInfo;
    this.drawingService.sendDrawingData(canvasInfo);
  }

  isEmptyPrimitives(): boolean {
    return this.svgPrimitives.length === 0;
  }

  getPrimitivesHTMLObservable(): Observable<boolean> {
    return this.primitivesHTMLSubject.asObservable();
  }

  getHTMLOfPrimitives(): void {
    this.primitivesHTMLSubject.next(true);
  }

  getChangeDetection(): Observable<void>{
    return this.changeDetectSubject.asObservable();
  }

  getHTMLPrimitivesStringObservable(): Observable<string> {
    return this.primitivesHTMLSubjectString.asObservable();
  }

  sendHTMLStringOfPrimitives(htmlPrimitives: string) {
    this.primitivesHTMLSubjectString.next(htmlPrimitives);
  }

  changeBackgroundColor(color: Color) {
    this.applyNewCommand(new BackgroundColorCommand(this.drawingService, color, this.canvasInfo.color));
  }
}
