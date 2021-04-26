import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/authService/auth.service';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { Path } from 'src/app/services/svgPrimitives/path/path';
//@ts-ignore
import * as confetti from 'canvas-confetti';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { MIN_ERASER_SIZE, PENCIL_DEFAULT_STROKE_WIDTH, PrimitiveType, ToolType } from 'src/app/services/utils/constantsAndEnums';
import { EraserTool } from 'src/app/services/tools/eraserTool';
import { Color } from 'src/app/services/utils/color';
import { ColorService } from 'src/app/services/colorService/color.service';
import { ChatService } from 'src/app/services/chatService/chat.service';
import { BOTS_LIST } from 'src/app/services/utils/bots';

const confettiHandler = confetti.create(undefined, { useWorker: true, resize: true });

export interface TurnRecap {
  playerWhoDraw: string;
  word: string;
  round: number;
  playersWhoGuess: string[];
  svg: any[];
  backgroundColor: Color;
}

@Component({
  selector: 'app-end-screen',
  templateUrl: './end-screen.component.html',
  styleUrls: ['./end-screen.component.scss']
})
export class EndScreenComponent implements OnInit, OnDestroy {
  winners: string[] = [];
  users: string[] = [];
  tableSVG: Path[][][] = [];
  tableIdFoundByPlayer: String[][] = [];
  tableWordDraw: String[][] = [];
  tableBgColors: string[][] = [];
  isLoad: boolean = false;

  recapSub: Subscription;

  constructor(
    private router: Router,
    private socket: SocketService,
    private gameService: GameService,
    private _auth: AuthService,
    private _tools: ToolsService,
    private _canvasController: CanvasControllerService,
    private _tutorial: TutorialService,
    private _colors: ColorService,
    private _chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.winners = this.gameService.winnerUsers;
    this.users = this.gameService.users;
    let isBotPresent = this.gameService.users.includes(BOTS_LIST[0].name) || this.gameService.users.includes(BOTS_LIST[1].name) || this.gameService.users.includes(BOTS_LIST[2].name);
    console.log('bots', isBotPresent)
    for (let indexRound = 0; indexRound < ((this.gameService.gameMode === 0) ? (isBotPresent ? 8 : 4) : 3); indexRound++) {
      this.tableWordDraw[indexRound] = [];
      for (let indexPlayer = 0; indexPlayer < this.gameService.users.length; indexPlayer++) {
        this.tableWordDraw[indexRound].push("Aucun");
      }
    }

    this.recapSub = this.socket.recapGameObservable.subscribe((data: string) => {
      const turnsRecap: TurnRecap[] = JSON.parse(data) as TurnRecap[];
      console.log(turnsRecap);
      this.gameService.users.forEach(() => this.tableIdFoundByPlayer.push([]));
      for (let indexRound = 0; indexRound < ((this.gameService.gameMode === 0) ? (isBotPresent ? 8 : 4) : 3); indexRound++) {
        this.tableSVG[indexRound] = [];
        this.tableBgColors[indexRound] = [];
        this.gameService.users.forEach(() => {
          this.tableSVG[indexRound].push([]);
          this.tableBgColors[indexRound].push(this._colors.convertRgbToHex(Color.WHITE, true));
        });
        for (let indexPlayer = 0; indexPlayer < this.gameService.users.length; indexPlayer++) {
          let adjustedIndex = isBotPresent ? Math.ceil((indexRound + 1) / 2) : indexRound + 1;
          const recap: TurnRecap = turnsRecap.filter(recap => recap.round === (adjustedIndex) && recap.playerWhoDraw === this.gameService.users[indexPlayer])[isBotPresent ? indexRound % 2 : 0];
          if (recap) {
            let paths: Path[] = [];
            for (let element of recap.svg) {
              let curColor = new Color(element.strokeColor.r, element.strokeColor.g, element.strokeColor.b, element.strokeColor.a)
              let curPath = new Path(curColor, element.strokeWidth, PrimitiveType.Pencil);
              curPath.commandSvg = element.commandSvg;
              paths.push(curPath);
            }
            this.tableSVG[indexRound][indexPlayer] = paths;
            let bgColor = Color.copyColor(new Color(recap.backgroundColor.r, recap.backgroundColor.g, recap.backgroundColor.b, recap.backgroundColor.a));
            this.tableBgColors[indexRound][indexPlayer] = bgColor.rgbaTextForm;
            this.tableWordDraw[indexRound][indexPlayer] = recap.word;
            for (var i: number = 0; i < recap.playersWhoGuess.length; i++) {
              const indexPLayerWhoFind: number = this.users.findIndex((user: string) => user === recap.playersWhoGuess[i])
              if (this.tableIdFoundByPlayer[indexPLayerWhoFind]) {
                this.tableIdFoundByPlayer[indexPLayerWhoFind].push(indexRound.toString() + indexPlayer.toString());
              }
            }
          }
        }
      }
      this.isLoad = true;
    });

    if (this.winners.includes(this._auth.username)) {
      setTimeout(() => {
        confetti();
      }, 1);

      setTimeout(() => {
        confettiHandler({
          angle: 90,
          spread: 60,
          particleCount: 350,
          ticks: 400
        });
      }, 1);

      let wow = new Audio();
      wow.src = 'assets/sounds/crowd_wow.mp3';
      let claps = new Audio();
      claps.src = 'assets/sounds/applause.mp3';
      wow.volume = 0.15;
      claps.volume = 0.25;
      wow.load();
      wow.play();
      claps.load();
      claps.play();
    }
  }

  ngOnDestroy() {
    this.recapSub.unsubscribe();
  }

  curSelectedGuesser = -1;
  manageWordGuessBy(indexPlayer: number): void {
    if (indexPlayer === this.curSelectedGuesser) {
      this.curSelectedGuesser = -1;
    } else {
      if (this.curSelectedGuesser !== -1) {
        this.tableIdFoundByPlayer[this.curSelectedGuesser].forEach((divId: string) => {
          const cellRecap: HTMLElement | null = document.getElementById(divId);
          if (cellRecap) {
            cellRecap.style.border = "1px solid white";
          }
        });
      }
      this.curSelectedGuesser = indexPlayer;
    }
    this.tableIdFoundByPlayer[indexPlayer].forEach((divId: string) => {
      const cellRecap: HTMLElement | null = document.getElementById(divId);
      if (cellRecap) {
        cellRecap.style.border = (this.curSelectedGuesser !== -1) ? "2px groove yellow" : "1px solid white";
      }
    });
  }

  goesToMenu() {
    if (this.gameService.gameId.length > 0) this.socket.emit('leaveTheGame', JSON.stringify({ gameId: this.gameService.gameId, user: this._auth.username }))
    this.clearGameState();
    this.router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
  }

  clearGameState() {
    this.gameService.gameId = '';
    this._chatService.savedChannels = [];
    this._chatService.savedJoinedChannels = [];
    this._canvasController.clearSVGElements();
    this._canvasController.clearToolDate();
    this._tools.showGrid(false);
    this._tools.pencilWidth = PENCIL_DEFAULT_STROKE_WIDTH;
    (this._tools.TOOLS.get(ToolType.Eraser) as EraserTool).sizeOfSquare(MIN_ERASER_SIZE);
    if (this._tutorial.curState !== -1) this._tutorial.end();
  }
}
