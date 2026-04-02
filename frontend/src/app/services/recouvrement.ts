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

@Injectable({ providedIn: 'root' })
export class RecouvrementService {
  private apiUrl = 'http://localhost:5203/api';

  constructor(private http: HttpClient) {}
  

  // --- MÉTHODES DE RÉCUPÉRATION (GET) ---

  // Récupère tous les dossiers et infos du client via le token
  getHistorique(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/client/historique/${token}`);
  }

  // --- MÉTHODES D'ENVOI (POST) ---

  // Envoi d'un message libre (non lié à une relance spécifique)
  envoyerMessageClient(token: string, idDossier: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/client/message/${token}?idDossier=${idDossier}`, { contenu: message });
  }

  // Réponse à une relance spécifique (change le statut en "répondu")
  repondreRelance(token: string, idRelance: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/client/repondre-relance/${token}/${idRelance}`, { contenu: message });
  }

  // Soumission d'une intention de paiement
  soumettreReponse(payload: IntentionPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/intention`, payload);
  }
}