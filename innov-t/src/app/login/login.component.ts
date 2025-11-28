import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  submitted = false;

  // Flag pour voir/masquer le mot de passe
  showPassword: boolean = false;

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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  verifyLogin(): void {
     
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.errorMessage = null;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/home']);
        } else {
          this.router.navigate(['/client/home']);
        }
      },
      error: (err) => {
         this.errorMessage = err.message;
      },
    });
  }
}
