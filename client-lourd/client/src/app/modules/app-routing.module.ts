import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutingConstants } from '../services/utils/routingConstants';
import { MainMenuComponent } from '../components/main-menu/main-menu.component';
import { GameZoneComponent } from '../components/game-zone/game-zone.component';
import { GameSetupComponent } from '../components/game-setup/game-setup.component';
import { LoginMenuComponent } from '../components/login-menu/login-menu.component';
import { PencilPropertiesComponent } from '../components/game-zone/properties-bar/properties-menu/pencil-properties/pencil-properties.component';
import { GridPropertiesComponent } from '../components/game-zone/properties-bar/properties-menu/grid-properties/grid-properties.component';
import { EraserPropertiesComponent } from '../components/game-zone/properties-bar/properties-menu/eraser-properties/eraser-properties.component';
import { ChatComponent } from '../components/game-zone/right-aside/chat/chat.component';
import { UserProfileComponent } from '../components/user-profile/user-profile.component';
import { LobbySelectionComponent } from '../components/lobby-selection/lobby-selection.component';
import { LobbyComponent } from '../components/lobby/lobby.component';
import { SocialMenuComponent } from '../components/social-menu/social-menu.component';

const appRoutes: Routes = [
  { path: '', redirectTo: RoutingConstants.ROUTE_TO_LOGIN, pathMatch: 'full' },
  {
    path: RoutingConstants.ROUTE_TO_GAME_ZONE, component: GameZoneComponent, children: [
      { path: RoutingConstants.ROUTE_TO_PENCIL, component: PencilPropertiesComponent },
      { path: RoutingConstants.ROUTE_TO_GRID, component: GridPropertiesComponent },
      { path: RoutingConstants.ROUTE_TO_ERASER, component: EraserPropertiesComponent },
    ]
  },
  { path: RoutingConstants.ROUTE_TO_LOGIN, component: LoginMenuComponent },
  { path: RoutingConstants.ROUTE_TO_MAIN_MENU, component: MainMenuComponent },
  { path: RoutingConstants.ROUTE_TO_CHAT_WINDOW, component: ChatComponent},
  { path: RoutingConstants.ROUTE_TO_PROFILE, component: UserProfileComponent},
  { path: RoutingConstants.ROUTE_TO_GAME_SETEUP, component: GameSetupComponent},
  { path: RoutingConstants.ROUTE_TO_SELECT_GAME, component: LobbySelectionComponent},
  { path: RoutingConstants.ROUTE_TO_GAME_LOBBY, component: LobbyComponent},
  { path: RoutingConstants.ROUTE_TO_SOCIAL, component: SocialMenuComponent},
  { path: '**', redirectTo: RoutingConstants.ROUTE_TO_LOGIN },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})

export class AppRoutingModule { }
