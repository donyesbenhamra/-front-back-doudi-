import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RecouvrementService } from './recouvrement';

describe('RecouvrementService', () => {
  let service: RecouvrementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecouvrementService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(RecouvrementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
