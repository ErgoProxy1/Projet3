import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImageForPairComponent } from './upload-image-for-pair.component';

describe('UploadImageForPairComponent', () => {
  let component: UploadImageForPairComponent;
  let fixture: ComponentFixture<UploadImageForPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadImageForPairComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadImageForPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
