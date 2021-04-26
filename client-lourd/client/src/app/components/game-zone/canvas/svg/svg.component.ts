import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SVGPrimitive } from 'src/app/services/svgPrimitives/svgPrimitive';
import { PrimitiveType, Texture } from 'src/app/services/utils/constantsAndEnums';

@Component({
  selector: 'g[app-svg]',
  templateUrl: './svg.component.html',
  styleUrls: ['./svg.component.scss'],
})
export class SvgComponent {

  @Input() primitives: SVGPrimitive[];

  @Output() mouseDown: EventEmitter<any> = new EventEmitter();
  @Output() mouseMove: EventEmitter<any> = new EventEmitter();
  @Output() mouseUp: EventEmitter<any> = new EventEmitter();
  @Output() click: EventEmitter<any> = new EventEmitter();

  @ViewChild('svg') htmlOfPrimitives: ElementRef;

  PrimitiveType = PrimitiveType;
  Texture = Texture;

  mouseDownOnCanvas(event: PointerEvent, primitive?: SVGPrimitive): void {
    this.mouseDown.emit([event, primitive]);
  }

  mouseMoveOnCanvas(event: PointerEvent, primitive?: SVGPrimitive): void {
    this.mouseMove.emit([event, primitive]);
  }

  mouseUpOnCanvas(event: PointerEvent, primitive?: SVGPrimitive): void {
    this.mouseUp.emit([event, primitive]);
  }

  clickOnCanvas(event: MouseEvent, primitive?: SVGPrimitive): void {
    this.click.emit([event, primitive]);
  }
}
