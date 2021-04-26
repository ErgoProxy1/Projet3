import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImagePairModalComponent } from './upload-image-pair-modal.component';

describe('UploadImagePairModalComponent', () => {
  let component: UploadImagePairModalComponent;
  let fixture: ComponentFixture<UploadImagePairModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadImagePairModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadImagePairModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
