import { Observable, Subject } from 'rxjs';
import { GameService } from '../gameService/game-service.service';
import { SocketService } from '../socket/socket.service';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { DrawingToolCommand } from '../toolCommands/drawingToolCommand';
import { ToolCommand } from '../toolCommands/toolCommand';
import { TutorialService } from '../tutorial/tutorial.service';
import { Color } from '../utils/color';
import { DEFAULT_STROKE_WIDTH, MouseEventType, Texture, ToolType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { Tool } from './tool';

export abstract class DrawingTool extends Tool {
  TYPE = ToolType.None;
  strokeWidth: number = DEFAULT_STROKE_WIDTH;
  texture: Texture = Texture.Basic;
  protected strokeColor: Color;
  protected command: DrawingToolCommand;
  private commandSubject: Subject<DrawingToolCommand> = new Subject<DrawingToolCommand>();
  protected isCreatingPath = false;

  constructor(strokeColor: Color) {
    super();
    this.strokeColor = strokeColor;
  }

  mouseEvent(eventType: MouseEventType, position: Point, primitive?: SVGPrimitive | undefined): void {
    switch (eventType) {
      case MouseEventType.MouseDownLeft:
        this.begin(position);
        break;
      case MouseEventType.MouseMove:
        this.update(position);
        break;
      case MouseEventType.MouseUpLeft:
        this.update(position);
        this.finish();
        break;
      case MouseEventType.MouseLeave:
        this.finish();
        break;
    }
    this.temporaryPrimitivesAvailable.next();
  }

  subscribeToCommand(): Observable<ToolCommand> {
    return this.commandSubject.asObservable();
  }

  getTemporaryPrimitives(): SVGPrimitive[] {
    return this.isCreatingPath ? [this.command.path] : [];
  }

  protected begin(position: Point): void {
    if (this.command) {
      this.command.path.addPoint(position);
      this.isCreatingPath = true;
      if(!TutorialService.instance.hasStarted() && GameService.instance.gameId.length > 0) SocketService.instance.emit('start-draw', JSON.stringify({gameId: GameService.instance.gameId, path:this.command.path}));
    }
  }

  protected update(position: Point): void {
    if (this.isCreatingPath && this.command) {
      this.command.path.addPoint(position);
      if(!TutorialService.instance.hasStarted() && GameService.instance.gameId.length > 0) SocketService.instance.emit('update-draw', JSON.stringify({gameId: GameService.instance.gameId, path:this.command.path}));
    }
  }

  protected finish(): void {
    if (this.isCreatingPath) {
      this.isCreatingPath = false;
      this.commandSubject.next(this.command);
      if(!TutorialService.instance.hasStarted() && GameService.instance.gameId.length > 0) SocketService.instance.emit('finish-draw', JSON.stringify({gameId: GameService.instance.gameId, path:this.command.path}));
    }
  }

  standby(): void {
    this.finish();
  }
}
