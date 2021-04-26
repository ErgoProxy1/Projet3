import { Ellipse } from '../svgPrimitives/ellipse/ellipse';
import { Line } from '../svgPrimitives/line/line';
import { Path } from '../svgPrimitives/path/path';
import { Pen } from '../svgPrimitives/pen/pen';
import { Polygon } from '../svgPrimitives/polygon/polygon';
import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { TextPrimitive } from '../svgPrimitives/text/textPrimitive';
import { EraserCommand } from '../toolCommands/eraserCommand';
import { Color } from '../utils/color';
import { ALIGNS, FONTS, HIGHLIGH_BACKUP_COLOR, HIGHLIGH_COLOR, KeyboardEventType, LineCap, LineJoin,
   MAX_ERASER_SIZE, MIN_ERASER_SIZE, MouseEventType, Pattern, PrimitiveType, StrokeType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { EraserTool } from './eraserTool';

// tslint:disable: no-string-literal
describe('EraserTool', () => {
  let tool: EraserTool;
  const typeOfPrimitives: PrimitiveType[] = [PrimitiveType.Ellipse, PrimitiveType.Line, PrimitiveType.Paint, PrimitiveType.Pen,
  PrimitiveType.Pencil, PrimitiveType.Polygon, PrimitiveType.Rectangle, PrimitiveType.Stamp, PrimitiveType.Text];
  const randomSVGPrimitives: SVGPrimitive[] = [];
  const numberToTest = 500;

  const generateRandomSVGPrimitiveMap = (numberToGenerate: number) => {
    let randomNumber: number;
    for (let i = 0; i < numberToGenerate; i++) {
      randomNumber = Math.floor(Math.random() * typeOfPrimitives.length);
      switch (typeOfPrimitives[randomNumber]) {
        case PrimitiveType.Ellipse:
          randomSVGPrimitives.push(new Ellipse(new Color(0, 0, 0), new Color(0, 0, 0), 2, StrokeType.Full, new Point(10, 10)));
          break;
        case PrimitiveType.Line:
          randomSVGPrimitives.push(new Line(new Color(0, 0, 0), 2, Pattern.FullLine, LineJoin.Bevel, LineCap.Square, 2, 2));
          break;
        case PrimitiveType.Paint:
          randomSVGPrimitives.push(new Path(new Color(0, 0, 0), 2, PrimitiveType.Paint));
          break;
        case PrimitiveType.Pen:
          randomSVGPrimitives.push(new Pen(new Color(0, 0, 0), 2, PrimitiveType.Pen));
          break;
        case PrimitiveType.Pencil:
          randomSVGPrimitives.push(new Path(new Color(0, 0, 0), 2, PrimitiveType.Pen));
          break;
        case PrimitiveType.Polygon:
          randomSVGPrimitives.push(new Polygon(new Color(0, 0, 0), new Color(0, 0, 0), 2, StrokeType.Full, new Point(10, 10)));
          break;
        case PrimitiveType.Rectangle:
          randomSVGPrimitives.push(new Rectangle(new Color(0, 0, 0), new Color(0, 0, 0), 2, StrokeType.Full, new Point(10, 10)));
          break;
        case PrimitiveType.Text:
          randomSVGPrimitives.push(new TextPrimitive(16, new Color(0, 0, 0, 1), FONTS[0], ALIGNS[0], new Point(50, 50), true, false));
          break;
      }

    }
  };
  beforeEach(() => {
    tool = new EraserTool();
  });
  it('should be created', () => {
    expect(tool).toBeTruthy();
  });

  // updatePrimitivesList()
  it('should set the SVG array correctly', () => {
    generateRandomSVGPrimitiveMap(numberToTest);
    tool.updatePrimitivesList(randomSVGPrimitives);
    expect(tool['primitives']).toBe(randomSVGPrimitives);
  });

  // getCursor()
  it('should give the correct cursor string', () => {
    expect(tool.getCursor()).toEqual('none');
  });

  // Pour le size de l'efface
  it('Should have size of MIN_ERASER_SIZE', () => {
    expect(tool.sizeOfSquare(MIN_ERASER_SIZE)).toEqual(MIN_ERASER_SIZE);
    expect(tool.sizeOfSquare(MIN_ERASER_SIZE - 2)).toEqual(MIN_ERASER_SIZE);
    expect(tool.sizeOfSquare(-123)).toEqual(MIN_ERASER_SIZE);
  });

  it('Should have size of middle between max and min after setting it', () => {
    expect(tool.sizeOfSquare((MIN_ERASER_SIZE + MAX_ERASER_SIZE) / 2)).toEqual((MIN_ERASER_SIZE + MAX_ERASER_SIZE) / 2);
    expect(tool.sizeOfSquare()).toEqual((MIN_ERASER_SIZE + MAX_ERASER_SIZE) / 2);
  });

  it('Should have size of MAX_ERASER_SIZE', () => {
    expect(tool.sizeOfSquare(MAX_ERASER_SIZE)).toEqual(MAX_ERASER_SIZE);
    expect(tool.sizeOfSquare(MAX_ERASER_SIZE + 2)).toEqual(MAX_ERASER_SIZE);
    expect(tool.sizeOfSquare(MAX_ERASER_SIZE * 2)).toEqual(MAX_ERASER_SIZE);
  });

  // Mouse leave
  it('Should return a empty array if it mouseleave', () => {
    tool.mouseEvent(MouseEventType.MouseLeave, new Point(50, 50));
    expect(tool.getTemporaryPrimitives()).toEqual([]);
  });

  // Mouse left click
  it('Should return the eraser icone (square) if mouseEvent is left clicked and also the isPressed must be set to true', () => {
    tool.mouseEvent(MouseEventType.MouseDownLeft, new Point(50, 50));
    expect(tool.getTemporaryPrimitives()).toEqual([tool.eraserIcone]);
    expect(tool['isPressed']).toEqual(true);
  });

  // Mouse leftbutton up
  it('Should return the eraser icone (square) if mouseEvent is left clicked and also the isPressed must be set to false', () => {
    tool.mouseEvent(MouseEventType.MouseUpLeft, new Point(50, 50));
    expect(tool.getTemporaryPrimitives()).toEqual([tool.eraserIcone]);
    expect(tool['isPressed']).toEqual(false);
    tool.mouseEvent(MouseEventType.MouseDownLeft, new Point(50, 50)); // setting isPressed to true
    tool.mouseEvent(MouseEventType.MouseUpLeft, new Point(50, 50));
    expect(tool.getTemporaryPrimitives()).toEqual([tool.eraserIcone]);
    expect(tool['isPressed']).toEqual(false);
  });

  it('Should return the eraser icone (square) if mouseEvent is mouseMove and also the position must be correctly set', () => {
    const sizeOfEraser: number = (MIN_ERASER_SIZE + MAX_ERASER_SIZE) / 2;
    tool.sizeOfSquare(sizeOfEraser);
    const x = 244;
    const y = 345;
    const position: Point = new Point(x, y);
    tool.mouseEvent(MouseEventType.MouseMove, position);
    expect(tool.getTemporaryPrimitives()).toEqual([tool.eraserIcone]);
    expect(tool.eraserIcone.position.x).toEqual(x - sizeOfEraser / 2);
    expect(tool.eraserIcone.position.y).toEqual(y - sizeOfEraser / 2);
  });

  // test the new position
  it('the position should be set correctly', () => {
    const x = 100;
    const y = 100;
    const position: Point = new Point(x, y);
    const sizeOfEraser: number = (MIN_ERASER_SIZE + MAX_ERASER_SIZE) / 2;
    tool.sizeOfSquare(sizeOfEraser);
    tool['updateEraserPosition'](position);
    expect(tool.eraserIcone.position.x).toEqual(x - sizeOfEraser / 2);
    expect(tool.eraserIcone.position.y).toEqual(y - sizeOfEraser / 2);
  });

  it('Unused functions behave as expected', () => {
    tool['drawEraser'] = true;
    tool.keyboardEvent(KeyboardEventType.InvalidEvent);
    expect(tool.getTemporaryPrimitives()).toEqual([tool.eraserIcone]);
    tool.mouseWheelEvent(1);
    expect(tool.getTemporaryPrimitives()).toEqual([tool.eraserIcone]);

    tool['drawEraser'] = false;
    tool.keyboardEvent(KeyboardEventType.InvalidEvent);
    expect(tool.getTemporaryPrimitives()).toEqual([]);
    tool.mouseWheelEvent(1);
    expect(tool.getTemporaryPrimitives()).toEqual([]);
  });

  // ErasePrimitiveTest
  it('The current SVG should be null once it has been erase', () => {
    generateRandomSVGPrimitiveMap(numberToTest);
    tool.updatePrimitivesList(randomSVGPrimitives);
    const randomIndex = Math.floor(Math.random() * randomSVGPrimitives.length);
    const svg: SVGPrimitive = randomSVGPrimitives[randomIndex];
    tool['currentSVG'] = svg;
    tool['command'] = new EraserCommand();
    tool['lastStokeColor'] = svg.strokeColor;
    tool['erasePrimitive']();
    expect(tool['currentSVG']).toBeNull();
    expect(tool['lastStokeColor']).toBeNull();
    expect(svg.toShow).toBe(false);
  });

  // Check collision
  it('The method checkCollision should act normally', () => {
    // generateRandomSVGPrimitiveMap(numberToTest);
    const square: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(125, 125, 125),
                                2, StrokeType.Full, new Point(100, 100), 100, 100);
    square.setCenter(new Point(100, 100));
    const strokeColor: Color = Color.copyColor(square.strokeColor);
    randomSVGPrimitives.push(square);
    tool.updatePrimitivesList(randomSVGPrimitives);
    tool.eraserIcone.setCenter(new Point(150, 150));
    // On a donc un carré de 100x100 à la position:100,100 et l'efface se trouve à 150,150 donc une collision devrait se passer
    tool['checkCollision']();
    expect(tool['currentSVG']).toEqual(square);
    expect(tool['lastStokeColor']).toEqual(strokeColor);
    // On place maintenant la souris ailleurs et elle ne devrait plus touché au carré
    tool.eraserIcone.setCenter(new Point(500, 500));
    tool['checkCollision']();
    expect(tool['currentSVG']).toBeNull();
    expect(tool['lastStokeColor']).toBeNull();
    expect(square.toShow).toBe(true);

    tool['isPressed'] = true;
    tool['command'] = new EraserCommand();
    tool.eraserIcone.setCenter(new Point(150, 150));
    // On a donc un carré de 100x100 à la position:100,100 et l'efface se trouve à 150,150 donc une collision devrait se passer
    tool['checkCollision']();
    expect(square.toShow).toBe(false);
  });

  // removePrimitiveSelection
  it('Should remove the primitive selection', () => {
    const square: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(125, 125, 125),
                                2, StrokeType.Full, new Point(100, 100), 100, 100);
    const strokeColor: Color = new Color(123, 123, 123);
    tool['lastStokeColor'] = Color.copyColor(strokeColor);
    tool['currentSVG'] = square;

    tool['removePrimitiveSelection']();
    expect(square.strokeColor).toEqual(Color.copyColor(strokeColor));
    expect(tool['currentSVG']).toBeNull();
    expect(tool['lastStokeColor']).toBeNull();
  });

  // setPerimiter
  it('Should set the correct perimeter', () => {
    const square: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(125, 125, 125),
                                2, StrokeType.Full, new Point(100, 100), 100, 100);
    tool['currentSVG'] = square;
    tool['setPerimiter']();
    expect(tool['perimeter'].position).toEqual(square.getTopLeftCorner());
  });

  // highlightPrimitive
  it('Should highLight the primitive', () => {
    const square: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(125, 125, 125),
                                2, StrokeType.Full, new Point(100, 100), 100, 100);
    let lastColor: Color = Color.copyColor(square.strokeColor);
    tool['highlightPrimitive'](square);
    expect(tool['currentSVG']).toBe(square);
    expect(tool['lastStokeColor']).toEqual(lastColor);
    expect(square.strokeColor).toEqual(Color.copyColor(HIGHLIGH_COLOR));

    const square2: Rectangle = new Rectangle(new Color(255, 0, 0), new Color(255, 0, 0), 2, StrokeType.Full, new Point(100, 100), 100, 100);
    lastColor = Color.copyColor(square2.strokeColor);
    tool['highlightPrimitive'](square2);
    expect(tool['currentSVG']).toBe(square2);
    expect(tool['lastStokeColor']).toEqual(lastColor);
    expect(square2.strokeColor.isEquivalent(HIGHLIGH_BACKUP_COLOR)).toBe(false);

    const dummyText: TextPrimitive = new TextPrimitive(2, new Color(0, 0, 0), FONTS[0], ALIGNS[0], new Point(0, 0), true, true);
    tool['highlightPrimitive'](dummyText);
    expect(tool['currentSVG']).toBe(dummyText);
  });

  // leaveEraser
  it('Should set all necessairy attribut to null or false when eraser leave', () => {
    const square: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(125, 125, 125),
                                2, StrokeType.Full, new Point(100, 100), 100, 100);
    const dummyColor: Color = new Color(123, 234, 123);
    tool['currentSVG'] = square;
    tool['lastStokeColor'] = Color.copyColor(dummyColor);
    tool['drawEraser'] = true;
    tool['isPressed'] = true;
    tool['leaveEraser']();
    expect(tool['currentSVG']).toBeNull();
    expect(tool['lastStokeColor']).toBeNull();
    expect(tool['drawEraser']).toBe(false);
    expect(tool['isPressed']).toBe(false);

  });

  // finishErasing
  it('Should correctly finish erasing', () => {
    const square: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(125, 125, 125),
                                2, StrokeType.Full, new Point(100, 100), 100, 100);
    randomSVGPrimitives.push(square);
    tool.updatePrimitivesList(randomSVGPrimitives);
    tool['command'] = new EraserCommand();
    tool['command'].removePrimitive(0, square);
    tool['isPressed'] = true;
    tool.subscribeToCommand().subscribe((command) => {
      expect(command).toEqual(tool['command']);
    });
    tool['finishErasing']();
    expect(tool['isPressed']).toBe(false);
  });

  // moving
  it('The method moving should act correctly', () => {
    const square: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(125, 125, 125),
                                2, StrokeType.Full, new Point(100, 100), 100, 100);
    randomSVGPrimitives.push(square);
    tool.updatePrimitivesList(randomSVGPrimitives);

    tool['moving'](new Point(0, 0));
    expect(tool['drawEraser']).toBe(true);
    tool['isPressed'] = true;
    tool['currentSVG'] = square;
    tool['drawEraser'] = false;
    tool['command'] = new EraserCommand();
    tool['moving'](new Point(0, 0));
    expect(tool['drawEraser']).toBe(true);

  });

  // beginErasing
  it('The method beginErasing should act correctly', () => {
    const square: Rectangle = new Rectangle(new Color(0, 0, 0), new Color(125, 125, 125),
                                2, StrokeType.Full, new Point(100, 100), 100, 100);
    randomSVGPrimitives.push(square);
    tool.updatePrimitivesList(randomSVGPrimitives);

    tool['beginErasing']();
    expect(tool['command']).toBeTruthy();
    tool['isPressed'] = true;
    tool['currentSVG'] = square;
    tool['drawEraser'] = false;
    tool['beginErasing']();
    expect(tool['command']).toBeTruthy();

  });

  // beginErasing
  it('The method beginErasing should act correctly', () => {

    tool['drawEraser'] = false;
    expect(tool.getTemporaryPrimitives()).toEqual([]);

    tool['drawEraser'] = true;
    const eraserIcone = tool['eraserIcone'];
    const perimeter = tool['perimeter'];
    expect(tool.getTemporaryPrimitives()).toEqual([eraserIcone]);

    const dummyText: TextPrimitive = new TextPrimitive(2, new Color(0, 0, 0), FONTS[0], ALIGNS[0], new Point(0, 0, ), true, true);
    tool['currentSVG'] = dummyText;
    expect(tool.getTemporaryPrimitives()).toEqual([perimeter, eraserIcone]);

  });

});
