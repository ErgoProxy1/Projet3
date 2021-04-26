import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishWordPairModalComponent } from './finish-word-pair-modal.component';

describe('FinishWordPairModalComponent', () => {
  let component: FinishWordPairModalComponent;
  let fixture: ComponentFixture<FinishWordPairModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinishWordPairModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinishWordPairModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
