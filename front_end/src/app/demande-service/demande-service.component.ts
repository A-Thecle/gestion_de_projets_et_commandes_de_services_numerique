import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommandesService } from './commande.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { ServiceService } from '../services/service.service';
import { ServicesEntity } from '../services/services.model';

@Component({
  selector: 'app-demande-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './demande-service.component.html',
  styleUrls: ['./demande-service.component.css']
})
export class DemandeServiceComponent implements OnInit {
  demandeForm: FormGroup;
  errorMessage: string | null = null;
  selectedFiles: File[] = [];
  services: ServicesEntity[] = [];
  showConfirmation: boolean = false;
  selectedService: ServicesEntity | undefined;

  constructor(
    private fb: FormBuilder,
    private commandesService: CommandesService,
    private router: Router,
    private authService: AuthService,
    private serviceService: ServiceService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.demandeForm = this.fb.group({
      typeService: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      deliveryDate: ['', Validators.required],
      montantFinal: ['', Validators.required],
      paiement: ['']
    });
  }

  ngOnInit(): void {
    this.loadServices();

    this.demandeForm.get('typeService')?.valueChanges.subscribe((serviceId) => {
      this.selectedService = this.services.find(s => s.service_id === +serviceId);

      if (this.selectedService) {
        const minPrice = this.selectedService.prix_minimum;
        this.demandeForm.patchValue({ montantFinal: minPrice }, { emitEvent: false });
        const montantCtrl = this.demandeForm.get('montantFinal');
        montantCtrl?.setValidators([Validators.required, Validators.min(minPrice)]);
        montantCtrl?.updateValueAndValidity();
      } else {
        const montantCtrl = this.demandeForm.get('montantFinal');
        montantCtrl?.clearValidators();
        montantCtrl?.setValidators([Validators.required]);
        montantCtrl?.updateValueAndValidity();
        this.demandeForm.patchValue({ montantFinal: '' }, { emitEvent: false });
      }
      this.cdr.detectChanges();
    });
  }

  getMontantPlaceholder(): string {
    if (this.selectedService?.prix_minimum) {
      const formattedPrice = this.selectedService.prix_minimum.toLocaleString('fr-FR');
      return `Minimum ${formattedPrice} Ar`;
    }
    return 'Choisissez un service';
  }

  getMinPriceHint(): string {
    if (this.selectedService?.prix_minimum) {
      const formattedPrice = this.selectedService.prix_minimum.toLocaleString('fr-FR');
      return `Prix minimum : ${formattedPrice} Ar`;
    }
    return '';
  }

  onMontantInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (this.selectedService?.prix_minimum && value < this.selectedService.prix_minimum) {
      this.demandeForm.get('montantFinal')?.setValue(this.selectedService.prix_minimum, { emitEvent: false });
      this.cdr.detectChanges();
    }
  }

  loadServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (res) => {
        this.services = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des services : ' + err.message;
        this.cdr.detectChanges();
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit(): void {
    if (this.demandeForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const client = this.authService.getUserConnected();
    if (!client) {
      this.errorMessage = 'Vous devez être connecté pour envoyer une demande.';
      return;
    }

    const formValue = this.demandeForm.value;
    const formData = new FormData();
    formData.append('client_id', client.id.toString());
    formData.append('service_id', formValue.typeService);
    formData.append('description_besoins', formValue.description);
    formData.append('date_livraison', formValue.deliveryDate);
    formData.append('montant_final', formValue.montantFinal || '');

    this.selectedFiles.forEach(file => {
      formData.append('fichier_joint', file, file.name);
    });

    this.commandesService.createCommande(formData).subscribe({
      next: () => {
        this.errorMessage = null;
        this.selectedFiles = [];
        this.demandeForm.reset();
        this.ngZone.run(() => {
          this.showConfirmation = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l’envoi de la demande : ' + err.message;
        this.cdr.detectChanges();
      }
    });
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
    this.router.navigate(['/client/home']);
  }
}