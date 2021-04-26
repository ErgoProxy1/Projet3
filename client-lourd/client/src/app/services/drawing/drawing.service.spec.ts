import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanvasComponent } from 'src/app/components/game-zone/canvas/canvas.component';
import { SvgComponent } from 'src/app/components/game-zone/canvas/svg/svg.component';
import { NTimesPipe } from 'src/app/pipes/n-times.pipe';
//import { NewDrawingComponent } from '../../components/horizontal-menu/new-drawing/new-drawing.component';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CanvasComponent, SvgComponent, NTimesPipe],
      imports: [FormsModule, ReactiveFormsModule, HttpClientModule]})
    .compileComponents();
  });

  it('should be created', () => {
    const service: DrawingService = TestBed.inject(DrawingService);
    expect(service).toBeTruthy();
  });
});
