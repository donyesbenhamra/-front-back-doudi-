import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IntentionPayload {
  idDossier: number;
  typeIntention: string;
  commentaire?: string;
  datePaiementPrevue?: string;
  montantPropose?: number;
}

export interface IntentionExistante {
  existe: boolean;
  idIntention?: number;
  typeIntention?: string;
  dateIntention?: string;
}

@Injectable({ providedIn: 'root' })
export class RecouvrementService {
  private apiUrl = 'http://localhost:5203/api';

  constructor(private http: HttpClient) {}

  getHistorique(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/client/historique/${token}`);
  }

  envoyerMessageClient(token: string, idDossier: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/client/message/${token}?idDossier=${idDossier}`, { contenu: message });
  }

  repondreRelance(token: string, idRelance: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/client/repondre-relance/${token}/${idRelance}`, { contenu: message });
  }

  soumettreReponse(payload: IntentionPayload, token: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/client/intention/${token}`, payload);
}
  // ── Nouveaux ──────────────────────────────────────────
  verifierIntentionExistante(token: string, idDossier: number): Observable<IntentionExistante> {
    return this.http.get<IntentionExistante>(
      `${this.apiUrl}/client/intention-existante/${token}/${idDossier}`
    );
  }

  annulerIntention(token: string, idIntention: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/client/intention/${token}/${idIntention}`);
  }
}