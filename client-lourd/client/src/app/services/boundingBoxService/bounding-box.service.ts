import { ElementRef, Injectable } from '@angular/core';
import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { Point } from '../utils/point';

@Injectable({
  providedIn: 'root',
})

export class BoundingBoxService {
  resizeBoundingBox(boundingBox: Rectangle, primitives: SVGPrimitive[]) {
    const boundingBoxTopLeft: Point = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    const boundingBoxBottomRight: Point = new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
    if (primitives.length > 0) {
      primitives.forEach((primitive) => {
        const topLeft: Point = primitive.getTopLeftCorner();
        const bottomRight: Point = primitive.getBottomRightCorner();
        boundingBoxTopLeft.x = Math.min(boundingBoxTopLeft.x, topLeft.x);
        boundingBoxTopLeft.y = Math.min(boundingBoxTopLeft.y, topLeft.y);
        boundingBoxBottomRight.x = Math.max(boundingBoxBottomRight.x, bottomRight.x);
        boundingBoxBottomRight.y = Math.max(boundingBoxBottomRight.y, bottomRight.y);
      });
      boundingBox.resize(boundingBoxTopLeft, boundingBoxBottomRight, false, true);
    } else {
      boundingBox.resize(new Point(0, 0), new Point(0, 0), false, true);
    }
  }

  updatePrimitives(canvas: ElementRef, htmlOfPrimitives: ElementRef, primitives: SVGPrimitive[]) {
    const canvasElement: HTMLElement = (htmlOfPrimitives.nativeElement as HTMLElement);
    if (canvasElement) {
      const svgElements: HTMLCollection = (canvasElement as HTMLElement).children; // les elements HTML des primitives SVG;
      for (let i = 0; i < svgElements.length && i < primitives.length; i++) {
        const svgElement: SVGGraphicsElement = svgElements.item(i) as SVGGraphicsElement;
        if (svgElement) {
          this.setBoundingBoxOfPrimitive(canvas, svgElement, primitives[i]);
        }
      }
    }
  }

  private setBoundingBoxOfPrimitive(canvas: ElementRef, graphics: SVGGraphicsElement, primitive: SVGPrimitive) {
    const canvasElement: HTMLElement = (canvas.nativeElement as HTMLElement);
    // On ne defini les coins des primitives que si ce n'est pas deja fait
    if (canvasElement && graphics && primitive && primitive.toShow) {
      const xOffset: number = canvasElement.getBoundingClientRect().left;
      const yOffset: number = canvasElement.getBoundingClientRect().top;
      const bbox: DOMRect = graphics.getBoundingClientRect() as DOMRect;
      const topLeftCorner = new Point(bbox.x - xOffset, bbox.y - yOffset);
      const bottomRightCorner = new Point(bbox.x + bbox.width - xOffset, bbox.y + bbox.height - yOffset);
      primitive.setCorners(topLeftCorner, bottomRightCorner);
    }
  }
}
