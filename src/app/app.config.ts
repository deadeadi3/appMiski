import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { routes } from './app.routes';
import localeEsES from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

// Registrar el locale para español
registerLocaleData(localeEsES);

const firebaseConfig = {
  apiKey: "AIzaSyAQuh3FjibQlDSLdlU649bPdljsOU2ce2Q",
  authDomain: "miskyapp-58758.firebaseapp.com",
  projectId: "miskyapp-58758",
  storageBucket: "miskyapp-58758.firebasestorage.app",
  messagingSenderId: "575338572315",
  appId: "1:575338572315:web:faeb8ecbe876c2298aa6be",
  measurementId: "G-Z6PJVBFN7B"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular({ mode: 'md' }),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    { provide: LOCALE_ID, useValue: 'es' }
  ],
};