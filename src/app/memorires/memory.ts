
export interface Memory {
  _id: string;
  title: string;
  personName: string;
  relationship?: string;
  story: string;
  favoriteThings: string[];
  memoryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemoryPayload {
  title: string;
  personName: string;
  relationship?: string;
  story: string;
  favoriteThings: string[];
  memoryDate?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
