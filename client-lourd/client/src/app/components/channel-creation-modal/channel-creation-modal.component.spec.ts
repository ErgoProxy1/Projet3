import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelCreationModalComponent } from './channel-creation-modal.component';

describe('ChannelCreationModalComponent', () => {
  let component: ChannelCreationModalComponent;
  let fixture: ComponentFixture<ChannelCreationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChannelCreationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
