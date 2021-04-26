
export const MAX_RGB = 255;
export const MAX_ALPHA = 1;
export class Color {

  constructor(r: number, g: number, b: number, a: number = MAX_ALPHA) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a < MAX_ALPHA ? a : MAX_ALPHA;
    this.asString();
  }

  static readonly BLACK: Color = new Color(0, 0, 0, MAX_ALPHA);
  static readonly WHITE: Color = new Color(MAX_RGB, MAX_RGB, MAX_RGB, MAX_ALPHA);
  static readonly TRANSPARENT: Color = new Color(MAX_RGB, MAX_RGB, MAX_RGB, 0);
  static readonly TRANSPARENT_RGBA_TEXT_FORM: string = 'none';

  r: number; // Valeur du rouge, variant de 0 a 255
  g: number; // Valeur du vert, variant de 0 a 255
  b: number; // Valeur du bleu, variant de 0 a 255
  a: number; // Valeur de l'opocite, variant de 0 a 1
  rgbaTextForm = '';
  static copyColor(color: Color): Color {
    return new Color(color.r, color.g, color.b, color.a);
  }

  changeColor(color: Color, a: number): void {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = a;
    this.asString();
  }

  asString(): string {
    this.rgbaTextForm = `rgba(${this.r},${this.g},${this.b},${this.a})`;
    if (this.a === 0) {
      this.rgbaTextForm = Color.TRANSPARENT_RGBA_TEXT_FORM;
    }
    return this.rgbaTextForm;
  }

  isEquivalent(color: Color): boolean {
    return (this.r === color.r && this.g === color.g && this.b === color.b);

  }
}
