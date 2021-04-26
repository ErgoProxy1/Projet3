import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { TrustPipe } from 'src/app/pipes/trust-html.pipe';
import { HorizontalMenuComponent } from './horizontal-menu.component';
import { RedoComponent } from '../side-bar/redo/redo.component';
import { UndoComponent } from '../side-bar/undo/undo.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('HorizontalMenuComponent', () => {
  let component: HorizontalMenuComponent;
  let fixture: ComponentFixture<HorizontalMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations:
      [ HorizontalMenuComponent,
        TrustPipe,
        UndoComponent,
        RedoComponent,
      ],
      imports: [ FormsModule, ReactiveFormsModule, NgbAlertModule, NgbTypeaheadModule, HttpClientModule, RouterTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
