import { Injectable } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { getFirestore } from '@angular/fire/firestore';
import { getStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseInitService {
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (this.initialized) return;
    
    try {
      // Inicializar los servicios de forma segura
      getAuth();
      getFirestore();
      getStorage();
      this.initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
