import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private avatarSubject = new BehaviorSubject<string>('assets/icon/login2.svg');
  public avatar$ = this.avatarSubject.asObservable();

  private userProfileSubject = new BehaviorSubject<UserProfile>({
    avatar: 'assets/icon/login2.svg'
  });
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor() {
    this.loadUserProfile();
  }

  private loadUserProfile() {
    // Cargar del localStorage o de Firebase si está disponible
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      this.userProfileSubject.next(profile);
      this.avatarSubject.next(profile.avatar || 'assets/icon/login2.svg');
    }
  }

  getAvatar(): Observable<string> {
    return this.avatar$;
  }

  getUserProfile(): Observable<UserProfile> {
    return this.userProfile$;
  }

  setUserProfile(profile: UserProfile) {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    this.userProfileSubject.next(profile);
    if (profile.avatar) {
      this.avatarSubject.next(profile.avatar);
    }
  }

  setAvatar(avatarUrl: string) {
    const currentProfile = this.userProfileSubject.value;
    const updatedProfile = { ...currentProfile, avatar: avatarUrl };
    this.setUserProfile(updatedProfile);
  }

  getCurrentAvatar(): string {
    return this.avatarSubject.value;
  }

  getCurrentProfile(): UserProfile {
    return this.userProfileSubject.value;
  }
}
