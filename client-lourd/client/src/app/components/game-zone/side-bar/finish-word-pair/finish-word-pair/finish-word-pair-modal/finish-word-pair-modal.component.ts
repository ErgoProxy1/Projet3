import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-finish-word-pair-modal',
  templateUrl: './finish-word-pair-modal.component.html',
  styleUrls: ['./finish-word-pair-modal.component.scss']
})
export class FinishWordPairModalComponent implements OnInit {

  drawMode = 0;
  panType = 0;
  centerType = 0;
  difficulty = 0;

  clues = '';
  parsedClues: string[] = [];

  word = '';

  constructor(private _activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  close() {
    let tempClues = this.clues.split(',');
    for (let clue of tempClues) {
      let clueToAdd = clue.trim().replace('\n', '');
      if (clueToAdd.length > 0) {
        this.parsedClues.push(clueToAdd);
      }
    }
    this._activeModal.close({ order: [this.drawMode, this.panType, this.centerType, this.difficulty], word: this.word, clues: this.parsedClues });
  }

  dismiss() {
    this._activeModal.dismiss();
  }

}
