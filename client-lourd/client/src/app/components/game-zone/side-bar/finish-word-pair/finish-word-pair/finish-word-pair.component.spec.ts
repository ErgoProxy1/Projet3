import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishWordPairComponent } from './finish-word-pair.component';

describe('FinishWordPairComponent', () => {
  let component: FinishWordPairComponent;
  let fixture: ComponentFixture<FinishWordPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinishWordPairComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinishWordPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
