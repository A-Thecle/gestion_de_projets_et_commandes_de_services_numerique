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
  prefix: ['+261', [Validators.required]],
  telephone: ['', [Validators.required, Validators.pattern(/^\d{2}\s\d{2}\s\d{3}\s\d{2}$/)]],


  mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
  role: ['client']
});

  }
registerUser(): void {
  if (this.registerForm.valid) {
    const formValue = this.registerForm.value;

    // Supprimer les espaces pour envoyer au backend
    const cleanPhone = formValue.telephone.replace(/\s+/g, '');

    // Concaténer le préfixe choisi (avec le +)
    const fullNumber = `${formValue.prefix}${cleanPhone}`;

    // Créer le payload final
    const payload = {
      ...formValue,
      telephone: fullNumber, // envoi au backend avec +
    };

    // Appel au service
    this.authService.createUser(payload).subscribe({
      next: () => {
        this.successMessage = 'Inscription réussie 🎉';
        this.errorMessage = null;
        this.showSuccessModal = true;

        setTimeout(() => {
          this.showSuccessModal = false;
          this.router.navigate(['/connexion']);
        }, 3000);

        this.registerForm.reset({
          nom: '',
          prenom: '',
          email: '',
          prefix: '+261',
          telephone: '',
          mot_de_passe: '',
          role: 'client',
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
        this.successMessage = null;
      },
    });
  } else {
    this.errorMessage = 'Veuillez remplir tous les champs correctement.';
  }
}




formatPhoneNumber() {
  let input = this.registerForm.get('telephone')?.value || '';

  // Supprimer tous les espaces existants pour traiter le numéro
  input = input.replace(/\s+/g, '');

  // Limiter à 9 chiffres max (ou selon ton besoin)
  if (input.length > 9) input = input.substring(0, 9);

  // Formater pour affichage : 00 00 000 00
  let formatted = '';
  if (input.length > 0) formatted += input.substring(0, 2);
  if (input.length > 2) formatted += ' ' + input.substring(2, 4);
  if (input.length > 4) formatted += ' ' + input.substring(4, 7);
  if (input.length > 7) formatted += ' ' + input.substring(7, 9);

  // Mettre à jour le champ du formulaire sans déclencher d'événement supplémentaire
  this.registerForm.get('telephone')?.setValue(formatted, { emitEvent: false });
}



  closeSuccessModal() {
    this.showSuccessModal = false;
  }

}
