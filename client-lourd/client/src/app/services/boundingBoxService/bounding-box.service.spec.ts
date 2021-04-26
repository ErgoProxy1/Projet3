import { TestBed } from '@angular/core/testing';
import { Rectangle } from '../svgPrimitives/rectangle/rectangle';
import { Color } from '../utils/color';
import { StrokeType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';
import { BoundingBoxService } from './bounding-box.service';

describe('BoundingBoxServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BoundingBoxService = TestBed.inject(BoundingBoxService);
    expect(service).toBeTruthy();
  });

  it('#resizeBoundingBox should resize the bounding box to be the smallest rectangle that includes the primitives', () => {
    const service: BoundingBoxService = TestBed.inject(BoundingBoxService);
    const point1: Point = new Point(50, 50);
    const point2: Point = new Point(55, 55);
    const point3: Point = new Point(100, 100);
    const point4: Point = new Point(105, 105);
    const point5: Point = new Point(150, 150);
    const point6: Point = new Point(155, 155);
    const rectangle1: Rectangle = new Rectangle(new Color(64, 64, 64, 1), new Color(32, 32, 32, 1), 5, StrokeType.Full, point1);
    const rectangle2: Rectangle = new Rectangle(new Color(16, 16, 16, 1), new Color(0, 0, 0, 1), 5, StrokeType.Full, point3);
    const rectangle3: Rectangle = new Rectangle(new Color(16, 16, 16, 1), new Color(0, 0, 0, 1), 5, StrokeType.Full, point5);
    rectangle1.resize(point1, point2, false, true);
    rectangle2.resize(point3, point4, false, true);
    rectangle3.resize(point5, point6, false, true);

    const boundingBox: Rectangle = new Rectangle(Color.WHITE, Color.BLACK, 5, StrokeType.Outline, new Point(0, 0));
    const expectedBoundingBox: Rectangle = new Rectangle(Color.WHITE, Color.BLACK, 5, StrokeType.Outline, new Point(0, 0));
    expectedBoundingBox.resize(point1, point6, false, true);
    service.resizeBoundingBox(boundingBox, [rectangle1, rectangle2, rectangle3]);
    expect(boundingBox).toEqual(expectedBoundingBox);
  });
});
