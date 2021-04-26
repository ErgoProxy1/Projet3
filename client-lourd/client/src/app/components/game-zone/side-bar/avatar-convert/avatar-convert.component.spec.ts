import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarConvertComponent } from './avatar-convert.component';

describe('AvatarConvertComponent', () => {
  let component: AvatarConvertComponent;
  let fixture: ComponentFixture<AvatarConvertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvatarConvertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarConvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
