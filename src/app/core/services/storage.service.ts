import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private prefix = 'et_';

  // ============================================================
  // Current user ID (set by AuthService on login/logout)
  // ============================================================
  private currentUserId: string | null = null;

  setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
  }

  getCurrentUser(): string | null {
    return this.currentUserId;
  }

  // ============================================================
  // Scoped key — automatically adds user id
  // ============================================================
  private scopedKey(key: string): string {
    const uid = this.currentUserId;
    return uid ? `${this.prefix}${key}_${uid}` : `${this.prefix}${key}`;
  }

  private rawKey(key: string): string {
    return this.prefix + key;
  }

  // ============================================================
  // USER-SCOPED methods (data isolation per user)
  // ============================================================
  save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.scopedKey(key), JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.scopedKey(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      console.warn('LocalStorage read failed', e);
      return null;
    }
  }

  update<T>(key: string, value: T): void {
    this.save(key, value);
  }

  delete(key: string): void {
    localStorage.removeItem(this.scopedKey(key));
  }

  // ============================================================
  // GLOBAL methods (for users list, currentUser, etc.)
  // ============================================================
  saveGlobal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.rawKey(key), JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  getGlobal<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.rawKey(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      return null;
    }
  }

  deleteGlobal(key: string): void {
    localStorage.removeItem(this.rawKey(key));
  }

  // ============================================================
  // SESSION storage
  // ============================================================
  sessionSave<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(this.scopedKey(key), JSON.stringify(value));
    } catch {}
  }

  sessionGet<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(this.scopedKey(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  sessionDelete(key: string): void {
    sessionStorage.removeItem(this.scopedKey(key));
  }

  // ============================================================
  // Clear ALL data of current user
  // ============================================================
  clearUserData(): void {
    const uid = this.currentUserId;
    if (!uid) return;
    const suffix = `_${uid}`;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix) && k.endsWith(suffix))
      .forEach((k) => localStorage.removeItem(k));
  }

  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => localStorage.removeItem(k));
  }
}