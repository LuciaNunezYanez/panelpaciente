import { TestBed } from '@angular/core/testing';

import { SenalizacionService } from './senalizacion.service';

describe('SenalizacionService', () => {
  let service: SenalizacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SenalizacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
