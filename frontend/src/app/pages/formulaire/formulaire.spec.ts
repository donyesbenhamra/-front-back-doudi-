import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaireComponent} from './formulaire';

describe('Formulaire', () => {
  let component: FormulaireComponent;
  let fixture: ComponentFixture<FormulaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaireComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
