import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from './components/app/app.component';
import { CanvasComponent } from './components/game-zone/canvas/canvas.component';
import { SvgComponent } from './components/game-zone/canvas/svg/svg.component';
import { HorizontalMenuComponent } from './components/game-zone/horizontal-menu/horizontal-menu.component';
// tslint:disable-next-line
import { AppRoutingModule } from './modules/app-routing.module';
import { NTimesPipe } from './pipes/n-times.pipe';
import { TrustPipe } from './pipes/trust-html.pipe';
import { GameZoneComponent } from './components/game-zone/game-zone.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { ColorToolComponent } from './components/game-zone/properties-bar/color-tool/color-tool.component';
import { WelcomeMessageComponent } from './components/game-zone/welcome-message/welcome-message.component';
import { SideBarComponent } from './components/game-zone/side-bar/side-bar.component';
import { PencilButtonComponent } from './components/game-zone/side-bar/icones/pencil-button/pencil-button.component';
import { PropertiesBarComponent } from './components/game-zone/properties-bar/properties-bar.component';
import { PencilPropertiesComponent } from './components/game-zone/properties-bar/properties-menu/pencil-properties/pencil-properties.component';
import { GridButtonComponent } from './components/game-zone/side-bar/icones/grid-button/grid-button.component';
import { GridPropertiesComponent } from './components/game-zone/properties-bar/properties-menu/grid-properties/grid-properties.component';
import { UndoComponent } from './components/game-zone/side-bar/undo/undo.component';
import { RedoComponent } from './components/game-zone/side-bar/redo/redo.component';
import { EraserPropertiesComponent } from './components/game-zone/properties-bar/properties-menu/eraser-properties/eraser-properties.component';
import { EraserButtonComponent } from './components/game-zone/side-bar/icones/eraser-button/eraser-button.component';
import { RightAsideComponent } from './components/game-zone/right-aside/right-aside.component';
import { ChatComponent } from './components/game-zone/right-aside/chat/chat.component';
import { LoginMenuComponent } from './components/login-menu/login-menu.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SocialMenuComponent } from './components/social-menu/social-menu.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { GameSetupComponent } from './components/game-setup/game-setup.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AvatarConvertComponent } from './components/game-zone/side-bar/avatar-convert/avatar-convert.component';
import { AvatarSelectionComponent } from './components/user-profile/avatar-selection/avatar-selection.component';
import { ChannelCreationModalComponent } from './components/channel-creation-modal/channel-creation-modal.component'
import { LobbySelectionComponent } from './components/lobby-selection/lobby-selection.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { ChannelModalComponent } from './components/channel-modal/channel-modal.component';
import { AvatarMenuComponent } from './components/avatar-menu/avatar-menu.component';
import { GuesserComponent } from './components/game-zone/properties-bar/guesser/guesser.component';
import { PlayersListComponent } from './components/game-zone/right-aside/players-list/players-list.component';
import { UploadImageForPairComponent } from './components/game-zone/side-bar/upload-image-pair/upload-image-for-pair/upload-image-for-pair.component';
import { FinishWordPairComponent } from './components/game-zone/side-bar/finish-word-pair/finish-word-pair/finish-word-pair.component';
import { FinishWordPairModalComponent } from './components/game-zone/side-bar/finish-word-pair/finish-word-pair/finish-word-pair-modal/finish-word-pair-modal.component';
import { UploadImagePairModalComponent } from './components/game-zone/side-bar/upload-image-pair/upload-image-pair-modal/upload-image-pair-modal.component';
import { WordSuggestionComponent } from './components/word-suggestion/word-suggestion.component';
import { HintsComponent } from './components/hints/hints.component';
import { AddFriendModalComponent } from './components/social-menu/add-friend-modal/add-friend-modal.component';
import { EndScreenComponent } from './components/game-zone/end-screen/end-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    ColorToolComponent,
    WelcomeMessageComponent,
    SideBarComponent,
    PencilButtonComponent,
    PropertiesBarComponent,
    PencilPropertiesComponent,
    HorizontalMenuComponent,
    NTimesPipe,
    GridButtonComponent,
    GridPropertiesComponent,
    TrustPipe,
    UndoComponent,
    RedoComponent,
    EraserPropertiesComponent,
    EraserButtonComponent,
    SvgComponent,
    GameZoneComponent,
    MainMenuComponent,
    RightAsideComponent,
    ChatComponent,
    LoginMenuComponent,
    UserProfileComponent,
    SocialMenuComponent,
    ConfirmationModalComponent,
    GameSetupComponent,
    AvatarConvertComponent,
    AvatarSelectionComponent,
    ChannelCreationModalComponent,
    LobbySelectionComponent,
    LobbyComponent,
    ChannelModalComponent,
    AvatarMenuComponent,
    GuesserComponent,
    PlayersListComponent,
    UploadImageForPairComponent,
    FinishWordPairComponent,
    FinishWordPairModalComponent,
    UploadImagePairModalComponent,
    WordSuggestionComponent,
    HintsComponent,
    AddFriendModalComponent,
    EndScreenComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgbModule,
    FontAwesomeModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
