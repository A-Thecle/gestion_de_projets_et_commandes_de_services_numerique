import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
  formSubmitted = false; 

  // Flags pour voir/masquer mot de passe
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

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
      confirmer_mot_de_passe: ['', [Validators.required]],
      role: ['client']
    }, { validators: this.passwordMatchValidator });
  }

  // Vérifie si mot_de_passe == confirmer_mot_de_passe
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('mot_de_passe')?.value;
    const confirm = group.get('confirmer_mot_de_passe')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
  togglePasswordVisibility(field: 'password' | 'confirm') {
  if (field === 'password') {
    this.showPassword = !this.showPassword;
  } else {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

registerUser(): void {
  this.formSubmitted = true; // permet d'afficher le message global si formulaire invalide

  if (this.registerForm.invalid) {
    this.errorMessage = 'Veuillez remplir tous les champs correctement.';
    return;
  }

  this.errorMessage = null; // réinitialise erreur
  const formValue = this.registerForm.value;
  const cleanPhone = formValue.telephone.replace(/\s+/g, '');
  const fullNumber = `${formValue.prefix}${cleanPhone}`;

  const payload = {
    ...formValue,
    telephone: fullNumber,
  };

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
        confirmer_mot_de_passe: '',
        role: 'client',
      });
      this.formSubmitted = false; // reset
    },
    error: (err) => {
      this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
      this.successMessage = null;
    },
  });
}



  formatPhoneNumber() {
    let input = this.registerForm.get('telephone')?.value || '';
    input = input.replace(/\s+/g, '');
    if (input.length > 9) input = input.substring(0, 9);

    let formatted = '';
    if (input.length > 0) formatted += input.substring(0, 2);
    if (input.length > 2) formatted += ' ' + input.substring(2, 4);
    if (input.length > 4) formatted += ' ' + input.substring(4, 7);
    if (input.length > 7) formatted += ' ' + input.substring(7, 9);

    this.registerForm.get('telephone')?.setValue(formatted);
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
  // Réinitialise le formulaire
resetForm(form: FormGroup): void {
  // Réinitialisation des champs du formulaire
  form.reset({
    nom: '',
    prenom: '',
    email: '',
    prefix: '+261',
    telephone: '',
    mot_de_passe: '',
    confirmer_mot_de_passe: '',
    role: 'client'
  });

  // Réinitialisation des flags et messages
  this.formSubmitted = false;
  this.errorMessage = null;
  this.successMessage = null;
  this.showSuccessModal = false;
  this.showPassword = false;
  this.showConfirmPassword = false;
}

}
