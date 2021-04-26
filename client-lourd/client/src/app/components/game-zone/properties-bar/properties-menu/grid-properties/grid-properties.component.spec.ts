import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GridPropertiesComponent } from './grid-properties.component';

describe('GridPropertiesComponent', () => {
  let component: GridPropertiesComponent;
  let fixture: ComponentFixture<GridPropertiesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GridPropertiesComponent],
      imports: [FormsModule, HttpClientModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridPropertiesComponent);
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
    fixture.detectChanges();
  };

  // test du input number pour la grandeur d'un carré de la grille
  it('the size of square should be set to the default value of the grid', waitForAsync(() => {
    fixture.whenStable().then(() => {
      const input = fixture.nativeElement.querySelector('#squareSizeNumber');
      fixture.detectChanges();
      expect(input.value).toBe(String(component.gridInfo.sizeOfSquare()));
    });
  }));
  it('the size of square should be set to mimimum by the input number', () => {
    setInputValue('#squareSizeNumber', String(component.MIN_SQUARE_SIZE - 1));
    expect(component.gridInfo.sizeOfSquare()).toEqual(component.MIN_SQUARE_SIZE);
  });
  it('the size of square should be set to maximum by the input number', () => {
    setInputValue('#squareSizeNumber', String(component.MAX_SQUARE_SIZE + 1));
    expect(component.gridInfo.sizeOfSquare()).toEqual(component.MAX_SQUARE_SIZE);
  });

  it('the size of square should be set to middle between max and min by the input number', () => {
    setInputValue('#squareSizeNumber', String((component.MAX_SQUARE_SIZE + component.MIN_SQUARE_SIZE) / 2));
    expect(component.gridInfo.sizeOfSquare()).toEqual((component.MAX_SQUARE_SIZE + component.MIN_SQUARE_SIZE) / 2);
  });

  // test du input range pour la grandeur d'un carré de la grille
  it('the size of square should be set to the default value of the grid', waitForAsync(() => {
    fixture.whenStable().then(() => {
      const input = fixture.nativeElement.querySelector('#squareSizeRange');
      fixture.detectChanges();
      expect(input.value).toBe(String(component.gridInfo.sizeOfSquare()));
    });
  }));
  it('the size of square should be set to mimimum by the input range', () => {
    setInputValue('#squareSizeRange', String(component.MIN_SQUARE_SIZE - 1));
    expect(component.gridInfo.sizeOfSquare()).toEqual(component.MIN_SQUARE_SIZE);
  });
  it('the size of square should be set to maximum by the input range', () => {
    setInputValue('#squareSizeRange', String(component.MAX_SQUARE_SIZE + 1));
    expect(component.gridInfo.sizeOfSquare()).toEqual(component.MAX_SQUARE_SIZE);
  });

  it('the size of square should be set to middle between max and min by the input range', () => {
    setInputValue('#squareSizeRange', String((component.MAX_SQUARE_SIZE + component.MIN_SQUARE_SIZE) / 2));
    expect(component.gridInfo.sizeOfSquare()).toEqual((component.MAX_SQUARE_SIZE + component.MIN_SQUARE_SIZE) / 2);
  });

  // test du input number pour la transparence de la grille
  it('the alpha of grid should be set to the default value of the grid', waitForAsync(() => {
    fixture.whenStable().then(() => {
      const input = fixture.nativeElement.querySelector('#squareAlphaNumber');
      fixture.detectChanges();
      expect(input.value).toBe(String(component.gridInfo.colorStroke.a));
    });
  }));
  it('the alpha of grid should be set to mimimum by the input number', () => {
    setInputValue('#squareAlphaNumber', String(component.MIN_TRANSPARENCY - 1));
    expect(component.gridInfo.colorStroke.a).toEqual(component.MIN_TRANSPARENCY);
  });
  it('the alpha of grid should be set to maximum by the input number', () => {
    setInputValue('#squareAlphaNumber', String(component.MAX_TRANSPARENCY + 1));
    expect(component.gridInfo.colorStroke.a).toEqual(component.MAX_TRANSPARENCY);
  });

  it('the alpha of grid should be set to middle between max and min by the input number', () => {
    setInputValue('#squareAlphaNumber', String((component.MAX_TRANSPARENCY + component.MIN_TRANSPARENCY) / 2));
    expect(component.gridInfo.colorStroke.a).toEqual((component.MAX_TRANSPARENCY + component.MIN_TRANSPARENCY) / 2);
  });

  // test du input range pour la transparence de la grille
  it('the alpha of grid should be set to the default value of the grid', waitForAsync(() => {
    fixture.whenStable().then(() => {
      const input = fixture.nativeElement.querySelector('#squareAlphaRange');
      fixture.detectChanges();
      expect(input.value).toBe(String(component.gridInfo.colorStroke.a));
    });
  }));
  it('the alpha of grid should be set to mimimum by the input range', () => {
    setInputValue('#squareAlphaRange', String(component.MIN_TRANSPARENCY - 1));
    expect(component.gridInfo.colorStroke.a).toEqual(component.MIN_TRANSPARENCY);
  });
  it('the alpha of grid should be set to maximum by the input range', () => {
    setInputValue('#squareAlphaRange', String(component.MAX_TRANSPARENCY + 1));
    expect(component.gridInfo.colorStroke.a).toEqual(component.MAX_TRANSPARENCY);
  });

  it('the alpha of grid should be set to middle between max and min by the input range', () => {
    setInputValue('#squareAlphaRange', String((component.MAX_TRANSPARENCY + component.MIN_TRANSPARENCY) / 2));
    expect(component.gridInfo.colorStroke.a).toEqual((component.MAX_TRANSPARENCY + component.MIN_TRANSPARENCY) / 2);
  });

  // test du switch pour l'affiche ou pas de la grille
  it('the toShow switch should be set to the default value of the grid', waitForAsync(() => {
    fixture.whenStable().then(() => {
      const input = fixture.nativeElement.querySelector('#switchGrid');
      fixture.detectChanges();
      expect(input.checked).toBe(component.gridInfo.toShow);
    });
  }));
  it('the toShow switch should be set to false by the switch', () => {
    const input = fixture.nativeElement.querySelector('#switchGrid');
    input.value = false;
    fixture.detectChanges();
    expect(component.gridInfo.toShow).toBe(false);
  });

  // test si on entre g pour afficher la grille
});
