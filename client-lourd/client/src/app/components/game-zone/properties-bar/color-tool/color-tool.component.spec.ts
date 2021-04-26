import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NTimesPipe } from 'src/app/pipes/n-times.pipe';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { Color } from 'src/app/services/utils/color';
import { CanvasComponent } from '../../canvas/canvas.component';
import { SvgComponent } from '../../canvas/svg/svg.component';
import { ColorToolComponent } from './color-tool.component';

describe('ColorToolComponent', () => {
  let component: ColorToolComponent;
  let fixture: ComponentFixture<ColorToolComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ColorToolComponent, CanvasComponent, SvgComponent, NTimesPipe],
      imports: [FormsModule, ReactiveFormsModule, NgbModule, HttpClientModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Primary/Secondary color are toggled correctly', () => {
    expect(component.primarySelected).toBe(false);
    expect(component.paletteForm.value.hex).toBe('000000');
    expect(component.paletteForm.value.red).toBe(0);
    expect(component.paletteForm.value.green).toBe(0);
    expect(component.paletteForm.value.blue).toBe(0);

    component.colorPrimarySelected();
    expect(component.primarySelected).toBe(true);
    expect(component.paletteForm.value.hex).toBe('000000');
    expect(component.paletteForm.value.red).toBe(0);
    expect(component.paletteForm.value.green).toBe(0);
    expect(component.paletteForm.value.blue).toBe(0);
  });

  it('Colors are applied properly', () => {
    component.primarySelected = true;
    component.paletteForm.patchValue({ hex: '80F000' });
    component.applyClickedColor();
    expect(component.currentPrimaryHex).toBe('#80F000');

    component.primarySelected = false;
    component.paletteForm.patchValue({ hex: 'FAEBDC' });
    component.applyClickedColor();
  });

  it('Hex color is properly converted to RGB (For form display)', () => {
    component.paletteForm.patchValue({ hex: '80F000' });
    component.confirmHexColor();
    expect(component.paletteForm.value.red).toEqual(128);
    expect(component.paletteForm.value.green).toEqual(240);
    expect(component.paletteForm.value.blue).toEqual(0);

    component.paletteForm.patchValue({ hex: 'FAEBDC' });
    component.confirmHexColor();
    expect(component.paletteForm.value.red).toEqual(250);
    expect(component.paletteForm.value.green).toEqual(235);
    expect(component.paletteForm.value.blue).toEqual(220);
  });

  it('Hex color errors are properly detected', () => {
    component.paletteForm.patchValue({ hex: 'A' });
    component.confirmHexColor();
    expect(component.hexError).toBe(true);

    component.paletteForm.patchValue({ hex: 'AAAAAA' });
    component.confirmHexColor();
    expect(component.hexError).toBe(false);
  });

  it('RGB color is properly converted to Hex', () => {
    component.paletteForm.patchValue({
      red: 128,
      green: 64,
      blue: 32,
    });
    component.confirmRGBColor();
    expect(component.currentHexSelectedColor).toBe('#804020');

    component.paletteForm.patchValue({
      red: 100,
      green: 143,
      blue: 254,
    });
    component.confirmRGBColor();
    expect(component.currentHexSelectedColor).toBe('#648FFE');
  });

  it('RGB color errors are properly detected', () => {
    component.paletteForm.patchValue({
      red: null,
      green: 64,
      blue: 32,
    });
    component.confirmRGBColor();
    expect(component.rgbaError).toBe(true);

    component.paletteForm.patchValue({
      red: 128,
      green: 255,
      blue: 0,
    });
    component.confirmRGBColor();
    expect(component.rgbaError).toBe(false);
  });

  it('Opaciy is properly validated', () => {
    component.primaryAlpha = 0.25;
    component.validateAlpha();
    expect(component.primaryAlpha).toBe(0.25);

    component.primaryAlpha = 0.25;
    component.validateAlpha();
    expect(component.primaryAlpha).toBe(0.25);

    component.primaryAlpha = -0.25;
    component.validateAlpha();
    expect(component.primaryAlpha).toBe(0);

    component.primaryAlpha = 1.25;
    component.validateAlpha();
    expect(component.primaryAlpha).toBe(1);

    component.primaryAlpha = 0.25;
    component.validateAlpha();
    expect(component.primaryAlpha).toBe(0.25);
  });

  it('Conversion to RGB for color objects is properly done (For internal values)', () => {
    component.currentPrimaryHex = '#FF00AA';
    let expectedPrimary: Color = new Color(255, 0, 170);
    component.rgbaConversion();
    expect(component.rgbaPrimaryColor).toEqual(expectedPrimary);

    component.currentPrimaryHex = '#3209EB';
    expectedPrimary = new Color(50, 9, 235);
    component.rgbaConversion();
    expect(component.rgbaPrimaryColor).toEqual(expectedPrimary);
  });

  it('New colors are properly added to the stack of previously used colors', () => {
    const colorToAdd: Color[] = [
      new Color(0, 0, 0, 1),
      new Color(255, 0, 0, 1),
      new Color(255, 165, 0, 1),
      new Color(205, 255, 0, 1),
      new Color(50, 255, 0, 1),
      new Color(0, 255, 128, 1),
      new Color(71, 71, 71, 1),
      new Color(128, 0, 0, 1),
      new Color(128, 76, 0, 1),
      new Color(101, 127, 2, 1), ];

    const color1: Color = new Color(26, 126, 0, 1);
    const color2: Color = new Color(0, 127, 50, 1);

    component.addNewColor(colorToAdd[9]);
    component.addNewColor(colorToAdd[8]); // car c'est une FIFO
    component.addNewColor(colorToAdd[7]);
    component.addNewColor(colorToAdd[6]);
    component.addNewColor(colorToAdd[5]);
    component.addNewColor(colorToAdd[4]);
    component.addNewColor(colorToAdd[3]);
    component.addNewColor(colorToAdd[2]);
    component.addNewColor(colorToAdd[1]);
    component.addNewColor(colorToAdd[0]);

    expect(component.lastColorsUsed).toEqual(colorToAdd);

    component.addNewColor(color1);

    expect(component.lastColorsUsed[0]).toEqual(color1);
    component.addNewColor(color2);
    expect(component.lastColorsUsed[0]).toEqual(color2);
    expect(component.lastColorsUsed[1]).toEqual(color1);
  });

  it('Modal open/closed correctly detected and transmitted to keyboard shortcuts service', () => {
    const keyboarService: KeyboardService = TestBed.inject(KeyboardService);
    component.openModal();
    expect(keyboarService.modalWindowActive).toBe(true);

    component.closeModal();
    expect(keyboarService.modalWindowActive).toBe(false);
  });
});
