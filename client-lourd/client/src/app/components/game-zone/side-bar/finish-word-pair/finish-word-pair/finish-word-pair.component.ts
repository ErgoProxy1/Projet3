import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { Path } from 'src/app/services/svgPrimitives/path/path';
import { Point } from 'src/app/services/utils/point';
import { FinishWordPairModalComponent } from './finish-word-pair-modal/finish-word-pair-modal.component';
import { AngularFirestore } from '@angular/fire/firestore'
import { AuthService } from 'src/app/services/authService/auth.service';
import { MessageHandlerService } from 'src/app/services/messageHandler/message-handler.service';
import { MessageType } from 'src/app/services/utils/constantsAndEnums';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';


@Component({
  selector: 'app-finish-word-pair',
  templateUrl: './finish-word-pair.component.html',
  styleUrls: ['./finish-word-pair.component.scss']
})
export class FinishWordPairComponent implements OnInit, OnDestroy {

  @Input() innerWidth: number;
  @Input() click: Observable<void>;

  @ViewChild('imgInput') imgInput: ElementRef;

  clickSubscription: Subscription;

  constructor(
    public controller: CanvasControllerService,
    private _modal: NgbModal,
    private _db: AngularFirestore,
    private _auth: AuthService,
    private _message: MessageHandlerService,
    private _keyboard: KeyboardService
  ) { }

  ngOnInit(): void {
    this.clickSubscription = this.click.subscribe(() => {
      const modal = this._modal.open(FinishWordPairModalComponent, { backdrop: 'static', centered: true, keyboard: false, size: 'md' });
      this._keyboard.modalWindowActive = true;
      this._keyboard.inputFocusedActive = true;
      modal.result.then(async (result) => {
        this._keyboard.modalWindowActive = false;
        this._keyboard.inputFocusedActive = false;
        let orderedShapes = await this.reorder(result.order);
        let shapesData = JSON.stringify(orderedShapes);
        if ((encodeURI(shapesData).split(/%..|./).length - 1) <= 950000) {
          this._db.firestore.collection('pairs_data').add({shapes: shapesData}).then((doc) => {
            let data = { 
              username: this._auth.username, 
              word: result.word, data: doc.id, 
              difficulty: result.order[3], 
              bg: JSON.stringify(this.controller.canvasInfo.color),
              hints: result.clues
            }
            this._db.collection('word_image_pairs').add(data).catch((e) => { console.log(e) })  
          }).catch((e) => { console.log(e) })
        } else {
          this._message.showMessage('Votre dessin est trop large pour être stocker (Plus que 1MB). Veuillez réduire sa taille.', MessageType.Danger, 4000, true)
        }
      }).catch(() => {
        this._keyboard.modalWindowActive = false;
        this._keyboard.inputFocusedActive = false;
      })
    })
  }

  ngOnDestroy() {
    this.clickSubscription.unsubscribe();
  }

  async reorder(modes: number[]) {
    let order: number[] = [];
    if (modes[0] === 1) {
      order = await this.drawRandom(this.controller.svgPrimitives.map(p => (p as Path).points));
    } else if (modes[0] === 2) {
      if (modes[1] === 0) {
        order = await this.drawPanLeftRight(this.controller.svgPrimitives.map(p => (p as Path).points));
      } else if (modes[1] === 1) {
        order = await this.drawPanRightLeft(this.controller.svgPrimitives.map(p => (p as Path).points));
      } else if (modes[1] === 2) {
        order = await this.drawPanTopBottom(this.controller.svgPrimitives.map(p => (p as Path).points));
      } else if (modes[1] === 3) {
        order = await this.drawPanBottomTop(this.controller.svgPrimitives.map(p => (p as Path).points));
      }
    } else if (modes[0] === 3) {
      if (modes[2] === 0) {
        order = await this.drawTowardCenter(this.controller.svgPrimitives.map(p => (p as Path).points));
      } else if (modes[2] === 1) {
        order = await this.drawFromCenter(this.controller.svgPrimitives.map(p => (p as Path).points));
      }
    }
    let orderedShapes = [];
    if (modes[0] !== 0) {
      for (let i of order) {
        let curShape = this.controller.svgPrimitives[i] as Path;
        orderedShapes.push({ color: curShape.strokeColor, width: curShape.strokeWidth, path: curShape.commandSvg })
      }
    } else {
      for (let shape of this.controller.svgPrimitives) {
        let curShape = shape as Path;
        orderedShapes.push({ color: curShape.strokeColor, width: curShape.strokeWidth, path: curShape.commandSvg })
      }
    }
    return orderedShapes;
  }

  async drawPanLeftRight(shapes: Point[][]) {
    let orderedShapes: Point[][] = [];
    let indexOrder: number[] = [];
    while (indexOrder.length !== shapes.length) {
      let minX = -1;
      let minIndex = -1;
      for (let i = 0; i < shapes.length; i++) {
        if (!indexOrder.includes(i)) {
          let curMin = Math.min(...shapes[i].map(s => s.x))
          if (minX === -1) {
            minX = curMin;
            minIndex = i;
          } else if (curMin < minX) {
            minX = curMin;
            minIndex = i;
          }
        }
      }
      indexOrder.push(minIndex);
      orderedShapes.push(shapes[minIndex])
    }
    return indexOrder;
  }

  async drawPanRightLeft(shapes: Point[][]) {
    let orderedShapes: Point[][] = [];
    let indexOrder: number[] = [];
    while (indexOrder.length !== shapes.length) {
      let maxX = -1;
      let maxIndex = -1;
      for (let i = 0; i < shapes.length; i++) {
        if (!indexOrder.includes(i)) {
          let curmax = Math.max(...shapes[i].map(s => s.x))
          if (maxX === -1) {
            maxX = curmax;
            maxIndex = i;
          } else if (curmax > maxX) {
            maxX = curmax;
            maxIndex = i;
          }
        }
      }
      indexOrder.push(maxIndex);
      orderedShapes.push(shapes[maxIndex])
    }
    return indexOrder;
  }

  async drawPanTopBottom(shapes: Point[][]) {
    let orderedShapes: Point[][] = [];
    let indexOrder: number[] = [];
    while (indexOrder.length !== shapes.length) {
      let minY = -1;
      let minIndex = -1;
      for (let i = 0; i < shapes.length; i++) {
        if (!indexOrder.includes(i)) {
          let curMin = Math.min(...shapes[i].map(s => s.y))
          if (minY === -1) {
            minY = curMin;
            minIndex = i;
          } else if (curMin < minY) {
            minY = curMin;
            minIndex = i;
          }
        }
      }
      indexOrder.push(minIndex);
      orderedShapes.push(shapes[minIndex])
    }
    return indexOrder;
  }

  async drawPanBottomTop(shapes: Point[][]) {
    let orderedShapes: Point[][] = [];
    let indexOrder: number[] = [];
    while (indexOrder.length !== shapes.length) {
      let maxY = -1;
      let maxIndex = -1;
      for (let i = 0; i < shapes.length; i++) {
        if (!indexOrder.includes(i)) {
          let curmax = Math.max(...shapes[i].map(s => s.y))
          if (maxY === -1) {
            maxY = curmax;
            maxIndex = i;
          } else if (curmax > maxY) {
            maxY = curmax;
            maxIndex = i;
          }
        }
      }
      indexOrder.push(maxIndex);
      orderedShapes.push(shapes[maxIndex])
    }
    return indexOrder;
  }

  async drawFromCenter(shapes: Point[][]) {
    let orderedShapes: Point[][] = [];
    let indexOrder: number[] = [];
    while (indexOrder.length !== shapes.length) {
      let minDist = -1;
      let minIndex = -1;
      for (let i = 0; i < shapes.length; i++) {
        if (!indexOrder.includes(i)) {
          let curmin = Math.min(...shapes[i].map(s => Math.sqrt(Math.pow(400 - s.x, 2) + Math.pow(300 - s.y, 2))))
          if (minDist === -1) {
            minDist = curmin;
            minIndex = i;
          } else if (curmin < minDist) {
            minDist = curmin;
            minIndex = i;
          }
        }
      }
      indexOrder.push(minIndex);
      orderedShapes.push(shapes[minIndex])
    }
    return indexOrder;
  }

  async drawTowardCenter(shapes: Point[][]) {
    let orderedShapes: Point[][] = [];
    let indexOrder: number[] = [];
    while (indexOrder.length !== shapes.length) {
      let maxDist = -1;
      let maxIndex = -1;
      for (let i = 0; i < shapes.length; i++) {
        if (!indexOrder.includes(i)) {
          let curmax = Math.max(...shapes[i].map(s => Math.sqrt(Math.pow(400 - s.x, 2) + Math.pow(300 - s.y, 2))))
          if (maxDist === -1) {
            maxDist = curmax;
            maxIndex = i;
          } else if (curmax > maxDist) {
            maxDist = curmax;
            maxIndex = i;
          }
        }
      }
      indexOrder.push(maxIndex);
      orderedShapes.push(shapes[maxIndex])
    }
    return indexOrder;
  }

  async drawRandom(shapes: Point[][]) {
    let indexOrder: number[] = [];
    for (let i = 0; i < shapes.length; i++) {
      indexOrder.push(i);
    }
    var currentIndex = indexOrder.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = indexOrder[currentIndex];
      indexOrder[currentIndex] = indexOrder[randomIndex];
      indexOrder[randomIndex] = temporaryValue;
    }

    return indexOrder;
  }

}
