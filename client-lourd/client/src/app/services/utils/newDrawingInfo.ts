import { Color } from './color';

export class NewDrawingInfo {
  width: number;
  height: number;
  color: Color;

  constructor(w: number, h: number, c: Color) {
    this.width = w;
    this.height = h;
    this.color = Color.copyColor(c);
  }
}
