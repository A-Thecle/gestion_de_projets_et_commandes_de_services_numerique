import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { ServiceClientComponent } from './service-client/service-client.component';
import { ContactRapideComponent } from './contact-rapide/contact-rapide.component';

import { HomeClientComponent } from './home-client/home-client.component';
import { EspaceServiceClientComponent } from './espace-service-client/espace-service-client.component';
import { DemandeServiceComponent } from './demande-service/demande-service.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import { CommandesComponent } from './commande/commande.component';
import { ProjetComponent } from './projet/projet.component';
import { ClientComponent } from './client/client.component';
import { ProjetByClientComponent } from './projet-by-client/projet-by-client.component';
import { ServiceAdminComponent } from './service-admin/service-admin.component';
import { ClientProfileComponent } from './client-profile/client-profile.component';
import { ClientMessagingComponent } from './client-messaging/client-messaging.component';
import { AdminMessagingComponent } from './admin-messaging/admin-messaging.component';
import { TemoignagesComponent } from './temoignages/temoignages.component';
import { TemoignagesAdminComponent } from './temoignages-admin/temoignages-admin.component';
import { PublicTemoignageComponent } from './public-temoignage/public-temoignage.component';


export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'connexion', component: LoginComponent },
      { path: 'inscription', component: InscriptionComponent },
      { path: 'services', component: ServiceClientComponent },
      { path: 'contact', component: ContactRapideComponent },
      { path: 'temoignages', component: PublicTemoignageComponent },
    ]
  },

  {
    path: 'client',
    component: ClientLayoutComponent,
    children: [
      { path: 'home', component: HomeClientComponent },
      { path: 'services', component: EspaceServiceClientComponent },
      { path: 'demande', component: DemandeServiceComponent },
      { path: 'vos_projets', component: ProjetByClientComponent },
      { path: 'mon_profil', component: ClientProfileComponent },
      { path: 'messagerie', component: ClientMessagingComponent },
      { path: 'temoignage', component: TemoignagesComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'home', component: HomeAdminComponent }, 
      { path: 'commandes', component: CommandesComponent },
      { path: 'projets', component: ProjetComponent },
      { path: 'clients/liste', component: ClientComponent },
      { path: 'services', component: ServiceAdminComponent },
      { path: 'messagerie', component: AdminMessagingComponent },
      { path: 'temoignages', component: TemoignagesAdminComponent},
    ]
  },

  { path: '**', redirectTo: '' }
];

