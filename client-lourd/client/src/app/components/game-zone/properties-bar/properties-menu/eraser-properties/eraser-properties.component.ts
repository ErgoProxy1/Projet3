import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EraserTool } from 'src/app/services/tools/eraserTool';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { MAX_ERASER_SIZE, MIN_ERASER_SIZE, ToolType } from 'src/app/services/utils/constantsAndEnums';

@Component({
  selector: 'app-eraser-properties',
  templateUrl: './eraser-properties.component.html',
  styleUrls: ['./eraser-properties.component.scss'],
})
export class EraserPropertiesComponent implements OnInit, OnDestroy {

  private selectedToolSubscription: Subscription;
  eraserTool: EraserTool;
  currentSize: number;
  readonly _MIN_ERASER_SIZE = MIN_ERASER_SIZE;
  readonly _MAX_ERASER_SIZE = MAX_ERASER_SIZE;
  constructor(
    private toolsService: ToolsService,
    private _tutorial: TutorialService
  ) {
  }

  ngOnInit(): void {
    this.selectedToolSubscription = this.toolsService.subscribeToToolChanged().subscribe((toolSelected) => {
      this.eraserTool = toolSelected as EraserTool;
      this.currentSize = this.eraserTool.sizeOfSquare();
    });
    if (this._tutorial.curState === 4) {
      this._tutorial.nextStep();
    }
    this.toolsService.newToolSelected(ToolType.Eraser);
  }

  ngOnDestroy(): void {
    this.selectedToolSubscription.unsubscribe();
  }
  onChangeSize(): void {
    if (this.currentSize > MAX_ERASER_SIZE) {
      this.currentSize = MAX_ERASER_SIZE;
    } else if (this.currentSize < MIN_ERASER_SIZE) {
      this.currentSize = MIN_ERASER_SIZE;
    }
    this.eraserTool.sizeOfSquare(this.currentSize);
  }

}
