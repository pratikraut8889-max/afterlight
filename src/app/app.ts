import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { inject } from "@vercel/analytics"

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  ngOnInit() {
    inject();
  }
}
