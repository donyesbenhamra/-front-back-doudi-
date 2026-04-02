import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css'
})
export class ConfirmationComponent implements OnInit {

  idDossier: number = 0;
  typeIntention: string = '';
  dateNow: Date = new Date();
  token: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = history.state;
    this.idDossier = state?.idDossier || 0;
    this.typeIntention = state?.typeIntention || '';
    this.token = state?.token || '';
  }

  retourDossiers(): void {
    this.router.navigate(['/client', this.token]);
  }
}
