import { DatePipe, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { MemoriesApi } from '../memories-api'
import { Memory, MemoryPayload } from '../memory';
@Component({
  imports: [FormsModule, DatePipe],
  selector: 'app-memory-keeper',
  styleUrl: './memory-keeper.css',
  templateUrl: './memory-keeper.html',
})
export class MemoryKeeper {
  private readonly api = inject(MemoriesApi);
  private readonly platformId = inject(PLATFORM_ID);

  memories=  signal<any[]>([]);
  loading = true;
  saving = false;
  error = '';
  success = '';
  editingId: string | null = null;

  form = this.emptyForm();

  private emptyForm() {
    return {
      title: '',
      personName: '',
      relationship: '',
      story: '',
      favoriteThings: '',
      memoryDate: '',
    };
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMemories();
    }
  }

  loadMemories(): void {
    this.loading = true;
    this.error = '';

    this.api.getAll().subscribe({
      next: (memories) => {
        this.memories.set(memories);
        this.loading = false;
      },
      error: (err: unknown) => {
        this.error = this.getError(err);
        this.loading = false;
      },
    });
  }

  saveMemory(): void {
    if (this.saving) return;

    const payload: MemoryPayload = {
      title: this.form.title.trim(),
      personName: this.form.personName.trim(),
      relationship: this.form.relationship.trim(),
      story: this.form.story.trim(),
      favoriteThings: this.form.favoriteThings
        .split(',')
        .map((thing) => thing.trim())
        .filter(Boolean),
      ...(this.form.memoryDate
        ? { memoryDate: this.form.memoryDate }
        : {}),
    };

    this.saving = true;
    this.error = '';
    this.success = '';

    const request = this.editingId
      ? this.api.update(this.editingId, payload)
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.success = this.editingId
          ? 'Your memory has been updated.'
          : 'Your memory has been saved.';

        this.resetForm();
        this.loadMemories();
        this.saving = false;
      },
      error: (err: unknown) => {
        this.error = this.getError(err);
        this.saving = false;
      },
    });
  }

  editMemory(memory: Memory): void {
    this.editingId = memory._id;

    this.form = {
      title: memory.title,
      personName: memory.personName,
      relationship: memory.relationship ?? '',
      story: memory.story,
      favoriteThings: memory.favoriteThings.join(', '),
      memoryDate: memory.memoryDate
        ? memory.memoryDate.slice(0, 10)
        : '',
    };

    this.error = '';
    this.success = '';

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  deleteMemory(memory: Memory): void {
    if (typeof window === 'undefined') return;

    const confirmed = window.confirm(
      `Delete "${memory.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    this.error = '';
    this.success = '';

    this.api.delete(memory._id).subscribe({
      next: () => {
        this.memories.set(
          this.memories().filter((item) => item._id !== memory._id) 
        );

        if (this.editingId === memory._id) {
          this.resetForm();
        }

        this.success = 'Memory deleted.';
      },
      error: (err: unknown) => {
        this.error = this.getError(err);
      },
    });
  }

  resetForm(): void {
    this.form = this.emptyForm();
    this.editingId = null;
  }

  private getError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message
        ?? 'Something went wrong. Please try again.';
    }

    return 'Unable to complete the request. Please try again.';
  }
}
