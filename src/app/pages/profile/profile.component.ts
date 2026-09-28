import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="page">
      <div class="page-head">
        <h1>Profile</h1>
        <p class="muted">Manage your personal information</p>
      </div>

      <!-- ==================== PROFILE CARD ==================== -->
      <div class="card profile-card">
        <div class="avatar">
          <img
            *ngIf="form.value.profileImage && !imageError()"
            [src]="form.value.profileImage"
            alt="avatar"
            (error)="imageError.set(true)"
          />
          <span *ngIf="!form.value.profileImage || imageError()">
            {{ initials() }}
          </span>
        </div>
        <div class="profile-info">
          <h3>{{ auth.currentUser()?.fullName }}</h3>
          <p>{{ auth.currentUser()?.email }}</p>
          <p class="muted">
            Member since {{ auth.currentUser()?.createdAt | date: 'mediumDate' }}
          </p>
        </div>
      </div>

      <!-- ==================== EDIT PROFILE ==================== -->
      <div class="card">
        <h3>Edit Profile</h3>
        <form [formGroup]="form" (ngSubmit)="saveProfile()" class="form-grid">
          <!-- ==================== IMAGE UPLOAD ==================== -->
          <div class="field full">
            <label>Profile Picture</label>

            <div class="upload-area">
              <!-- Preview -->
              <div class="upload-preview">
                <img
                  *ngIf="previewImage() && !imageError()"
                  [src]="previewImage()!"
                  alt="Preview"
                  (error)="imageError.set(true)"
                />
                <span *ngIf="!previewImage() || imageError()">
                  {{ initials() }}
                </span>
              </div>

              <!-- Upload buttons -->
              <div class="upload-actions">
                <input
                  type="file"
                  accept="image/*"
                  #fileInput
                  style="display: none"
                  (change)="onFileSelected($event)"
                />
                <button
                  type="button"
                  class="btn btn-primary"
                  (click)="fileInput.click()"
                >
                  📁 Choose Image
                </button>
                <button
                  type="button"
                  class="btn btn-ghost"
                  *ngIf="previewImage()"
                  (click)="removeImage()"
                >
                  🗑️ Remove
                </button>
                <small class="hint">
                  JPG, PNG, GIF — max 2MB
                </small>
              </div>
            </div>
          </div>

          <!-- Sample avatars -->
          <div class="field full">
            <label>Or pick a sample avatar</label>
            <div class="sample-avatars">
              <button
                type="button"
                *ngFor="let url of sampleAvatars"
                class="sample-avatar"
                (click)="pickAvatar(url)"
                title="Use this avatar"
              >
                <img [src]="url" alt="avatar sample" loading="lazy" />
              </button>
            </div>
          </div>

          <div class="field">
            <label>Full Name *</label>
            <input formControlName="fullName" />
            <small class="error" *ngIf="showError('fullName')">
              Required (min 2 chars).
            </small>
          </div>
          <div class="field">
            <label>Email *</label>
            <input formControlName="email" />
            <small class="error" *ngIf="showError('email')">
              Valid email required.
            </small>
          </div>
          <div class="field">
            <label>Phone</label>
            <input formControlName="phone" placeholder="+92 300 1234567" />
          </div>
          <div class="field full">
            <label>Address</label>
            <input
              formControlName="address"
              placeholder="Street, City, Country"
            />
          </div>
          <div class="field full actions">
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>

      <!-- ==================== CHANGE PASSWORD ==================== -->
      <div class="card">
        <h3>Security</h3>
        <div class="row">
          <div>
            <strong>Change Password</strong>
            <p class="muted">Update your account password</p>
          </div>
          <button class="btn btn-ghost" (click)="showPwModal.set(true)">
            Change Password
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== PASSWORD MODAL ==================== -->
    <app-modal
      *ngIf="showPwModal()"
      title="Change Password"
      [showFooter]="false"
      (close)="closePwModal()"
    >
      <form [formGroup]="pwForm" (ngSubmit)="changePassword()" class="form-grid">
        <div class="field full">
          <label>Current Password</label>
          <input type="password" formControlName="oldPw" />
        </div>
        <div class="field full">
          <label>New Password</label>
          <input type="password" formControlName="newPw" />
          <small
            class="error"
            *ngIf="pwForm.get('newPw')?.touched && pwForm.get('newPw')?.invalid"
          >
            Min 6 characters.
          </small>
        </div>
        <div class="field full">
          <label>Confirm New Password</label>
          <input type="password" formControlName="confirm" />
        </div>
        <div class="field full actions">
          <button type="button" class="btn btn-ghost" (click)="closePwModal()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [
    `
      /* ============================================================
         PAGE
         ============================================================ */
      .page {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        max-width: 100%;
      }
      .page-head h1 {
        margin: 0;
        font-size: 1.4rem;
        color: var(--text);
      }
      .muted {
        color: var(--text-muted);
        margin: 4px 0 0;
        font-size: 0.88rem;
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        width: 100%;
      }
      .card h3 {
        margin: 0 0 16px;
        font-size: 1rem;
        color: var(--text);
      }

      /* ============================================================
         PROFILE HEADER
         ============================================================ */
      .profile-card {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      .avatar {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: var(--primary);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 1.8rem;
        font-weight: 700;
        overflow: hidden;
        border: 3px solid var(--border);
        flex-shrink: 0;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .profile-info {
        flex: 1;
        min-width: 0;
      }
      .profile-info h3 {
        margin: 0 0 4px;
        color: var(--text);
        font-size: 1.15rem;
      }
      .profile-info p {
        margin: 4px 0 0;
        color: var(--text-muted);
        font-size: 0.9rem;
        word-break: break-word;
      }

      /* ============================================================
         UPLOAD AREA
         ============================================================ */
      .upload-area {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 16px;
        border: 2px dashed var(--border);
        border-radius: 12px;
        background: var(--bg);
        flex-wrap: wrap;
      }
      .upload-preview {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background: var(--primary);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 1.6rem;
        font-weight: 700;
        overflow: hidden;
        border: 3px solid var(--surface);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }
      .upload-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .upload-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        min-width: 180px;
      }
      .upload-actions .btn {
        width: fit-content;
      }
      .hint {
        color: var(--text-muted);
        font-size: 0.75rem;
      }

      /* ============================================================
         FORM
         ============================================================ */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field label {
        font-size: 0.85rem;
        color: var(--text);
      }
      .field input {
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
      }
      .field input:focus {
        border-color: var(--primary);
      }
      .error {
        color: #dc2626;
        font-size: 0.78rem;
      }
      .actions {
        flex-direction: row;
        justify-content: flex-end;
      }

      /* ============================================================
         SAMPLE AVATARS
         ============================================================ */
      .sample-avatars {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
        gap: 8px;
        margin-top: 4px;
      }
      .sample-avatar {
        padding: 0;
        border: 2px solid var(--border);
        border-radius: 50%;
        overflow: hidden;
        background: var(--primary-soft);
        cursor: pointer;
        transition: all 0.15s;
        aspect-ratio: 1;
        width: 100%;
      }
      .sample-avatar:hover {
        border-color: var(--primary);
        transform: scale(1.08);
      }
      .sample-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      /* ============================================================
         SECURITY ROW
         ============================================================ */
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .row strong {
        color: var(--text);
        font-size: 0.95rem;
      }
      .row p {
        margin: 4px 0 0;
        font-size: 0.82rem;
      }

      /* ============================================================
         MOBILE
         ============================================================ */
      @media (max-width: 600px) {
        .profile-card {
          flex-direction: column;
          text-align: center;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .upload-area {
          flex-direction: column;
          text-align: center;
        }
        .upload-actions {
          align-items: center;
          width: 100%;
        }
        .upload-actions .btn {
          width: 100%;
        }
        .row {
          flex-direction: column;
          align-items: flex-start;
        }
        .row .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class ProfileComponent {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  showPwModal = signal(false);
  imageError = signal(false);
  previewImage = signal<string | null>(
    this.auth.currentUser()?.profileImage ?? null
  );

  sampleAvatars = [
    'https://picsum.photos/seed/avatar1/200',
    'https://picsum.photos/seed/avatar2/200',
    'https://picsum.photos/seed/avatar3/200',
    'https://picsum.photos/seed/avatar4/200',
    'https://picsum.photos/seed/avatar5/200',
    'https://picsum.photos/seed/avatar6/200',
    'https://picsum.photos/seed/avatar7/200',
    'https://picsum.photos/seed/avatar8/200',
  ];

  form = this.fb.nonNullable.group({
    fullName: [
      this.auth.currentUser()?.fullName ?? '',
      [Validators.required, Validators.minLength(2)],
    ],
    email: [
      this.auth.currentUser()?.email ?? '',
      [Validators.required, Validators.email],
    ],
    phone: [this.auth.currentUser()?.phone ?? ''],
    address: [this.auth.currentUser()?.address ?? ''],
    profileImage: [this.auth.currentUser()?.profileImage ?? ''],
  });

  pwForm = this.fb.nonNullable.group({
    oldPw: ['', Validators.required],
    newPw: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });

  initials(): string {
    const name = this.auth.currentUser()?.fullName ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  }

  showError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  // ============================================================
  // FILE UPLOAD — Convert to Base64 and store
  // ============================================================
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toast.error('Image must be smaller than 2MB.');
      input.value = '';
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select a valid image file.');
      input.value = '';
      return;
    }

    // Read as DataURL (base64)
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imageError.set(false);
      this.previewImage.set(base64);
      this.form.patchValue({ profileImage: base64 });
      this.toast.success('Image selected. Click Save to apply.');
    };
    reader.onerror = () => {
      this.toast.error('Failed to read image. Try again.');
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    input.value = '';
  }

  pickAvatar(url: string): void {
    this.imageError.set(false);
    this.previewImage.set(url);
    this.form.patchValue({ profileImage: url });
  }

  removeImage(): void {
    this.previewImage.set(null);
    this.imageError.set(false);
    this.form.patchValue({ profileImage: '' });
  }

  // ============================================================
  // SAVE
  // ============================================================
  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.auth.updateProfile({
      ...raw,
      profileImage: raw.profileImage?.trim() || undefined,
    });
    this.imageError.set(false);
    this.toast.success('Profile updated.');
  }

  closePwModal(): void {
    this.showPwModal.set(false);
    this.pwForm.reset({ oldPw: '', newPw: '', confirm: '' });
  }

  changePassword(): void {
    if (this.pwForm.invalid) {
      this.pwForm.markAllAsTouched();
      return;
    }
    const { oldPw, newPw, confirm } = this.pwForm.getRawValue();
    if (newPw !== confirm) {
      this.toast.error('Passwords do not match.');
      return;
    }
    const res = this.auth.changePassword(oldPw, newPw);
    if (!res.success) {
      this.toast.error(res.message);
      return;
    }
    this.toast.success(res.message);
    this.closePwModal();
  }
}