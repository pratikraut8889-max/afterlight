import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./memorires/memory-keeper/memory-keeper').then((m) => m.MemoryKeeper),
    }
];
