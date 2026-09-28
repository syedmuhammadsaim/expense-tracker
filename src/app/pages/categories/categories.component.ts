import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Category } from '../../core/models/category.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EmptyStateComponent,
    ModalComponent,
  ],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Categories</h1>
          <p class="muted">
            {{ filtered().length }} of {{ categories().length }} categories
          </p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">
          + Add Category
        </button>
      </div>

      <!-- ==================== FILTER BAR ==================== -->
      <div class="card filters">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            class="search"
            type="text"
            placeholder="Search by name or description…"
            [ngModel]="search()"
            (ngModelChange)="onSearchChange($event)"
          />
          <button
            *ngIf="search()"
            class="clear-x"
            type="button"
            (click)="onSearchChange('')"
          >
            ✕
          </button>
        </div>

        <select [ngModel]="typeFilter()" (ngModelChange)="onTypeChange($event)">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select [ngModel]="sort()" (ngModelChange)="onSortChange($event)">
          <option value="name-asc">Name (A → Z)</option>
          <option value="name-desc">Name (Z → A)</option>
          <option value="type-asc">Type (A → Z)</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <button
          class="btn btn-ghost"
          (click)="clearFilters()"
          [disabled]="!hasActiveFilters()"
        >
          Clear
        </button>
      </div>

      <!-- ==================== CHIPS ==================== -->
      <div class="chips" *ngIf="hasActiveFilters()">
        <span class="chips-label">Active filters:</span>
        <span class="chip" *ngIf="search()">
          Search: "{{ search() }}"
          <button type="button" (click)="onSearchChange('')">✕</button>
        </span>
        <span class="chip" *ngIf="typeFilter()">
          Type: {{ typeFilter() }}
          <button type="button" (click)="onTypeChange('')">✕</button>
        </span>
      </div>

      <!-- ==================== GRID ==================== -->
      <div *ngIf="filtered().length; else empty" class="grid">
        <div class="cat-card" *ngFor="let c of filtered()">
          <div class="cat-image">
            <img
              *ngIf="c.imageUrl; else emojiFallback"
              [src]="c.imageUrl"
              [alt]="c.name"
              loading="lazy"
              (error)="onImageError(c)"
            />
            <ng-template #emojiFallback>
              <span class="cat-icon">{{ c.icon }}</span>
            </ng-template>
          </div>
          <div class="cat-body">
            <h4>{{ c.name }}</h4>
            <span class="pill" [ngClass]="c.type">{{ c.type }}</span>
            <p *ngIf="c.description">{{ c.description }}</p>
          </div>
          <div class="cat-actions">
            <button class="icon-btn" (click)="edit(c)" title="Edit">✏️</button>
            <button class="icon-btn" (click)="confirmDelete(c)" title="Delete">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="card">
          <app-empty-state
            [icon]="hasActiveFilters() ? '🔍' : '🏷️'"
            [title]="
              hasActiveFilters() ? 'No matching categories' : 'No categories found'
            "
            [description]="
              hasActiveFilters()
                ? 'Try adjusting or clearing your filters.'
                : 'Create categories to organize your transactions.'
            "
            [actionLabel]="hasActiveFilters() ? 'Clear Filters' : 'Add Category'"
            (action)="hasActiveFilters() ? clearFilters() : openForm()"
          ></app-empty-state>
        </div>
      </ng-template>
    </div>

    <!-- ==================== FORM MODAL ==================== -->
    <app-modal
      *ngIf="showForm()"
      [title]="editingId() ? 'Edit Category' : 'Add Category'"
      [showFooter]="false"
      (close)="closeForm()"
    >
      <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
        <div class="field">
          <label>Name *</label>
          <input formControlName="name" placeholder="e.g., Food" />
          <small class="error" *ngIf="showError('name')">
            Name is required (min 2 chars).
          </small>
        </div>

        <div class="field">
          <label>Type *</label>
          <select formControlName="type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div class="field">
          <label>Emoji Icon</label>
          <input formControlName="icon" maxlength="4" placeholder="🍔" />
        </div>

        <div class="field"></div>

        <!-- ==================== IMAGE UPLOAD ==================== -->
        <div class="field full">
          <label>Category Image (optional)</label>

          <div class="upload-area">
            <!-- Preview -->
            <div class="upload-preview">
              <img
                *ngIf="previewUrl() && !previewError()"
                [src]="previewUrl()!"
                alt="Preview"
                (error)="previewError.set(true)"
              />
              <span *ngIf="!previewUrl() || previewError()" class="upload-emoji">
                {{ form.value.icon || '🏷️' }}
              </span>
            </div>

            <!-- Upload buttons -->
            <div class="upload-actions">
              <input
                type="file"
                accept="image/*"
                #catFileInput
                style="display: none"
                (change)="onFileSelected($event)"
              />
              <button
                type="button"
                class="btn btn-primary"
                (click)="catFileInput.click()"
              >
                📁 Choose Image
              </button>
              <button
                type="button"
                class="btn btn-ghost"
                *ngIf="previewUrl()"
                (click)="removeImage()"
              >
                🗑️ Remove
              </button>
              <small class="hint">JPG, PNG — max 2MB</small>
            </div>
          </div>
        </div>

        <div class="field full">
          <label>Description</label>
          <textarea formControlName="description" rows="2"></textarea>
        </div>

        <div class="field full actions">
          <button type="button" class="btn btn-ghost" (click)="closeForm()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingId() ? 'Update' : 'Save' }}
          </button>
        </div>
      </form>
    </app-modal>

    <!-- ==================== DELETE MODAL ==================== -->
    <app-modal
      *ngIf="deleteTarget()"
      title="Delete Category"
      confirmText="Delete"
      (close)="deleteTarget.set(null)"
      (confirm)="doDelete()"
    >
      Are you sure you want to delete
      <strong>"{{ deleteTarget()?.name }}"</strong>? This action cannot be undone.
    </app-modal>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
      }
      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
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
        padding: 16px;
      }

      /* ==================== FILTERS ==================== */
      .filters {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr auto;
        gap: 10px;
        align-items: center;
      }
      @media (max-width: 800px) {
        .filters {
          grid-template-columns: 1fr;
        }
      }
      .search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.9rem;
        opacity: 0.6;
        pointer-events: none;
      }
      .search {
        width: 100%;
        padding: 9px 34px 9px 36px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-size: 0.9rem;
        outline: none;
      }
      .search:focus {
        border-color: var(--primary);
      }
      .clear-x {
        position: absolute;
        right: 10px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text-muted);
        font-size: 0.85rem;
        padding: 4px;
      }
      .filters select {
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-size: 0.9rem;
        cursor: pointer;
        outline: none;
      }
      .filters select:focus {
        border-color: var(--primary);
      }
      .filters .btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ==================== CHIPS ==================== */
      .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 0 4px;
      }
      .chips-label {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: var(--primary-soft);
        color: var(--primary);
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      .chip button {
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 0.75rem;
        padding: 0;
      }

      /* ==================== GRID ==================== */
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 14px;
      }
      .cat-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
        display: flex;
        gap: 14px;
        align-items: center;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .cat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      }
      .cat-image {
        width: 64px;
        height: 64px;
        border-radius: 14px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--primary-soft);
        display: grid;
        place-items: center;
        border: 1px solid var(--border);
      }
      .cat-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .cat-icon {
        font-size: 2rem;
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
      }
      .cat-body {
        flex: 1;
        min-width: 0;
      }
      .cat-body h4 {
        margin: 0 0 6px;
        color: var(--text);
        font-size: 1rem;
        word-break: break-word;
      }
      .cat-body p {
        margin: 6px 0 0;
        font-size: 0.78rem;
        color: var(--text-muted);
        word-break: break-word;
        line-height: 1.4;
      }
      .pill {
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 0.7rem;
        text-transform: capitalize;
        font-weight: 500;
      }
      .pill.income {
        background: #dcfce7;
        color: #166534;
      }
      .pill.expense {
        background: #fee2e2;
        color: #991b1b;
      }
      .cat-actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex-shrink: 0;
      }

      /* ==================== FORM ==================== */
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
      .field input,
      .field select,
      .field textarea {
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        border-color: var(--primary);
      }
      .error {
        color: #dc2626;
        font-size: 0.78rem;
      }
      .hint {
        color: var(--text-muted);
        font-size: 0.75rem;
        line-height: 1.4;
      }
      .actions {
        flex-direction: row;
        justify-content: flex-end;
        gap: 8px;
      }

      /* ==================== UPLOAD AREA ==================== */
      .upload-area {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px;
        border: 2px dashed var(--border);
        border-radius: 12px;
        background: var(--bg);
        flex-wrap: wrap;
      }
      .upload-preview {
        width: 70px;
        height: 70px;
        border-radius: 14px;
        overflow: hidden;
        background: var(--primary-soft);
        display: grid;
        place-items: center;
        border: 2px solid var(--surface);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        flex-shrink: 0;
      }
      .upload-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .upload-emoji {
        font-size: 2rem;
      }
      .upload-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
        min-width: 160px;
      }
      .upload-actions .btn {
        width: fit-content;
      }

      /* ==================== MOBILE ==================== */
      @media (max-width: 600px) {
        .grid {
          grid-template-columns: 1fr;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .cat-image {
          width: 56px;
          height: 56px;
        }
        .cat-body h4 {
          font-size: 0.95rem;
        }
        .page-head h1 {
          font-size: 1.2rem;
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
      }
    `,
  ],
})
export class CategoriesComponent {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  categories = this.categoryService.categories;

  search = signal('');
  typeFilter = signal<'' | 'income' | 'expense'>('');
  sort = signal<'name-asc' | 'name-desc' | 'type-asc' | 'newest' | 'oldest'>(
    'name-asc'
  );

  showForm = signal(false);
  editingId = signal<string | null>(null);
  deleteTarget = signal<Category | null>(null);

  previewUrl = signal<string | null>(null);
  previewError = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['expense' as 'expense' | 'income', Validators.required],
    icon: ['🏷️'],
    imageUrl: [''],
    description: [''],
  });

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const typeF = this.typeFilter();
    const sortBy = this.sort();

    const list = this.categories().filter((c) => {
      if (typeF && c.type !== typeF) return false;
      if (q) {
        const hay = `${c.name} ${c.description ?? ''} ${c.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'type-asc':
        sorted.sort(
          (a, b) =>
            a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
        );
        break;
      case 'newest':
        sorted.sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );
        break;
      case 'oldest':
        sorted.sort(
          (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
        );
        break;
    }
    return sorted;
  });

  hasActiveFilters(): boolean {
    return !!this.search().trim() || !!this.typeFilter();
  }

  onSearchChange(v: string): void {
    this.search.set(v ?? '');
  }
  onTypeChange(v: string): void {
    this.typeFilter.set((v ?? '') as '' | 'income' | 'expense');
  }
  onSortChange(v: string): void {
    this.sort.set((v ?? 'name-asc') as any);
  }

  clearFilters(): void {
    this.search.set('');
    this.typeFilter.set('');
    this.sort.set('name-asc');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toast.error('Image must be smaller than 2MB.');
      input.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select a valid image file.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.previewError.set(false);
      this.previewUrl.set(base64);
      this.form.patchValue({ imageUrl: base64 });
    };
    reader.onerror = () => {
      this.toast.error('Failed to read image. Try again.');
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  removeImage(): void {
    this.previewUrl.set(null);
    this.previewError.set(false);
    this.form.patchValue({ imageUrl: '' });
  }

  onImageError(c: Category): void {
    this.categoryService.update(c.id, { imageUrl: undefined });
  }

  openForm(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      type: 'expense',
      icon: '🏷️',
      imageUrl: '',
      description: '',
    });
    this.previewUrl.set(null);
    this.previewError.set(false);
    this.showForm.set(true);
  }

  edit(c: Category): void {
    this.editingId.set(c.id);
    this.form.reset({
      name: c.name,
      type: c.type,
      icon: c.icon,
      imageUrl: c.imageUrl ?? '',
      description: c.description ?? '',
    });
    this.previewUrl.set(c.imageUrl ?? null);
    this.previewError.set(false);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.previewUrl.set(null);
    this.previewError.set(false);
  }

  showError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      imageUrl: raw.imageUrl?.trim() || undefined,
    };
    const id = this.editingId();
    if (id) {
      this.categoryService.update(id, payload);
      this.toast.success('Category updated.');
    } else {
      this.categoryService.add(payload);
      this.toast.success('Category added.');
    }
    this.closeForm();
  }

  confirmDelete(c: Category): void {
    this.deleteTarget.set(c);
  }

  doDelete(): void {
    const c = this.deleteTarget();
    if (!c) return;
    this.categoryService.delete(c.id);
    this.toast.success('Category deleted.');
    this.deleteTarget.set(null);
  }
}