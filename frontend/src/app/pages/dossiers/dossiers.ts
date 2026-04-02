import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService, ClientHistoriqueDto, DossierDto } from '../../services/token';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dossiers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dossiers.html',
  styleUrl: './dossiers.css',
  encapsulation: ViewEncapsulation.None
})
export class DossiersComponent implements OnInit {

  clientData: ClientHistoriqueDto | null = null;
  dossiers: DossierDto[] = [];
  token!: string;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token')!;
    console.log('TOKEN:', this.token);

    this.tokenService.getClientData(this.token).subscribe({
     next: (data) => {
    this.clientData = data;
    this.tokenService.saveClientData(data);
    this.dossiers = [...data.dossiers ?? []];
    this.loading = false;
    this.cdr.detectChanges();
},
      error: (err) => {
        console.log('ERREUR:', err);
        this.loading = false;
        this.error = true;
        this.router.navigate(['/token-invalide']);
      }
    });
  }

  ouvrirDossier(idDossier: number): void {
    this.router.navigate(['/formulaire', this.token, idDossier]);
  }

  calculateProgress(dossier: DossierDto): number {
    if (!dossier.montantInitial || dossier.montantInitial === 0) return 0;
    const paid = dossier.montantInitial - dossier.montantImpaye;
    const prog = Math.round((paid / dossier.montantInitial) * 100);
    return Math.max(0, Math.min(100, prog));
  }

  totalImpaye(): number {
    return this.dossiers.reduce((sum, d) => sum + d.montantImpaye, 0);
  }
}