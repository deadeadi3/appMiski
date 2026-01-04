import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  //


  
async registrarUsuario(
  nombre: string,
  apellidos: string,
  usuario: string,
  dni: string,
  email: string,
  contrasena: string
): Promise<boolean> {
  try {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, contrasena);
    const uid = userCredential.user.uid;

    try {
      // 2. Guardar datos en Firestore
      await setDoc(doc(this.firestore, 'usuarios', uid), {
        nombre,
        apellidos,
        usuario,
        dni,
        email,
        fechaCreacion: new Date(),
        activo: true
      });

      console.log('✅ Usuario registrado correctamente');
      return true;

    } catch (firestoreError) {
      // Si falla Firestore, eliminar el usuario de Auth
      console.error('❌ Error al guardar en Firestore, eliminando usuario de Auth');
      await userCredential.user.delete();
      throw firestoreError;
    }

  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    throw error;
  }
}
  // 🚪 Cerrar sesión
  async logout() {
    await signOut(this.auth);
  }

  // 👤 Obtener usuario actual
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // 📊 Obtener datos del usuario desde Firestore
  async getUserData(uid: string) {
    const userDoc = await getDoc(doc(this.firestore, 'usuarios', uid));
    return userDoc.exists() ? userDoc.data() : null;
  }

 //🔐 LOGIN con email y contraseña
  async loginUsuario(email: string, contrasena: string): Promise<boolean> {
    try {
      // Autenticar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(this.auth, email, contrasena);
      const uid = userCredential.user.uid;

      // Verificar si el usuario está activo en Firestore
      const userDoc = await getDoc(doc(this.firestore, 'usuarios', uid));
      
      if (!userDoc.exists()) {
        console.log('❌ Usuario no encontrado en Firestore');
        await this.logout();
        return false;
      }

      const userData = userDoc.data();
      if (userData['activo'] === false) {
        console.log('❌ Usuario inactivo');
        await this.logout();
        return false;
      }

      console.log('✅ Login exitoso');
      return true;

    } catch (error: any) {
      console.error('❌ Error en login:', error.message);
      return false;
    }
  
  }
}