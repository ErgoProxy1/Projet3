import { Observable, Subject } from 'rxjs';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { ToolCommand } from '../toolCommands/toolCommand';
import { DEFAULT_CURSOR, KeyboardEventType, MouseEventType, ToolType } from '../utils/constantsAndEnums';
import { Point } from '../utils/point';

export abstract class Tool {
  readonly TYPE: ToolType;
  protected temporaryPrimitivesAvailable: Subject<void> = new Subject<void>();

   /**
    * Envoie les informations d'un evenement de souris a l'outil pour qu'il le traite.
    *
    * @param eventType Le type d'evenement appelant cette fonction
    * @param position La position du curseur dans le canevas
    * @param primitive La primitive sur laquelle on a clique, s'il y a lieu
    */
  mouseEvent(eventType: MouseEventType, position: Point, primitive?: SVGPrimitive): void {
    return;
  }

   /**
    * Envoie les informations d'un evenement de clavier a l'outil pour qu'il le traite.
    *
    * @param eventType Le type d'evenement appelant cette fonction
    */
  keyboardEvent(eventType: KeyboardEventType): void {
    return;
  }

   /**
    * Envoie les informations d'un evenement de la molette de souris a l'outil pour qu'il le traite.
    *
    * @param delta La variation dans l'orientation de la molette de la souris
    */
  mouseWheelEvent(delta: number): void {
    return;
  }

  /**
   * Retourne un observable vers la commande creee par l'outil, s'il y a lieu.
   */
  abstract subscribeToCommand(): Observable<ToolCommand>;

  /**
   * Retourne un observable vers un signal signifiant que des primitives temporaires sont disponibles.
   */
  subscribeToTemporaryPrimitivesAvailable(): Observable<void> {
    return this.temporaryPrimitivesAvailable.asObservable();
  }

  /**
   * Retourne une liste de primitives temporaires s'il y a lieu.
   */
  getTemporaryPrimitives(): SVGPrimitive[] {
    return [];
  }

  /**
   * Retourne le curseur correspondant a cet outil.
   */
  getCursor(): string {
    return DEFAULT_CURSOR;
  }

  /**
   * Prepare l'outil a ne plus etre actif.
   */
  standby(): void {
    return;
  }

  /**
   * Preparte l'outil a etre actif.
   */
  setActive(primitives: SVGPrimitive[]): void {
    return;
  }
}
