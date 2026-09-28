import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { AuthSession, User } from '../models/user.model';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const CURRENT_USER_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(private storage: StorageService, private router: Router) {
    this.restoreSession();
  }

  private restoreSession(): void {
    // Session can be in localStorage (remember=true) or sessionStorage
    const session =
      this.storage.getGlobal<AuthSession>(SESSION_KEY) ??
      this.storage.sessionGet<AuthSession>(SESSION_KEY);

    if (session) {
      const users = this.getUsers();
      const user = users.find((u) => u.id === session.userId) ?? null;
      if (user) {
        this.storage.setCurrentUser(user.id);  // ✅ Important
        this.currentUser.set(user);
      }
    }
  }

  private getUsers(): User[] {
    return this.storage.getGlobal<User[]>(USERS_KEY) ?? [];
  }

  private saveUsers(users: User[]): void {
    this.storage.saveGlobal(USERS_KEY, users);
  }

  register(data: {
    fullName: string;
    email: string;
    password: string;
  }): { success: boolean; message: string } {
    const users = this.getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );
    if (exists) {
      return { success: false, message: 'Email already registered.' };
    }
    const newUser: User = {
      id: this.uid(),
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: 'Registration successful.' };
  }

  login(
    email: string,
    password: string,
    remember: boolean
  ): { success: boolean; message: string } {
    const users = this.getUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // ✅ Set current user BEFORE anything else
    this.storage.setCurrentUser(user.id);

    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      loginAt: new Date().toISOString(),
    };
    if (remember) {
      this.storage.saveGlobal(SESSION_KEY, session);
    } else {
      this.storage.sessionSave(SESSION_KEY, session);
    }
    this.storage.saveGlobal(CURRENT_USER_KEY, user);
    this.currentUser.set(user);
    return { success: true, message: 'Login successful.' };
  }

  logout(): void {
    this.storage.deleteGlobal(SESSION_KEY);
    this.storage.sessionDelete(SESSION_KEY);
    this.storage.deleteGlobal(CURRENT_USER_KEY);
    this.storage.setCurrentUser(null);  // ✅ Clear user scope
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  updateProfile(updates: Partial<User>): void {
    const user = this.currentUser();
    if (!user) return;
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      this.saveUsers(users);
      this.currentUser.set(users[idx]);
      this.storage.saveGlobal(CURRENT_USER_KEY, users[idx]);
    }
  }

  changePassword(
    oldPw: string,
    newPw: string
  ): { success: boolean; message: string } {
    const user = this.currentUser();
    if (!user) return { success: false, message: 'Not logged in.' };
    if (user.password !== oldPw) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    this.updateProfile({ password: newPw });
    return { success: true, message: 'Password updated.' };
  }

  private uid(): string {
    return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now();
  }
}