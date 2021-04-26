import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { KeyboardEventType, KeyboardShortcutType } from '../utils/constantsAndEnums';

@Injectable({
  providedIn: 'root',
})

export class KeyboardService {
  modalWindowActive = false;
  inputFocusedActive = false;
  textToolActive = false;
  private readonly KEY_SHORTCUT_SUBJECT: Subject<KeyboardShortcutType>;
  private readonly KEY_PRESS_SUBJECT: Subject<KeyboardEventType>;
  private keyOut = '';
  readonly SHORTCUT_MAP: Map<string, KeyboardShortcutType>;
  readonly CTRL_SHORTCUT_MAP: Map<string, KeyboardShortcutType>;
  readonly CTRL_SHIFT_SHORTCUT_MAP: Map<string, KeyboardShortcutType>;

  constructor() {
    this.KEY_SHORTCUT_SUBJECT = new Subject<KeyboardShortcutType>();
    this.KEY_PRESS_SUBJECT = new Subject<KeyboardEventType>();
    this.SHORTCUT_MAP = new Map<string, KeyboardShortcutType>([
      ['c', KeyboardShortcutType.Pencil],
      ['w', KeyboardShortcutType.PaintBrush],
      ['p', KeyboardShortcutType.Quill],
      ['y', KeyboardShortcutType.Pen],
      ['a', KeyboardShortcutType.SprayPaint],
      ['1', KeyboardShortcutType.Rectangle],
      ['2', KeyboardShortcutType.Ellipse],
      ['3', KeyboardShortcutType.Polygon],
      ['l', KeyboardShortcutType.Line],
      ['t', KeyboardShortcutType.Text],
      ['r', KeyboardShortcutType.ColorApplicator],
      ['b', KeyboardShortcutType.PaintBucket],
      ['e', KeyboardShortcutType.Eraser],
      ['i', KeyboardShortcutType.Dropper],
      ['s', KeyboardShortcutType.Select],
      ['g', KeyboardShortcutType.Grid],
      ['m', KeyboardShortcutType.Magnet],
      ['+', KeyboardShortcutType.ZoomInGrid],
      ['-', KeyboardShortcutType.ZoomOutGrid],
      ['delete', KeyboardShortcutType.Delete],
    ]);
    this.CTRL_SHORTCUT_MAP = new Map<string, KeyboardShortcutType>([
      ['o', KeyboardShortcutType.CreateDrawing],
      ['s', KeyboardShortcutType.SaveDrawing],
      ['g', KeyboardShortcutType.OpenGallery],
      ['e', KeyboardShortcutType.ExportDrawing],
      ['x', KeyboardShortcutType.Cut],
      ['c', KeyboardShortcutType.Copy],
      ['v', KeyboardShortcutType.Paste],
      ['d', KeyboardShortcutType.Duplicate],
      ['z', KeyboardShortcutType.Undo],
      ['a', KeyboardShortcutType.SelectAll],
    ]);
    this.CTRL_SHIFT_SHORTCUT_MAP = new Map<string, KeyboardShortcutType>([
      ['z', KeyboardShortcutType.Redo],
    ]);
  }

  getKeyOut(): string {
    return this.keyOut;
  }

  getKeyboardShortcutType(): Observable<KeyboardShortcutType> {
    return this.KEY_SHORTCUT_SUBJECT.asObservable();
  }

  getKeyboardEventType(): Observable<KeyboardEventType> {
    return this.KEY_PRESS_SUBJECT.asObservable();
  }

  // Valide l'entrée pour gérer les undefined
  validateShortcutEntry(entryString: string, entryMap: Map<string, KeyboardShortcutType>): KeyboardShortcutType | undefined {
    return entryMap.has(entryString) ? entryMap.get(entryString) : KeyboardShortcutType.None;
  }

  onKeyDown(keyboard: KeyboardEvent): void {
    this.keyOut = keyboard.key;
    this.preventDefaultKeyboardEvent(keyboard);
    let keyboardShortcutType: KeyboardShortcutType | undefined = KeyboardShortcutType.None;
    let keyboardEventType: KeyboardEventType = KeyboardEventType.InvalidEvent;

    const key = keyboard.key.toLowerCase();
    // Si pas de fenêtre modale ou qu'il n'y a pas d'input form
    if (!this.modalWindowActive) {
      // Clés avec CTRL enfoncé
      if (keyboard.ctrlKey) {
        // CTRL+SHIFT+z
        keyboard.shiftKey ?
        keyboardShortcutType = this.validateShortcutEntry(key, this.CTRL_SHIFT_SHORTCUT_MAP) :
        keyboardShortcutType = this.validateShortcutEntry(key, this.CTRL_SHORTCUT_MAP);
      // Clés seules
      } else if (!this.inputFocusedActive) {
        if (keyboard.code === 'Delete') {
          keyboardShortcutType = KeyboardShortcutType.Delete;
        } else if (keyboard.code === 'AltLeft' || keyboard.code === 'AltRight') {
            keyboardEventType = KeyboardEventType.AltDown;
        } else if (keyboard.code === 'ShiftLeft' || keyboard.code === 'ShiftRight') {
          keyboardEventType = KeyboardEventType.ShiftDown;
        } else if (keyboard.code === 'Escape') {
          keyboardEventType = KeyboardEventType.EscapeDown;
        } else if (keyboard.code === 'Backspace') {
          keyboardEventType = KeyboardEventType.BackspaceDown;
        }
        keyboardShortcutType = this.validateShortcutEntry(key, this.SHORTCUT_MAP);
      } else { keyboardEventType = KeyboardEventType.KeyDown; }

      if (keyboard.code === 'Backspace') {
        keyboardEventType = KeyboardEventType.BackspaceDown;
      }
    }
    this.KEY_PRESS_SUBJECT.next(keyboardEventType);
    this.KEY_SHORTCUT_SUBJECT.next(keyboardShortcutType);
  }

  onKeyUp(keyboard: KeyboardEvent): void {
    let keyboardEventType: KeyboardEventType = KeyboardEventType.InvalidEvent;
    if (!this.modalWindowActive) {
      // Alt up
      if (keyboard.code === 'AltLeft' || keyboard.code === 'AltRight') {
        keyboardEventType = KeyboardEventType.AltUp;
        // Shift up
      } else if (keyboard.code === 'ShiftLeft' || keyboard.code === 'ShiftRight') {
        keyboardEventType = KeyboardEventType.ShiftUp;
      } else { keyboardEventType = KeyboardEventType.KeyUp; }
    }
    this.KEY_PRESS_SUBJECT.next(keyboardEventType);
  }

  // empêcher les clés par défaut du browser (ie. ouvrir un nouveau document HTML, sauvegarder HTML, etc.)
  private preventDefaultKeyboardEvent(keyboard: KeyboardEvent): void {
    const key = keyboard.key;
    if (keyboard.ctrlKey &&
      (key === 'o'
        || key === 's'
        || key === 'g'
        || key === 'e'
        || (key === 'x' && !this.inputFocusedActive)
        || (key === 'c' && !this.inputFocusedActive)
        || (key === 'v' && !this.inputFocusedActive)
        || key === 'd'
        || (key === 'a' && !this.inputFocusedActive)
        || (key === 'z' && !this.inputFocusedActive))
        || (
          !this.inputFocusedActive && (keyboard.code === 'Delete' || keyboard.code === 'Escape' ||
          keyboard.altKey || keyboard.shiftKey || (keyboard.altKey && keyboard.shiftKey) || (keyboard.shiftKey && keyboard.altKey))
          )
        ) {
      keyboard.preventDefault();
      keyboard.stopPropagation();
    }
  }
}
