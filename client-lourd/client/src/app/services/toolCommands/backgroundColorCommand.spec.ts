import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../drawing/drawing.service';
import { Color } from '../utils/color';
import { BackgroundColorCommand } from './backgroundColorCommand';

describe('BackgroundColorCommand', () => {
  let command: BackgroundColorCommand;
  let service: DrawingService;
  const originalColor = new Color(100, 120, 0, 1);
  const newColor = new Color(200, 240, 190, 1);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawingService);
    command = new BackgroundColorCommand(service, newColor, originalColor);
  });

  it('#apply should change the background color', () => {
    service.backgroundColorObservable.subscribe((color: Color) => {
      expect(color).toEqual(newColor);
    });
    command.apply([]);
  });

  it('#cancel should revert the background color to its original color', () => {
    service.backgroundColorObservable.subscribe((color: Color) => {
      expect(color).toEqual(originalColor);
    });
    command.cancel([]);
  });

});
