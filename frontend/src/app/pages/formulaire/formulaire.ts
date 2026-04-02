import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TokenService, ClientHistoriqueDto, DossierDto } from '../../services/token';
import { RecouvrementService } from '../../services/recouvrement';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-formulaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './formulaire.html',
  styleUrls: ['./formulaire.css']
})
export class FormulaireComponent implements OnInit {

  clientData: ClientHistoriqueDto | null = null;
  dossier: DossierDto | null = null;
  token!: string;
  idDossier!: number;
  form!: FormGroup;
  submitted = false;
  loading = false;
  dataLoading = true;

  // ✅ Onglet actif avec typage sécurisé
 ongletActif: 'overview' | 'paiements' | 'relances' | 'communications' | 'actions' = 'overview';
  fichierSelectionne: File | null = null;

  // Communications
  messageForm!: FormGroup;
  messageSending = false;

  // Relances
  relanceRepondreIndex: any = null; // contiendra l'idRelance de la relance active
  reponseRelanceTexte: string = '';
  relanceSending: boolean = false;
  relanceReponsesEnvoyees: number[] = []; // ID des relances déjà traitées

  actionsDisponibles = [
    { value: 'paiement_immediat',    label: 'Règlement total' },
    { value: 'paiement_partiel',     label: 'Règlement partiel' },
    { value: 'promesse_paiement',    label: 'Promesse de paiement' },
    { value: 'demande_echeance',     label: "Demande d'échéancier" },
    { value: 'demande_consolidation',label: 'Demande de consolidation' },
  ];
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
    private fb: FormBuilder,
    private recouvrementService: RecouvrementService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token')!;
    this.idDossier = Number(this.route.snapshot.paramMap.get('idDossier'));

    this.form = this.fb.group({
      typeIntention:    ['', Validators.required],
      datePaiementPrevue: [null],
      montantPropose:   [null],
      commentaire:      ['', Validators.maxLength(500)]
    });

    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });

    const cachedData = this.tokenService.getClientDataFromSession();

    if (cachedData) {
      this.clientData = cachedData;
      this.dossier = cachedData.dossiers.find(d => Number(d.idDossier) === Number(this.idDossier)) || null;
      if (!this.dossier) { this.router.navigate(['/token-invalide']); return; }
      this.dataLoading = false;
    } else {
      this.tokenService.getClientData(this.token).subscribe({
        next: data => {
          this.clientData = data;
          this.tokenService.saveClientData(data);
          this.dossier = data.dossiers.find(d => Number(d.idDossier) === Number(this.idDossier)) || null;
          if (!this.dossier) { this.router.navigate(['/token-invalide']); return; }
          this.dataLoading = false;
        },
        error: () => {
          this.dataLoading = false;
          this.router.navigate(['/token-invalide']);
        }
      });
    }

    // Validation dynamique
    this.form.get('typeIntention')?.valueChanges.subscribe(val => {
      const dateCtrl = this.form.get('datePaiementPrevue');
      const montantCtrl = this.form.get('montantPropose');
      dateCtrl?.clearValidators();
      montantCtrl?.clearValidators();
      if (val === 'demande_echeance' || val === 'promesse_paiement') {
        dateCtrl?.setValidators([Validators.required]);
      }
      if (val === 'paiement_partiel') {
        montantCtrl?.setValidators([Validators.required]);
      }
      dateCtrl?.updateValueAndValidity();
      montantCtrl?.updateValueAndValidity();
    });
  }

  // ── Getters ──────────────────────────────────────────
  get montantPaye(): number {
    if (!this.dossier?.paiements) return 0;
    return this.dossier.paiements.reduce((sum, p) => sum + p.montantPaye, 0);
  }

  get joursRetard(): number {
    if (!this.dossier?.dateEcheance) return 0;
    const echeance = new Date(this.dossier.dateEcheance);
    const diff = new Date().getTime() - echeance.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  get progressionPaiement(): number {
    if (!this.dossier?.montantInitial || this.dossier.montantInitial === 0) return 0;
    const paye = this.dossier.montantInitial - this.dossier.montantImpaye;
    return Math.round((paye / this.dossier.montantInitial) * 100);
  }
contacterAgence() {
  this.ongletActif = 'communications';
  this.messageForm.patchValue({
    message: "Bonjour, je souhaite contacter l'agence concernant mon dossier."
  });
}
appelerAgence() {
  const numero = "71340000";
    window.location.href = `tel:${numero}`;
  
}
ouvrirWhatsApp(): void {
  const numero = "21671340000"; // numéro STB
  const message = encodeURIComponent(
    `Bonjour, je suis ${this.clientData?.nomComplet}, concernant mon dossier #${this.idDossier}.`
  );

  const url = `https://wa.me/${numero}?text=${message}`;
  window.open(url, '_blank');
}
  // ── Fichiers ──────────────────────────────────────────
  onFileSelected(event: any): void {
    this.fichierSelectionne = event.target.files[0] || null;
  }

  uploadFichier(): void {
    if (!this.fichierSelectionne) return;
    const formData = new FormData();
    formData.append('fichier', this.fichierSelectionne);
    this.http.post(`http://localhost:5203/api/client/upload/${this.token}`, formData).subscribe({
      next: () => { alert('Fichier envoyé !'); this.fichierSelectionne = null; },
      error: () => alert('Erreur lors de l\'envoi.')
    });
  }

  telechargerRecu(): void {
    window.open(`http://localhost:5203/api/client/recu/${this.token}?idDossier=${this.idDossier}`, '_blank');
  }

  telechargerHistorique(): void {
    window.open(`http://localhost:5203/api/client/historique-pdf/${this.token}/${this.idDossier}`, '_blank');
  }

  retourDossiers(): void {
    this.router.navigate(['/client', this.token]);
  }

  // ── Intention ─────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = {
      idDossier: this.idDossier,
      typeIntention: this.form.value.typeIntention,
      commentaire: this.form.value.commentaire,
      datePaiementPrevue: this.form.value.datePaiementPrevue,
      montantPropose: this.form.value.montantPropose
    };
    this.recouvrementService.soumettreReponse(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/confirmation'], {
          state: { idDossier: this.idDossier, typeIntention: this.form.value.typeIntention, token: this.token }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Communications ────────────────────────────────────
  envoyerMessage(): void {
    if (this.messageForm.invalid || this.messageSending) return;
    this.messageSending = true;
    const message = (this.messageForm.value.message ?? '').toString();
    this.recouvrementService.envoyerMessageClient(this.token, this.idDossier, message).subscribe({
      next: () => {
        this.messageForm.reset();
        this.rafraichirDossier(() => { this.messageSending = false; });
      },
      error: () => { this.messageSending = false; }
    });
  }

  // ── Relances ──────────────────────────────────────────
  ouvrirReponseRelance(relance: any): void {
    this.relanceRepondreIndex = relance.idRelance;
    this.reponseRelanceTexte = '';
  }

  annulerReponseRelance(): void {
    this.relanceRepondreIndex = null;
    this.reponseRelanceTexte = '';
  }

  

 envoyerReponseRelance(r: any) {

  // ✅ vérifier avant envoi
  if (!this.reponseRelanceTexte.trim()) return;

  console.log("ID relance:", r.idRelance);
  console.log("Message:", this.reponseRelanceTexte);

  this.relanceSending = true;

  this.recouvrementService.repondreRelance(this.token, r.idRelance,this.reponseRelanceTexte)
    .subscribe({
      next: (response: any) => {
        console.log("SUCCESS", response);
        this.rafraichirDossier();

        // ✅ reset UI
        this.relanceSending = false;
        this.reponseRelanceTexte = '';
       this.relanceRepondreIndex = null;
        // optionnel (update visuel)
        r.statut = 'repondu';
      },
      error: (err: any) => {
        console.log("ERROR", err);
        this.relanceSending = false;
      }
    });
}

  // ── Rafraîchir dossier ────────────────────────────────
  private rafraichirDossier(callback?: () => void): void {
    this.tokenService.getClientData(this.token).subscribe({
      next: data => {
        this.clientData = data;
        this.tokenService.saveClientData(data);
        this.dossier = data.dossiers.find(d => Number(d.idDossier) === Number(this.idDossier)) || null;
        if (callback) callback();
      },
      error: () => { if (callback) callback(); }
    });
  }

  // ── Changer onglet ───────────────────────────────────
  changerOnglet(onglet: 'overview' | 'relances' | 'communications'): void {
    this.ongletActif = onglet;
  }
}