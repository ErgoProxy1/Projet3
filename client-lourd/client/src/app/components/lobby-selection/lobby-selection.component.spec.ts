import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbySelectionComponent } from './lobby-selection.component';

describe('LobbySelectionComponent', () => {
  let component: LobbySelectionComponent;
  let fixture: ComponentFixture<LobbySelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LobbySelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
