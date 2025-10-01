import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css'],
 
  imports: [ReactiveFormsModule, CommonModule, RouterLink]
})
export class InscriptionComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
   showSuccessModal = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
      role: ['client'] // par défaut
    });
  }

registerUser(): void {
  console.log('Bouton Inscription cliqué', this.registerForm.value); // Log pour vérifier
  if (this.registerForm.valid) {
    this.authService.createUser(this.registerForm.value).subscribe({
       next: () => {
          this.successMessage = 'Inscription réussie 🎉, merci , vous pouvez beneficiez tous nos services ';
          this.errorMessage = null;
          this.showSuccessModal = true;

          // Fermeture auto après 3 sec
          setTimeout(() => {
            this.showSuccessModal = false;
            this.router.navigate(['/connexion']); // Redirection après succès
          }, 3000);

          this.registerForm.reset({
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            mot_de_passe: '',
            role: 'client',
          });
        },
      error: (err) => {
        console.error('Erreur d\'inscription', err); // Log pour déboguer
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
        this.successMessage = null;
      },
    });
  } else {
    console.log('Formulaire invalide', this.registerForm.errors);
    this.errorMessage = 'Veuillez remplir tous les champs correctement.';
  }
}


  closeSuccessModal() {
    this.showSuccessModal = false;
  }

}
