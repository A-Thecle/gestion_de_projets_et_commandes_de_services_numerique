import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-rapide',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contact-rapide.component.html',
  styleUrls: ['./contact-rapide.component.css']
})
export class ContactRapideComponent {
  contact = {
    email: '',
    objet: '',
    message: ''
  };
  successMessage: string | null = null;
  errorMessage: string | null = null;
  showSuccessModal = false;

  constructor(private http: HttpClient) {}

  sendMessage(contactForm: NgForm) { // ← on reçoit le formulaire
    this.http.post('http://localhost:3000/contact', this.contact)
      .subscribe({
        next: () => {
          this.successMessage = 'Votre message est envoyé avec succès à l\'entreprise 🎉';
          this.errorMessage = null;
          this.showSuccessModal = true;

          // Réinitialiser le formulaire et le modèle
          this.contact = { email: '', objet: '', message: '' };
          contactForm.resetForm(); // ← réinitialise aussi l’état de validation

          // Fermeture auto après 3 sec
          setTimeout(() => {
            this.showSuccessModal = false;
          }, 3000);
        },
        error: (err) => {
          alert('Erreur lors de l’envoi ❌');
        }
      });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
