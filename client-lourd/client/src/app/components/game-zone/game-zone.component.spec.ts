import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameZoneComponent } from './game-zone.component';

describe('GameZoneComponent', () => {
  let component: GameZoneComponent;
  let fixture: ComponentFixture<GameZoneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
