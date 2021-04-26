import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Color } from '../utils/color';
import { ColorService } from './color.service';

describe('ColorSelectionService', () => {
  let service: ColorService;
  beforeAll(() => {TestBed.resetTestEnvironment();
                   TestBed.initTestEnvironment(BrowserDynamicTestingModule,
    platformBrowserDynamicTesting());
                   TestBed.configureTestingModule({});
                   service = TestBed.inject(ColorService);
});

  it('should be created', () => {
    const aService: ColorService = TestBed.inject(ColorService);
    expect(aService).toBeTruthy();
  });
  it('RGB numbers are properly converted to hex strings' , () => {
    const color: Color = new Color(1, 120, 78);
    expect(service.convertRgbToHex(color, true)).toBe('#01784E');
  });
  it('Hex Strings are properly converted to rgb numbers', () => {
    const hexValue = 'AA45BB';
    const rgbNumber: Color = service.convertHextoRgb(hexValue);
    expect(rgbNumber.r).toBe(170);
    expect(rgbNumber.g).toBe(69);
    expect(rgbNumber.b).toBe(187);
  });
  it('Non-hexadecimal digit are switched to "" ', () => {
    const incorrectDigit1 = 'z';
    const incorrectDigit2 = 'a';
    let correctDigit = 'C';
    correctDigit = service.correctHexInput(correctDigit);
    expect(service.correctHexInput(incorrectDigit1)).toBe('');
    expect(service.correctHexInput(incorrectDigit2)).toBe('');
    expect(service.correctHexInput(correctDigit)).toBe('C');
  });
  it('RGB value errors are properly detected', () => {
    const incorrectColor: Color = new Color(-7, 155, 300);
    expect(service.isColorValid(incorrectColor)).toBe(false);
    const correctColor: Color = new Color(144, 38, 255);
    expect(service.isColorValid(correctColor)).toBe(true);
  });
  it('strings are properly converted into an hex form', () => {
    const hexValue = '457AB9';
    expect(service.stringToHexForm(hexValue)).toBe('#457AB9');
  });
  it('The alpha is always between 0 and 1' , () => {
    const correctAlpha = 0.5;
    const incorrectAlpha1 = -7;
    const incorrectAlpha2 = 2;
    expect(service.confirmAlpha(correctAlpha)).toBe(0.5);
    expect(service.confirmAlpha(incorrectAlpha1)).toBe(1);
    expect(service.confirmAlpha(incorrectAlpha2)).toBe(1);
  });

});
