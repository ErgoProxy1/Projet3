import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { Color } from '../utils/color';
import { NewDrawingInfo } from '../utils/newDrawingInfo';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {

  drawingObservable: Observable<NewDrawingInfo>;
  private drawingSubject  = new Subject<NewDrawingInfo>();

  initWorkspaceObservable: Observable<number[]>;
  private initWorkspaceSubject = new BehaviorSubject<number[]>([0, 0]);

  workspaceObservable: Observable<number[]>;
  private workspaceSubject = new BehaviorSubject<number[]>([0, 0]);

  primtivesObservable: Observable<SVGPrimitive[]>;
  private primitivesSubject = new Subject<SVGPrimitive[]>();

  backgroundColorObservable: Observable<Color>;
  private backgroundColorSubject = new Subject<Color>();

  fileUploadObservable: Observable<any>;
  private _fileUploadSubject = new Subject<any>();

  constructor() {
    this.drawingObservable = this.drawingSubject.asObservable();
    this.initWorkspaceObservable = this.initWorkspaceSubject.asObservable();
    this.workspaceObservable = this.workspaceSubject.asObservable();
    this.primtivesObservable = this.primitivesSubject.asObservable();
    this.backgroundColorObservable = this.backgroundColorSubject.asObservable();
    this.fileUploadObservable = this._fileUploadSubject.asObservable();
  }

  // Envoie les donnees du nouveau dessin au canvas
  sendDrawingData(newDrawingInfo: NewDrawingInfo): void {
    this.drawingSubject.next(newDrawingInfo);
  }

  // Envoir les donnees des dimensions du workspace à l'init de la vue
  sendInitWorkspaceDimensions(dimensions: number[]): void {
    this.initWorkspaceSubject.next(dimensions);
  }

  // Envoie les donnees des dimensions du workspace
  sendWorkspaceDimensions(dimensions: number[]): void {
    this.workspaceSubject.next(dimensions);
  }

  // Envoie la list des primitives presentent
  sendPrimitives(primitives: SVGPrimitive[]): void {
    this.primitivesSubject.next(primitives);
  }

  // Envoie les donnees de la couleur de fond
  sendBackgroundColorData(color: Color): void {
    this.backgroundColorSubject.next(color);
  }

  sendFileUploadData(data: any){
    this._fileUploadSubject.next(data);
  }
}
