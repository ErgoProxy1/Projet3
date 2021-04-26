import { Color } from '../../utils/color';
import { AlignInfo, FontInfo, PrimitiveType } from '../../utils/constantsAndEnums';
import { LineInfo } from '../../utils/lineInfo';
import { Point } from '../../utils/point';
import { SVGPrimitive } from '../svgPrimitive';

export class TextPrimitive extends SVGPrimitive {

  type = PrimitiveType.Text;
  SELECTABLE = true;
  selected = false;
  fontWeight: string;
  private bold: boolean;
  fontStyle: string;
  private italic: boolean;
  size = 16;
  textColor: Color;
  font: FontInfo;
  align: AlignInfo;
  position: Point;
  lines: LineInfo[] = [];

  static createCopy(primitive: SVGPrimitive): TextPrimitive {
    const text: TextPrimitive = primitive as TextPrimitive;
    const newText: TextPrimitive = new TextPrimitive(
      text.size, text.textColor, text.font, text.align, Point.copyPoint(text.position), text.bold, text.italic,
    );
    newText.topLeftCorner = Point.copyPoint(text.topLeftCorner);
    newText.bottomRightCorner = Point.copyPoint(text.bottomRightCorner);
    newText.lines = [];
    text.lines.forEach((line: LineInfo) => {
      newText.lines.push({ innertext: line.innertext, position: Point.copyPoint(line.position)});
    });

    newText.rotation = text.rotation;
    newText.scaleX = text.scaleX;
    newText.scaleY = text.scaleY;
    newText.transformations = text.transformations;

    newText.rotationGroupOrigin = Point.copyPoint(text.rotationGroupOrigin);
    newText.rotationCenterOrigin = Point.copyPoint(text.rotationCenterOrigin);
    newText.createTextTransformationsStrings();

    return newText;
  }

  constructor(size: number, textColor: Color, font: FontInfo, align: AlignInfo, position: Point, bold: boolean, italics: boolean) {
    super();
    this.bold = bold;
    bold ? (this.fontWeight = 'bold') : (this.fontWeight = 'normal');
    this.italic = italics;
    italics ? (this.fontStyle = 'italic') : (this.fontStyle = 'normal');
    this.size = size;
    this.textColor = Color.copyColor(textColor);
    this.font = font;
    this.align = align;
    this.position = position;
    this.lines.push({ innertext: '', position: Point.copyPoint(this.position) });
    this.strokeColor = new Color(0, 0, 0);
    this.createTextTransformationsStrings();
  }

  copy(): TextPrimitive {
    return TextPrimitive.createCopy(this);
  }

  move(translation: Point): void {
    this.position.addPoint(translation);
    this.lines.forEach((line: LineInfo) => {
      line.position.addPoint(translation);
    });
    this.moveCorners(translation);
    this.createTextTransformationsStrings();
  }

  scale(translation: Point, scaleFactorX: number, scaleFactorY: number): void {
    this.scaleX *= scaleFactorX;
    this.scaleY *= scaleFactorY;
    this.move(translation);
    this.createTextTransformationsStrings();
  }

  createTextTransformationsStrings(): void {
    const translation1String = `translate(${this.position.x},${this.position.y})`;
    const scaleString = `scale(${this.scaleX},${this.scaleY}) `;
    const translation2String = `translate(${-this.position.x},${-this.position.y})`;
    this.transformations =  `${translation1String}${scaleString}${translation2String}`;
  }
}
