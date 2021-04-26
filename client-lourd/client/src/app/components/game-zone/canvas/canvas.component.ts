import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoundingBoxService } from 'src/app/services/boundingBoxService/bounding-box.service';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { Path } from 'src/app/services/svgPrimitives/path/path';
import { SVGPrimitive } from 'src/app/services/svgPrimitives/svgPrimitive';
import { Grid } from 'src/app/services/tools/grid';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { Color } from 'src/app/services/utils/color';
// tslint:disable-next-line
import { CANVAS_RATIO_HEIGHT, CANVAS_RATIO_WIDTH, CANVAS_VIEWBOX, KeyboardEventType, LEFT_MOUSE_BUTTON, MouseEventType, PrimitiveType, RIGHT_MOUSE_BUTTON, ToolType } from 'src/app/services/utils/constantsAndEnums';
import { NewDrawingInfo } from 'src/app/services/utils/newDrawingInfo';
import { Point } from 'src/app/services/utils/point';
import { SvgComponent } from './svg/svg.component';
import { pointsOnPath } from 'points-on-path'
//@ts-ignore
import * as pt from 'potrace'
import { GameService } from 'src/app/services/gameService/game-service.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('svgPrimitives') htmlOfPrimitives: ElementRef;
  @ViewChild('svgPrimitivesFixe') fixedPrimitives: SvgComponent;
  @ViewChild('svgPrimitivesTemporaires') temporaryPrimitives: SvgComponent;

  newDrawingInfo: NewDrawingInfo;

  initWidth = 0;
  initHeight = 0;
  canvasWidth = 0;
  canvasHeight = 0;
  canvasBackground = 'rgba(255,255,255,1)';

  gridInfo: Grid;
  screenShoting = false;
  private gridSubscription: Subscription;
  private controllerHTMLPrimitiveSubscription: Subscription;
  private keyboardEventSubscription: Subscription;
  private subscriptions: Subscription[] = [];
  numberOfSquareWidth = 0;
  numberOfSquareHeight = 0;

  ratioWidth = CANVAS_RATIO_WIDTH;
  ratioHeight = CANVAS_RATIO_HEIGHT;
  viewBox = '0 0 0 0';

  temporarySocketPrimitives: SVGPrimitive[] = []

  constructor(private drawingService: DrawingService,
    public controller: CanvasControllerService,
    private toolService: ToolsService,
    private keyboardService: KeyboardService,
    private boundingBoxService: BoundingBoxService,
    private _socket: SocketService,
    private _tutorial: TutorialService,
    private _game: GameService,
    private _cd: ChangeDetectorRef
  ) {
    this.gridInfo = new Grid();

    this.keyboardEventSubscription = this.keyboardService.getKeyboardEventType().subscribe((keyboardEventType: KeyboardEventType) => {
      this.controller.keyboardEventOnCanvas(keyboardEventType);
      this.updatePrimitives();
    });

    this.gridSubscription = this.toolService.subscribeToGrid().subscribe((grid) => {
      this.gridInfo = grid;
      this.calculateGrid();
    });

    this.controllerHTMLPrimitiveSubscription = this.controller.getPrimitivesHTMLObservable().subscribe((send) => {
      this.screenShoting = true;
      if (send) {
        this.viewBox = CANVAS_VIEWBOX;
        setTimeout(() => { // juste pour permettre de cacher la grille avant le screenshot
          const serializer = new XMLSerializer();
          const data = serializer.serializeToString(this.htmlOfPrimitives.nativeElement);
          controller.sendHTMLStringOfPrimitives(
            `data:image/svg+xml;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(data)))}`,
          );
          this.screenShoting = false;
        }, 1);
      }
    });

    this.subscriptions.push(this.controller.getChangeDetection().subscribe(() => {
      this._cd.detectChanges();
    }));

    this.subscriptions.push(this.drawingService.drawingObservable.subscribe((data) => {
      this.newDrawingInfo = data;
      this.clearCanvas();
      this.defineDimensions(this.newDrawingInfo.width, this.newDrawingInfo.height);
      this.defineBackgroundColor(this.newDrawingInfo.color);
    }));

    this.subscriptions.push(this.drawingService.backgroundColorObservable.subscribe((data) => {
      this.defineBackgroundColor(data);
    }));

    this.subscriptions.push(this.drawingService.initWorkspaceObservable.subscribe((data) => {
      this.defineDimensions(data[0], data[1]);
      this.initWidth = data[0];
      this.initHeight = data[1];
    }));

    this.subscriptions.push(this.drawingService.workspaceObservable.subscribe((data) => {
      this.defineDimensions(data[0], data[1]);
    }));

    /* Socket listeners */

    this.subscriptions.push(this._socket.drawingStartObservable.subscribe((data) => {
      let parsed = JSON.parse(data).path;
      let path = new Path(parsed.strokeColor, parsed.strokeWidth, PrimitiveType.Pencil);
      path.commandSvg = parsed.commandSvg;
      path.points = parsed.points;
      this.temporarySocketPrimitives.push(path);
    }));

    this.subscriptions.push(this._socket.drawingUpdateObservable.subscribe((data) => {
      let parsed = JSON.parse(data).path;
      let path = new Path(parsed.strokeColor, parsed.strokeWidth, PrimitiveType.Pencil);
      path.commandSvg = parsed.commandSvg;
      path.points = parsed.points;
      this.temporarySocketPrimitives.pop();
      this.temporarySocketPrimitives.push(path);
    }));

    this.subscriptions.push(this._socket.drawingEndObservable.subscribe((data) => {
      let parsed = JSON.parse(data).path;
      let path = new Path(parsed.strokeColor, parsed.strokeWidth, PrimitiveType.Pencil);
      path.commandSvg = parsed.commandSvg;
      path.points = parsed.points;
      this.temporarySocketPrimitives.pop();
      this.temporarySocketPrimitives.push(path);
      this.controller.svgPrimitives.push(Path.createCopy(this.temporarySocketPrimitives[0]));
      this.temporarySocketPrimitives.length = 0;
    }));

    this.subscriptions.push(this._socket.redrawCanvasObservable.subscribe((data) => {
      let tempPaths: Path[] = [];
      let paths = JSON.parse(data).primitives;
      for (let path of paths) {
        let newPath = new Path(path.strokeColor, path.strokeWidth, PrimitiveType.Pencil);
        newPath.commandSvg = path.commandSvg;
        newPath.points = path.points;
        tempPaths.push(newPath)
      }
      controller.svgPrimitives.length = 0;
      controller.svgPrimitives = [...tempPaths];
    }));

    this.subscriptions.push(this._socket.updateBackgroundObservable.subscribe((data) => {
      let color = JSON.parse(data).color;
      this.defineBackgroundColor(new Color(color.r, color.g, color.b, color.a));
    }));

    /*tutorial listeners*/
    this.subscriptions.push(this._tutorial.loadExampleImageObservable.subscribe(() => {
      this.controller.svgPrimitives = [...this._tutorial.exampleImage];
    }));

    /* game service listeners */
    this.subscriptions.push(this._game.clearGameCanvasObservable.subscribe(() => {
      this.controller.changeBackgroundColor(Color.WHITE);
      this.clearCanvas();
    }));

    /* word-image pair listeners*/
    this.subscriptions.push(this.drawingService.fileUploadObservable.subscribe((data: any) => {
      this.testPotrace(data.file, data.params);
    }));
  }

  @HostListener('wheel', ['$event']) onScroll(event: WheelEvent) {
    if (!this.isTracing) {
      this.controller.mouseWheelEventOnCanvas(Math.sign(event.deltaY));
      this.updatePrimitives();
    }
  }

  @HostListener('dblclick', ['$event']) ondblclick(event: MouseEvent): void {
    if (event.button === 0 && !this.isTracing) {
      this.sendMouseEventToController(MouseEventType.MouseDblClick, event.clientX, event.clientY);
    }
  }

  @HostListener('mouseleave', ['$event']) mouseLeaveCanvas(event: MouseEvent): void {
    if (event.button === 0 && !this.isTracing) {
      this.sendMouseEventToController(MouseEventType.MouseLeave, event.clientX, event.clientY);
    }
  }

  @HostListener('mousedown', ['$event']) mouseDownOnCanvas(event: PointerEvent, primitive?: SVGPrimitive): void {
    event.stopPropagation();
    if (!this.isTracing) {
      let mouseEventType = MouseEventType.InvalidEvent;
      if (event.button === LEFT_MOUSE_BUTTON) {
        mouseEventType = MouseEventType.MouseDownLeft;
      } else if (event.button === RIGHT_MOUSE_BUTTON) {
        mouseEventType = MouseEventType.MouseDownRight;
      }
      //let rect = this.canvas.nativeElement.getBoundingClientRect();
      this.sendMouseEventToController(mouseEventType, event.clientX, event.clientY, primitive);
    }
  }

  ngAfterViewInit(): void {
    this.updatePrimitives();
    this.defineBackgroundColor(Color.copyColor(Color.WHITE));
  }

  ngOnDestroy(): void {
    this.controllerHTMLPrimitiveSubscription.unsubscribe();
    this.gridSubscription.unsubscribe();
    this.keyboardEventSubscription.unsubscribe();
    for (let subs of this.subscriptions) {
      subs.unsubscribe();
    }
  }

  defineDimensions(width: number, height: number): void {
    if (width < 0 || height < 0) {
      throw new Error('Canvas width and height must be positive.');
    }
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.controller.canvasInfo.width = this.canvasWidth;
    this.controller.canvasInfo.height = this.canvasHeight;

    if (!this.canvasWidth || !(this.canvasHeight)) {
      this.viewBox = '0 0 0 0 ';
    } else {
      this.viewBox = CANVAS_VIEWBOX;
    }

    this.calculateGrid();
  }

  defineBackgroundColor(color: Color): void {
    if (color.rgbaTextForm === Color.TRANSPARENT_RGBA_TEXT_FORM) {
      color.changeColor(color, 0.01);
    }
    this.canvasBackground = color.rgbaTextForm;
    this.controller.canvasInfo.color = color;
  }

  mouseMoveOnCanvas(event: PointerEvent, primitive?: SVGPrimitive): void {
    if (!this.isTracing) {
      this.sendMouseEventToController(MouseEventType.MouseMove, event.clientX, event.clientY, primitive);
      this.updatePrimitives();
    }
  }

  mouseUpOnCanvas(event: PointerEvent, primitive?: SVGPrimitive): void {
    event.stopPropagation();
    if (!this.isTracing) {
      let mouseEventType = MouseEventType.InvalidEvent;
      if (event.button === LEFT_MOUSE_BUTTON) {
        mouseEventType = MouseEventType.MouseUpLeft;
      } else if (event.button === RIGHT_MOUSE_BUTTON) {
        mouseEventType = MouseEventType.MouseUpRight;
      }
      this.sendMouseEventToController(mouseEventType, event.clientX, event.clientY, primitive);
    }
  }

  clickOnCanvas(event: MouseEvent, primitive?: SVGPrimitive): void {
    event.stopPropagation();
    if (!this.isTracing) {
      let mouseEventType = MouseEventType.InvalidEvent;
      if (event.button === LEFT_MOUSE_BUTTON) {
        mouseEventType = MouseEventType.MouseClickLeft;
      } else if (event.button === RIGHT_MOUSE_BUTTON) {
        event.preventDefault();
        mouseEventType = MouseEventType.MouseClickRight;
      }
      //let rect = this.canvas.nativeElement.boundingClientRect();
      this.sendMouseEventToController(mouseEventType, event.clientX, event.clientY, primitive);
    }
  }

  clearCanvas(): void {
    this.controller.clearSVGElements();
  }

  private calculateGrid(): void {
    this.numberOfSquareWidth = Math.floor(this.ratioWidth / this.gridInfo.sizeOfSquare());
    this.numberOfSquareHeight = Math.floor(this.ratioHeight / this.gridInfo.sizeOfSquare());
  }

  private sendMouseEventToController(eventType: MouseEventType, clientX: number, clientY: number, primitive?: SVGPrimitive): void {
    const element: HTMLElement = (this.canvas.nativeElement as HTMLElement);
    if (element && !this.isTracing) {
      let point = this.htmlOfPrimitives.nativeElement.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      let cursorPoint = point.matrixTransform(this.htmlOfPrimitives.nativeElement.getScreenCTM().inverse());
      const position: Point = new Point(cursorPoint.x, cursorPoint.y);
      this.controller.mouseEventOnCanvas(eventType, position, primitive);
      this.updatePrimitives();
    }
  }

  private updatePrimitives(): void {
    this.drawingService.sendPrimitives(this.controller.primitivesToDraw);
    if (this.controller.tool) {
      if (this.controller.tool.TYPE === ToolType.Eraser) {
        // Si l'outil selectionne est le selecteur ou l'efface, on met a jour les coins des primitives pour lesquelles
        // ce n'est pas deja fait
        this.boundingBoxService.updatePrimitives(this.canvas, this.fixedPrimitives.htmlOfPrimitives, this.controller.svgPrimitives);
      }
    }
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isTracing = false;
  async testPotrace(inputFile: File, params: any) {
    if (inputFile) {
      let file = inputFile as File;
      let img = document.createElement('img');
      let canvas = document.createElement('canvas');
      img.src = window.URL.createObjectURL(file);
      img.onload = async () => {
        var wrh = img.width / img.height;
        var newWidth = canvas.width;
        var newHeight = newWidth / wrh;
        if (newHeight > canvas.height) {
          newHeight = canvas.height;
          newWidth = newHeight * wrh;
        }
        canvas.width = 800;
        canvas.height = 600;
        let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0, 800, 600);
        pt.trace(canvas.toDataURL('image/png'), params, async (err: any, svg: string) => {
          let d = svg.substring(svg.lastIndexOf("d=\"") + 3, svg.lastIndexOf("\" stroke"));
          let shapes = pointsOnPath(d, 0.5, 1);
          this.isTracing = true;
          for (let shape of shapes) {
            let path = new Path(Color.copyColor(Color.BLACK), 1, PrimitiveType.Pencil)
            this.controller.svgPrimitives.push(path);
            for (let points of shape) {
              (this.controller.svgPrimitives[this.controller.svgPrimitives.length - 1] as Path).addPoint(new Point(points[0], points[1]));
            }
          }
          this.isTracing = false;
        });
      }
    }
  }
}
