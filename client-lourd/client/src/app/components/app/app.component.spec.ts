import { HttpClientModule } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlertModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { NTimesPipe } from 'src/app/pipes/n-times.pipe';
import { TrustPipe } from 'src/app/pipes/trust-html.pipe';

// tslint:disable-next-line
import { AppComponent } from './app.component';
import { LoginMenuComponent } from '../login-menu/login-menu.component';
import { CanvasComponent } from '../game-zone/canvas/canvas.component';
import { WelcomeMessageComponent } from '../game-zone/welcome-message/welcome-message.component';
import { SideBarComponent } from '../game-zone/side-bar/side-bar.component';
import { GridButtonComponent } from '../game-zone/side-bar/icones/grid-button/grid-button.component';
import { PropertiesBarComponent } from '../game-zone/properties-bar/properties-bar.component';
import { PencilPropertiesComponent } from '../game-zone/properties-bar/properties-menu/pencil-properties/pencil-properties.component';
import { HorizontalMenuComponent } from '../game-zone/horizontal-menu/horizontal-menu.component';
import { ColorToolComponent } from '../game-zone/properties-bar/color-tool/color-tool.component';
import { RedoComponent } from '../game-zone/side-bar/redo/redo.component';
import { UndoComponent } from '../game-zone/side-bar/undo/undo.component';
import { EraserButtonComponent } from '../game-zone/side-bar/icones/eraser-button/eraser-button.component';
import { EraserPropertiesComponent } from '../game-zone/properties-bar/properties-menu/eraser-properties/eraser-properties.component';
import { SvgComponent } from '../game-zone/canvas/svg/svg.component';

describe('AppComponent', () => {
  beforeEach(() => {
    // empty
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        FontAwesomeModule,
        FormsModule,
        ReactiveFormsModule,
        NgbAlertModule,
        NgbTypeaheadModule,
      ],
      declarations: [
        AppComponent,
        CanvasComponent,
        WelcomeMessageComponent,
        SideBarComponent,
        GridButtonComponent,
        PropertiesBarComponent,
        PencilPropertiesComponent,
        HorizontalMenuComponent,
        ColorToolComponent,
        NTimesPipe,
        RedoComponent,
        UndoComponent,
        TrustPipe,
        EraserButtonComponent,
        EraserPropertiesComponent,
        SvgComponent,
        LoginMenuComponent
      ],
      providers: [
        CookieService,
        HttpClientModule,
      ],
    });
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'PolyDessin'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.TITLE).toEqual('PolyDessin');
  });
});
