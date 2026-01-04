import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';

// 1. INTERFAZ CORREGIDA (Incluye tus datos reales + emailVerified)
export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  apellidos: string;
  dni: string;
  usuario: string;
  activo: boolean;
  photoURL?: string;
  fechaCreacion?: any;
  emailVerified?: boolean; // <--- Agregado de nuevo para corregir el error
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.cargarDatosTiempoReal(user.uid);
      } else {
        this.userProfileSubject.next(null);
      }
    });
  }

  private cargarDatosTiempoReal(uid: string) {
    // Apuntamos a la colección correcta 'usuarios'
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    
    docData(userDocRef, { idField: 'uid' }).subscribe((data: any) => {
      const currentUser = this.auth.currentUser;
      const dbData = data || {};

      const fullProfile: UserProfile = {
        uid: uid,
        email: dbData['email'] || currentUser?.email || '',
        // Aquí recuperamos el estado de verificación desde Auth
        emailVerified: currentUser?.emailVerified || false, 
        
        // Tus datos personalizados de la BD
        nombre: dbData['nombre'] || '',
        apellidos: dbData['apellidos'] || '',
        dni: dbData['dni'] || '',
        usuario: dbData['usuario'] || '',
        activo: dbData['activo'] !== undefined ? dbData['activo'] : true,
        photoURL: dbData['photoURL'] || currentUser?.photoURL || 'assets/icon/login.png',
        fechaCreacion: dbData['fechaCreacion']
      };

      this.userProfileSubject.next(fullProfile);
    });
  }

  getUserProfile(): Observable<UserProfile | null> {
    return this.userProfile$;
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
    
    // Guardamos usando setDoc con merge
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date()
    }, { merge: true });
  }
}