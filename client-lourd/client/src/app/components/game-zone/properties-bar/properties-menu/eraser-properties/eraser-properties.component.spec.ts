import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAX_ERASER_SIZE, MIN_ERASER_SIZE } from 'src/app/services/utils/constantsAndEnums';
import { EraserPropertiesComponent } from './eraser-properties.component';

describe('EraserPropertiesComponent', () => {
  let component: EraserPropertiesComponent;
  let fixture: ComponentFixture<EraserPropertiesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EraserPropertiesComponent ],
      imports: [FormsModule, HttpClientModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EraserPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const setInputValue = (selector: string, value: string) => {
    const input = fixture.nativeElement.querySelector(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };

  it('the size of eraser of the input should be the same than the eraser object', waitForAsync(() => {
    fixture.whenStable().then(() => {
      const input = fixture.nativeElement.querySelector('#sizeInput');
      fixture.detectChanges();
      expect(input.value).toBe(String(component.eraserTool.sizeOfSquare()));
    });
  }));
  it('the size of square should be set to mimimum by the input range even if we pass value under the minimum', () => {
    setInputValue('#sizeInput', String(MIN_ERASER_SIZE - 1));
    expect(component.eraserTool.sizeOfSquare()).toEqual(MIN_ERASER_SIZE);
    expect(component.currentSize).toEqual(MIN_ERASER_SIZE);

    setInputValue('#sizeInput', String(MIN_ERASER_SIZE));
    expect(component.eraserTool.sizeOfSquare()).toEqual(MIN_ERASER_SIZE);
    expect(component.currentSize).toEqual(MIN_ERASER_SIZE);

    setInputValue('#sizeInput', String(-123));
    expect(component.eraserTool.sizeOfSquare()).toEqual(MIN_ERASER_SIZE);
    expect(component.currentSize).toEqual(MIN_ERASER_SIZE);

    component.currentSize = MIN_ERASER_SIZE - 11;
    component.onChangeSize();
    expect(component.eraserTool.sizeOfSquare()).toEqual(MIN_ERASER_SIZE);
    expect(component.currentSize).toEqual(MIN_ERASER_SIZE);

  });

  it('the size of square should be set to maximum by the input range even if we pass value under the minimum', () => {
    setInputValue('#sizeInput', String(MAX_ERASER_SIZE + 1));
    expect(component.eraserTool.sizeOfSquare()).toEqual(MAX_ERASER_SIZE);
    expect(component.currentSize).toEqual(MAX_ERASER_SIZE);

    setInputValue('#sizeInput', String(MAX_ERASER_SIZE));
    expect(component.eraserTool.sizeOfSquare()).toEqual(MAX_ERASER_SIZE);
    expect(component.currentSize).toEqual(MAX_ERASER_SIZE);

    setInputValue('#sizeInput', String(MAX_ERASER_SIZE * 10));
    expect(component.eraserTool.sizeOfSquare()).toEqual(MAX_ERASER_SIZE);
    expect(component.currentSize).toEqual(MAX_ERASER_SIZE);

    component.currentSize = MAX_ERASER_SIZE * 10;
    component.onChangeSize();
    expect(component.eraserTool.sizeOfSquare()).toEqual(MAX_ERASER_SIZE);
    expect(component.currentSize).toEqual(MAX_ERASER_SIZE);

  });

  it('the size of square should be set to middle of min and max by the input range even if we pass value under the minimum', () => {
    const middle: number = Math.floor((MAX_ERASER_SIZE + MIN_ERASER_SIZE) / 2);
    setInputValue('#sizeInput', String(middle));
    expect(component.eraserTool.sizeOfSquare()).toEqual(middle);
    expect(component.currentSize).toEqual(middle);
  });
});
