import { Observable, Subject } from 'rxjs';
import { CollisionDetectionService } from '../collisionService/collision-detection.service';
import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { EraserCommand } from '../toolCommands/eraserCommand';
import { ToolCommand } from '../toolCommands/toolCommand';
import { Color } from '../utils/color';
// tslint:disable-next-line
import { ERASER_FILL_COLOR, ERASER_STROKE_COLOR, HIGHLIGH_BACKUP_COLOR, HIGHLIGH_COLOR, MAX_ERASER_SIZE, MIN_ERASER_SIZE, MouseEventType, NO_CURSOR, PrimitiveType, StrokeType, ToolType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { Tool } from './tool';

export class EraserTool extends Tool {
  TYPE = ToolType.Eraser;
  eraserIcone: Rectangle;
  private command: EraserCommand;
  private commandSubject: Subject<EraserCommand> = new Subject<EraserCommand>();
  private eraserSize: number;
  private isPressed: boolean;
  private primitives: SVGPrimitive[] = [];
  private currentSVG: SVGPrimitive | null = null;
  private collisionDetectionService: CollisionDetectionService;
  private lastStokeColor: Color | null;
  private drawEraser = true;

  // Pour certaines primitive, le highlight se fera depuis un rectangle de périmètre
  perimeter: Rectangle;

  constructor() {
    super();
    this.collisionDetectionService = new CollisionDetectionService();
    this.eraserSize = MIN_ERASER_SIZE;
    this.eraserIcone = new Rectangle(ERASER_FILL_COLOR, ERASER_STROKE_COLOR, 2, StrokeType.FullWithOutline,
      new Point(0 + this.eraserSize / 2.0, 0 + this.eraserSize / 2.0), this.eraserSize, this.eraserSize);
    this.eraserIcone.SELECTABLE = false;
    this.isPressed = false;
    this.perimeter = new Rectangle(Color.WHITE, HIGHLIGH_COLOR, 2, StrokeType.Outline, new Point(0, 0));
    this.perimeter.strokeColor = Color.copyColor(HIGHLIGH_COLOR);
  }

  updatePrimitivesList(primitives: SVGPrimitive[]) {
    this.primitives = primitives;
  }

  standby(): void {
    this.finishErasing();
    this.leaveEraser();
    return;
  }

  // get and set
  sizeOfSquare(size?: number): number {
    if (size) {
      if (size < MIN_ERASER_SIZE) {
        size = MIN_ERASER_SIZE;
      } else if (size > MAX_ERASER_SIZE) {
        size = MAX_ERASER_SIZE;
      }
      this.eraserSize = size;
      this.eraserIcone.setNewDimension(this.eraserSize, this.eraserSize);
    }
    return this.eraserSize;
  }

  mouseEvent(eventType: MouseEventType, position: Point, primitive?: SVGPrimitive | undefined): void {
    switch (eventType) {
      case MouseEventType.MouseDownLeft:
        this.beginErasing();
        this.checkCollision();
        break;
      case MouseEventType.MouseMove:
        this.checkCollision();
        this.moving(position);
        break;
      case MouseEventType.MouseUpLeft:
        this.finishErasing();
        break;
      case MouseEventType.MouseLeave:
        this.finishErasing();
        this.leaveEraser();
        break;
    }
    this.temporaryPrimitivesAvailable.next();
  }

  getTemporaryPrimitives(): SVGPrimitive[] {
    if (!this.drawEraser) {
      return [];
    }
    if (this.currentSVG && (this.currentSVG.type === PrimitiveType.Text || this.currentSVG.type === PrimitiveType.Stamp)) {
      return [this.perimeter, this.eraserIcone];
    }

    return [this.eraserIcone];
  }

  private beginErasing(): void {
    this.isPressed = true;
    this.command = new EraserCommand();
  }

  private moving(position: Point): void {
    if (!this.drawEraser) {
      this.drawEraser = true;
    }
    if (this.isPressed && this.currentSVG) {
      this.erasePrimitive();
    }
    this.updateEraserPosition(position);
  }

  private finishErasing(): void {
    if (this.isPressed) {
      this.isPressed = false;
      if (this.command.primitivesToErase.size !== 0) {
        this.commandSubject.next(this.command);
      }
    }
  }

  private leaveEraser(): void {
    this.drawEraser = false;
    this.isPressed = false;
    this.removePrimitiveSelection();
    this.currentSVG = null;
    this.lastStokeColor = null;
  }

  private highlightPrimitive(primitive: SVGPrimitive): void {
    if (this.currentSVG !== primitive) {
      if (this.currentSVG != null) {
        this.removePrimitiveSelection();
      }
      this.currentSVG = primitive;
      this.lastStokeColor = Color.copyColor(primitive.strokeColor);
      if (this.currentSVG.strokeColor.isEquivalent(HIGHLIGH_COLOR)) {
        this.currentSVG.strokeColor = Color.copyColor(HIGHLIGH_BACKUP_COLOR);
      } else {
        this.currentSVG.strokeColor = Color.copyColor(HIGHLIGH_COLOR);
      }
      // si c'est un text ajouter un périmètre
      if (this.currentSVG.type === PrimitiveType.Text || this.currentSVG.type === PrimitiveType.Stamp) {
        this.setPerimiter();
      }
    }
  }

  private setPerimiter(): void {
    if (this.currentSVG) {
      this.perimeter.position = this.currentSVG.getTopLeftCorner();
      this.perimeter.resize(
        this.currentSVG.getTopLeftCorner(),
        this.currentSVG.getBottomRightCorner(),
        false,
      );
    }
  }

  private removePrimitiveSelection(): void {
    if (this.currentSVG) {
      if (this.lastStokeColor) {
        this.currentSVG.strokeColor = Color.copyColor(this.lastStokeColor);
      }
      this.lastStokeColor = null;
      this.currentSVG = null;
    }
  }

  private updateEraserPosition(position: Point): void {
    this.eraserIcone.setCenter(position);
  }

  subscribeToCommand(): Observable<ToolCommand> {
    return this.commandSubject.asObservable();
  }

  private checkCollision(): void {
    if (this.primitives.length > 0) {
      let primitiveCollide: SVGPrimitive | null = null;
      // Pour shallow copy pour ne pas briser le tableau original
      this.primitives.slice().forEach((primitive: SVGPrimitive) => {
        if (primitive.toShow) { // Pour prévenir de resélectionner un primitive non présente
          if (this.collisionDetectionService.checkCollision(this.eraserIcone, primitive)) {
            primitiveCollide = primitive;
          }
          return;
        }
      });
      if (primitiveCollide) {
        this.highlightPrimitive(primitiveCollide);
        if (this.isPressed && this.currentSVG) {
          this.erasePrimitive();
        }
      } else {
        this.removePrimitiveSelection();
      }
    }
  }

  private erasePrimitive(): void {
    if (this.currentSVG) {
      const index = this.primitives.indexOf(this.currentSVG);
      if (this.lastStokeColor) {
        this.currentSVG.strokeColor = Color.copyColor(this.lastStokeColor);
      }
      this.command.removePrimitive(index, this.currentSVG);
      this.currentSVG = null;
      this.lastStokeColor = null;
    }
  }

  getCursor(): string {
    return NO_CURSOR;
  }

  setActive(primitives: SVGPrimitive[]): void {
    this.updatePrimitivesList(primitives);
  }
}
