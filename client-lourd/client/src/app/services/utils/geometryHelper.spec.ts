import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { Color } from './color';
import { StrokeType } from './constantsAndEnums';
import { GeometryHelper } from './geometryHelper';
import { Point } from './point';

describe('GeometryHelper', () => {
    const rectangle1: Rectangle = new Rectangle(Color.BLACK, Color.WHITE, 1, StrokeType.FullWithOutline, new Point(0, 0));
    const rectangle2: Rectangle = new Rectangle(Color.BLACK, Color.WHITE, 1, StrokeType.FullWithOutline, new Point(0, 0));
    const point1: Point = new Point(10, 10);
    const point2: Point = new Point(20, 20);
    const point3: Point = new Point(30, 30);
    const point4: Point = new Point(40, 40);

    it('#isPrimitiveIntersectingRectangle should return true if the primitive is entirely inside the rectangle', () => {
        rectangle1.resize(point1, point4, false, true);
        rectangle2.resize(point2, point3, false, true);

        expect(GeometryHelper.isPrimitiveIntersectingRectangle(rectangle2, rectangle1)).toEqual(true);
    });

    it('#isPrimitiveIntersectingRectangle should return true if the primitive is partially inside the rectangle', () => {
        rectangle1.resize(point1, point3, false, true);
        rectangle2.resize(point2, point4, false, true);

        expect(GeometryHelper.isPrimitiveIntersectingRectangle(rectangle2, rectangle1)).toEqual(true);
    });

    it('#isPrimitiveIntersectingRectangle should return true if the rectangle is entirely inside the primitive', () => {
        rectangle1.resize(point2, point3, false, true);
        rectangle2.resize(point1, point4, false, true);

        expect(GeometryHelper.isPrimitiveIntersectingRectangle(rectangle2, rectangle1)).toEqual(true);
    });

    it('#isPrimitiveIntersectingRectangle should return false if the primitive is entirely outside the rectangle', () => {
        rectangle1.resize(point1, point2, false, true);
        rectangle2.resize(point3, point4, false, true);

        expect(GeometryHelper.isPrimitiveIntersectingRectangle(rectangle2, rectangle1)).toEqual(false);
    });
});
