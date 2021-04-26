import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';

export interface ToolCommand {
  /**
   * Appliquer la commande.
   */
  apply(primitives: SVGPrimitive[]): void;

  /**
   * Effectue l'inverse de la commande.
   */
  cancel(primitives: SVGPrimitive[]): void;
}
