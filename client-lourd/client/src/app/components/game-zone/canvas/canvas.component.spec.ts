// tslint:disable: no-string-literal
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NTimesPipe } from 'src/app/pipes/n-times.pipe';
import { Color } from 'src/app/services/utils/color';
import { CanvasComponent } from './canvas.component';
import { SvgComponent } from './svg/svg.component';

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CanvasComponent, NTimesPipe, SvgComponent],
      imports: [HttpClientModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(component.canvasWidth).toBe(0);
    expect(component.canvasHeight).toBe(0);

    expect(component.canvasBackground).toBe('rgba(255,255,255,1)');
  });

  it('#defineDimensions should change the canvas widht and height to the given values', () => {
    let width = 150;
    let height = 200;

    component.defineDimensions(width, height);
    expect(component.canvasWidth).toEqual(150);
    expect(component.canvasHeight).toEqual(200);

    width = -100;
    expect(() => {
      component.defineDimensions(width, height);
    }).toThrowError('Canvas width and height must be positive.');

    height = -300;
    expect(() => {
      component.defineDimensions(width, height);
    }).toThrowError('Canvas width and height must be positive.');

    width = height = -1;
    expect(() => {
      component.defineDimensions(width, height);
    }).toThrowError('Canvas width and height must be positive.');
  });

  it('#defineBackgroundColor should change the background color to the given value', () => {
    const color = new Color(200, 250, 120, 1);
    component.defineBackgroundColor(color);
    expect(component.canvasBackground).toEqual('rgba(200,250,120,1)');
  });

  it('#clearCanvas should clear the canvas', () => {
    component.clearCanvas();
    expect(component['controller'].primitivesToDraw.length).toEqual(0);
  });

  it('#mouseMoveOnCanvas should update the primitives attribute', () => {
    const initialPrimitives = component['controller'].primitivesToDraw;
    spyOn(component, 'mouseMoveOnCanvas');
    const primSize = component['controller'].primitivesToDraw.length;
    component.mouseMoveOnCanvas(new PointerEvent('MouseMove'));
    expect(component['controller'].primitivesToDraw.length).toBeGreaterThanOrEqual(initialPrimitives.length);
    expect(component['controller'].primitivesToDraw[primSize - 1]).toEqual(initialPrimitives[primSize - 1]);
    expect(component['controller'].primitivesToDraw[primSize]).toBeUndefined();
  });

  it('#clickOnCanvas should select the primitives with a leftClick', () => {
    const initialPrimitives = component['controller'].primitivesToDraw;
    spyOn(component, 'clickOnCanvas');
    const primitive = component['controller'].primitivesToDraw[0];
    component.clickOnCanvas(new MouseEvent('leftClick'), primitive);
    expect(component['controller'].primitivesToDraw[0]).toEqual(primitive);
    expect(component['controller'].primitivesToDraw).toEqual(initialPrimitives);
  });

  it('#clickOnCanvas should unselect the current primitive with a rightClick', () => {
    const initialPrimitives = component['controller'].primitivesToDraw;
    spyOn(component, 'clickOnCanvas');
    const primitive = component['controller'].primitivesToDraw[0];
    component.clickOnCanvas(new MouseEvent('rightClick'), primitive);
    expect(component['controller'].primitivesToDraw[0]).toEqual(primitive);
    expect(component['controller'].primitivesToDraw.length).toEqual(initialPrimitives.length);
  });

});
