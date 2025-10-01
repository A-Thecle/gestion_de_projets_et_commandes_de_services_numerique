import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule, RouterLink],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      emailOrPhone: ['', [Validators.required]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

 verifyLogin(): void {
  console.log('Bouton Connexion cliqué', this.loginForm.value); // Log pour vérifier
  if (this.loginForm.invalid) {
    this.errorMessage = 'Veuillez remplir tous les champs correctement.';
    console.log('Formulaire invalide', this.loginForm.errors);
    return;
  }

  this.authService.login(this.loginForm.value).subscribe({
    next: (response) => {
      console.log('Connexion réussie', response); // Log pour vérifier
      this.errorMessage = null;
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/home']);
      } else {
        this.router.navigate(['/client/home']);
      }
    },
    error: (err) => {
      console.error('Erreur de connexion', err); // Log pour déboguer
      this.errorMessage = err.message || 'Email ou mot de passe incorrect.';
    },
  });
}
}