import { Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  ApiResponse,
  Memory,
  MemoryPayload,
} from './memory';

@Service()
export class MemoriesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/memories';

  getAll(): Observable<Memory[]> {
    return this.http
      .get<ApiResponse<Memory[]>>(this.baseUrl)
      .pipe(map((response) => response.data));
  }

  create(payload: MemoryPayload): Observable<Memory> {
    return this.http
      .post<ApiResponse<Memory>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: Partial<MemoryPayload>): Observable<Memory> {
    return this.http
      .patch<ApiResponse<Memory>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
