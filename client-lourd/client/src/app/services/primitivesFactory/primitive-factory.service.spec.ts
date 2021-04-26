import { TestBed } from '@angular/core/testing';

import { PrimitiveFactoryService } from './primitive-factory.service';

describe('PrimitiveFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrimitiveFactoryService = TestBed.inject(PrimitiveFactoryService);
    expect(service).toBeTruthy();
  });
});
