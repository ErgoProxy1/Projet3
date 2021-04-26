import { TestBed } from '@angular/core/testing';
import { Ellipse } from '../svgPrimitives/ellipse/ellipse';
import { Line } from '../svgPrimitives/line/line';
import { Path } from '../svgPrimitives/path/path';
import { Pen } from '../svgPrimitives/pen/pen';
import { Polygon } from '../svgPrimitives/polygon/polygon';
import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { TextPrimitive } from '../svgPrimitives/text/textPrimitive';
import { Color } from '../utils/color';
import { ALIGNS, FONTS, LineCap, LineJoin, Pattern, PrimitiveType, StrokeType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { EraserCommand } from './eraserCommand';

describe('EraserToolCommand', () => {
    let eraserCommand: EraserCommand;
    const typeOfPrimitives: PrimitiveType[] = [PrimitiveType.Ellipse, PrimitiveType.Line, PrimitiveType.Paint, PrimitiveType.Pen,
    PrimitiveType.Pencil, PrimitiveType.Polygon, PrimitiveType.Rectangle, PrimitiveType.Stamp, PrimitiveType.Text];
    const randomSVGPrimitives: SVGPrimitive[] = [];
    const numberToTest = 500;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        eraserCommand = new EraserCommand();
        generateRandomSVGPrimitiveMap(numberToTest);
    });

    it('should be properly created', () => {
        expect(eraserCommand).toBeTruthy();
    });

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
                    randomSVGPrimitives.push(new TextPrimitive(16, new Color(0, 0, 0, 1),
                        FONTS[0], ALIGNS[0], new Point(50, 50), true, false));
                    break;
            }

        }
    };

    // apply
    it('Should correctly apply the command.', () => {
        for (let i = 0; i < randomSVGPrimitives.length / 2; i++) {
            const indexToRemove = Math.floor(Math.random() * randomSVGPrimitives.length);
            eraserCommand.removePrimitive(indexToRemove, randomSVGPrimitives[indexToRemove] );
        }

        eraserCommand.apply(randomSVGPrimitives);

        eraserCommand.primitivesToErase.forEach((primitive, index) => {
            expect(randomSVGPrimitives.indexOf(primitive)).toBe(-1);
        });

    });

    // cancel (undo)
    it('Should correctly cancel the command. (undo)', () => {
        const oldTable: SVGPrimitive[] = randomSVGPrimitives;
        for (let i = 0; i < randomSVGPrimitives.length / 2; i++) {
            const indexToRemove = Math.floor(Math.random() * randomSVGPrimitives.length);
            eraserCommand.removePrimitive(indexToRemove, randomSVGPrimitives[indexToRemove] );
        }

        eraserCommand.apply(randomSVGPrimitives);

        eraserCommand.cancel(randomSVGPrimitives);

        expect(randomSVGPrimitives).toEqual(oldTable);

    });

    // Redo
    it('Should correctly redo ', () => {
        const oldTable: SVGPrimitive[] = randomSVGPrimitives;
        for (let i = 0; i < randomSVGPrimitives.length / 2; i++) {
            const indexToRemove = Math.floor(Math.random() * randomSVGPrimitives.length);
            eraserCommand.removePrimitive(indexToRemove, randomSVGPrimitives[indexToRemove] );
        }

        eraserCommand.apply(randomSVGPrimitives);

        eraserCommand.cancel(randomSVGPrimitives);

        expect(randomSVGPrimitives).toEqual(oldTable);

        eraserCommand.apply(randomSVGPrimitives);

        eraserCommand.primitivesToErase.forEach((primitive, index) => {
            expect(randomSVGPrimitives.indexOf(primitive)).toBe(-1);
        });

    });

    // undo-Redo-undo-redo quelques fois
    it('Should correctly undo-redo-undo-redo', () => {
        const oldTable: SVGPrimitive[] = randomSVGPrimitives;
        for (let i = 0; i < randomSVGPrimitives.length / 2; i++) {
            const indexToRemove = Math.floor(Math.random() * randomSVGPrimitives.length);
            eraserCommand.removePrimitive(indexToRemove, randomSVGPrimitives[indexToRemove] );
        }

        eraserCommand.apply(randomSVGPrimitives);

        eraserCommand.cancel(randomSVGPrimitives);

        expect(randomSVGPrimitives).toEqual(oldTable);

        eraserCommand.apply(randomSVGPrimitives);

        eraserCommand.primitivesToErase.forEach((primitive, index) => {
            expect(randomSVGPrimitives.indexOf(primitive)).toBe(-1);
        });

        eraserCommand.cancel(randomSVGPrimitives);

        expect(randomSVGPrimitives).toEqual(oldTable);

        eraserCommand.apply(randomSVGPrimitives);

        eraserCommand.primitivesToErase.forEach((primitive, index) => {
            expect(randomSVGPrimitives.indexOf(primitive)).toBe(-1);
        });

        eraserCommand.cancel(randomSVGPrimitives);

        expect(randomSVGPrimitives).toEqual(oldTable);

        eraserCommand.apply(randomSVGPrimitives);

        eraserCommand.primitivesToErase.forEach((primitive, index) => {
            expect(randomSVGPrimitives.indexOf(primitive)).toBe(-1);
        });

    });

    // removePrimitive
    it('Should add correctly the primtive to the primitive to erase Map and set the toShow attribut to false', () => {
        for (let i = 0; i < randomSVGPrimitives.length / 2; i++) {
            const indexToRemove = Math.floor(Math.random() * randomSVGPrimitives.length);
            eraserCommand.removePrimitive(indexToRemove, randomSVGPrimitives[indexToRemove] );
            expect(randomSVGPrimitives[indexToRemove].toShow).toBe(false);
            expect(eraserCommand.primitivesToErase.has(indexToRemove)).toBe(true);
            expect((eraserCommand.primitivesToErase.get(indexToRemove) as SVGPrimitive).toShow).toBe(false);

        }
    });
    // sortMap
    it('Should properly sort the Map', () => {
        let indexes: number[] = [];
        const primitivesSortedMap: Map<number, SVGPrimitive> = new Map<number, SVGPrimitive>();

        for (let i = 0; i < randomSVGPrimitives.length / 2; i++) {
            const randomIndex = Math.floor(Math.random() * randomSVGPrimitives.length);
            eraserCommand.removePrimitive(randomIndex, randomSVGPrimitives[randomIndex] );
        }

        eraserCommand.primitivesToErase.forEach((prim, index) => {
            indexes.push(index);
        });

        indexes = indexes.sort();
        indexes.forEach((index) => {
            primitivesSortedMap.set(index, randomSVGPrimitives[index]);
        });

        // tslint:disable-next-line: no-string-literal
        eraserCommand['sortMap']();

        expect(primitivesSortedMap).toEqual(eraserCommand.primitivesToErase);

        let lastindex = -1;

        eraserCommand.primitivesToErase.forEach((prim, index) => {
            expect(index).toBeGreaterThan(lastindex);
            lastindex = index;
        });

    });

});
