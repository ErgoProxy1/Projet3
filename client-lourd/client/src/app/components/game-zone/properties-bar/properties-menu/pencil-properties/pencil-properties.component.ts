import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PencilTool } from 'src/app/services/tools/pencilTool';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { MAX_STROKE_WIDTH, MIN_STROKE_WIDTH, ToolType } from 'src/app/services/utils/constantsAndEnums';

@Component({
  selector: 'app-pencil-properties',
  templateUrl: './pencil-properties.component.html',
  styleUrls: ['./pencil-properties.component.scss'],
})
export class PencilPropertiesComponent implements OnInit, OnDestroy {
  readonly MAX_STROKE = MAX_STROKE_WIDTH;
  readonly MIN_STROKE = MIN_STROKE_WIDTH;
  private selectedToolSubscription: Subscription;
  strokeWidth: number;
  pencil: PencilTool;

  constructor(
    private toolsService: ToolsService,
    private _tutorial: TutorialService
  ) {
  }

  ngOnInit(): void {
    this.selectedToolSubscription = this.toolsService.subscribeToToolChanged().subscribe((toolSelected) => {
      this.pencil = toolSelected as PencilTool;
    });
    if(this._tutorial.curState === 0){
      this._tutorial.nextStep();
    }
    this.toolsService.newToolSelected(ToolType.Pencil);
    this.strokeWidth = this.toolsService.pencilWidth;
    this.pencil.strokeWidth = this.toolsService.pencilWidth;
  }

  ngOnDestroy(): void {
    this.selectedToolSubscription.unsubscribe();
  }

  onChangeStrokeWidth(): void {
    if (this.strokeWidth > this.MAX_STROKE) {
      this.strokeWidth = this.MAX_STROKE;
    } else if (this.strokeWidth < this.MIN_STROKE) {
      this.strokeWidth = this.MIN_STROKE;
    }
    this.pencil.strokeWidth = this.strokeWidth;
    this.toolsService.pencilWidth = this.strokeWidth;
  }
}
