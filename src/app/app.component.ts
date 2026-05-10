import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from './shared/chat-widget/chat-widget.component';
import { AccessibilityToolbarComponent } from './shared/accessibility/accessibility-toolbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ChatWidgetComponent,
    AccessibilityToolbarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'LogoGames';
  mobileMenuOpen = signal(false);

  toggleMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
