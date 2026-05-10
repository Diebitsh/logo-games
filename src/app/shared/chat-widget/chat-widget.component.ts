import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Channel {
  name: string;
  icon: string;
  url: string;
  color: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss',
})
export class ChatWidgetComponent {
  open = signal(false);
  submitted = signal(false);

  channels: Channel[] = [
    { name: 'ВКонтакте', icon: 'fi-brands-vk', url: 'https://vk.com/logogames_support', color: '#0077FF' },
    { name: 'MAX', icon: 'fi-rr-comment-alt', url: 'https://max.ru/logogames', color: '#1D7CFA' },
    { name: 'imo', icon: 'fi-rr-comment-dots', url: 'https://imo.im/logogames', color: '#00C2FF' },
    { name: 'E-mail', icon: 'fi-rr-envelope', url: 'mailto:support@logogames.app', color: '#ec4899' },
  ];

  toggle(): void {
    this.open.update((v) => !v);
    if (!this.open()) {
      this.submitted.set(false);
    }
  }

  requestCallback(): void {
    this.submitted.set(true);
  }
}
