import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  ipc: IpcRenderer;

  constructor() { 
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer;
      } catch (e) {
        console.log('error');
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }
}
