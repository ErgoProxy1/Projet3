import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/authService/auth.service';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { KeyboardShortcutType } from 'src/app/services/utils/constantsAndEnums';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, OnDestroy {
  keyboardSubscription: Subscription;

  undoSubject: Subject<void> = new Subject<void>();
  redoSubject: Subject<void> = new Subject<void>();
  avatarSetSubject: Subject<void> = new Subject<void>();
  uploadImageSubject: Subject<void> = new Subject<void>();
  finishPairSubject: Subject<void> = new Subject<void>();


  innerWidth: number

  readonly _ROUTE_TO_PENCIL: string = RoutingConstants.ROUTE_TO_PENCIL;
  readonly _ROUTE_TO_GRID: string = RoutingConstants.ROUTE_TO_GRID;
  readonly _ROUTE_TO_ERASER: string = RoutingConstants.ROUTE_TO_ERASER;
  readonly _ROUTE_TO_GAME_ZONE: string= RoutingConstants.ROUTE_TO_GAME_ZONE;

  readonly ROUTEMAP: Map<KeyboardShortcutType, string> = new Map([
    [KeyboardShortcutType.Pencil, 'game-zone/' + this._ROUTE_TO_PENCIL],
    [KeyboardShortcutType.Eraser, 'game-zone/' + this._ROUTE_TO_ERASER],
  ]);

  constructor(
    private keyboardService: KeyboardService,
    private router: Router,
    public auth: AuthService,
    public game: GameService,
    public tutorial: TutorialService
  ) {
    this.keyboardSubscription = this.keyboardService.getKeyboardShortcutType().subscribe((keyboardShortcut: KeyboardShortcutType) => {
      const url: string | undefined = this.ROUTEMAP.get(keyboardShortcut);
      if (url) {
        if (auth.username === game.curDrawer || tutorial.hasStarted() || game.gameId.length === 0) this.router.navigateByUrl(url);
      }
    });
  }

  ngOnInit() {
    this.innerWidth = window.innerWidth;
  }

  ngOnDestroy() {
    this.keyboardSubscription.unsubscribe();
    this.undoSubject.unsubscribe();
    this.redoSubject.unsubscribe();
    this.avatarSetSubject.unsubscribe();
    this.finishPairSubject.unsubscribe();
    this.uploadImageSubject.unsubscribe();
  }

  routeToPencil(isCurDrawer: boolean){
    if(isCurDrawer) this.router.navigateByUrl(this._ROUTE_TO_GAME_ZONE + '/' + this._ROUTE_TO_PENCIL);
  }

  routeToEraser(isCurDrawer: boolean){
    if(isCurDrawer) this.router.navigateByUrl(this._ROUTE_TO_GAME_ZONE + '/' + this._ROUTE_TO_ERASER);
  }

  routeToGrid(isCurDrawer: boolean){
    if(isCurDrawer) this.router.navigateByUrl(this._ROUTE_TO_GAME_ZONE + '/' + this._ROUTE_TO_GRID);
  }

  getIsToolSelected(tool: string){
    if(tool === 'pencil') {
      return this.router.url.includes(this._ROUTE_TO_PENCIL)
    } else if(tool === 'eraser'){
      return this.router.url.includes(this._ROUTE_TO_ERASER)
    } else if(tool === 'grid'){
      return this.router.url.includes(this._ROUTE_TO_GRID)
    }
    return false;
  }

  @HostListener('window:resize')
  onResize() {
    this.innerWidth = window.innerWidth;
  }
}
