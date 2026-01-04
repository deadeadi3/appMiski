import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { initializeIonicons } from './app/icons';

// Initialize Ionicons
initializeIonicons();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Error initializing app:', err);
  });