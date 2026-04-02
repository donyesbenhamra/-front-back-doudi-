import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TokenInvalideComponent } from './token-invalide';

describe('TokenInvalideComponent', () => {
  let component: TokenInvalideComponent;
  let fixture: ComponentFixture<TokenInvalideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenInvalideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenInvalideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});