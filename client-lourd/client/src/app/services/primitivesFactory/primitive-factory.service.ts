import { Injectable } from '@angular/core';
import { Path } from '../svgPrimitives/path/path';
import { SVGPrimitive } from '../svgPrimitives/svgPrimitive';
import { PrimitiveType } from '../utils/constantsAndEnums';
@Injectable({
  providedIn: 'root',
})
export class PrimitiveFactoryService {

  generatePrimitives(primitivesToGenerate: string): SVGPrimitive[] {
    const primitives: SVGPrimitive[] = [];
    const tabTemp: SVGPrimitive[] = JSON.parse(primitivesToGenerate);
    tabTemp.forEach((prim: SVGPrimitive) => {
      let primitive: SVGPrimitive | undefined;
      switch (prim.type) {
        case PrimitiveType.Pencil: {
          primitive = Path.createCopy(prim);
          break;
        }
      }
      if (primitive) {
        primitives.push(primitive);
      }
    });

    return primitives;
  }
}
