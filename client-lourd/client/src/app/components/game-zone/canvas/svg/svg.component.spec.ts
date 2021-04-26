import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NTimesPipe } from 'src/app/pipes/n-times.pipe';
import { CanvasComponent } from '../canvas.component';
import { SvgComponent } from './svg.component';

describe('SvgComponent', () => {
  let component: SvgComponent;
  let fixture: ComponentFixture<SvgComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgComponent, CanvasComponent, NTimesPipe ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
