import { Component, OnDestroy, computed, inject, input, output, signal } from '@angular/core';
import { CustomGamesService } from '../custom-games.service';
import { CustomGameAsset } from '../custom-game.model';
import { DropFileDirective } from '../drop-file.directive';

@Component({
  selector: 'app-asset-drop',
  standalone: true,
  imports: [DropFileDirective],
  templateUrl: './asset-drop.component.html',
  styleUrl: './asset-drop.component.scss',
})
export class AssetDropComponent implements OnDestroy {
  private store = inject(CustomGamesService);

  /** 'image' — только файл; 'audio' — файл + запись с микрофона. */
  kind = input.required<'image' | 'audio'>();
  /** Подсказка под зоной загрузки. */
  hint = input('');
  /** Текущее значение (data-URL ассет). */
  value = input<CustomGameAsset | undefined>(undefined);

  changed = output<CustomGameAsset>();

  accept = computed(() => (this.kind() === 'image' ? 'image/*' : 'audio/*'));

  recording = signal(false);
  recError = signal<string | null>(null);
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: BlobPart[] = [];

  async onFile(file: File): Promise<void> {
    const asset = await this.store.fileToAsset(file);
    this.changed.emit(asset);
  }

  async toggleRecord(): Promise<void> {
    if (this.recording()) {
      this.recorder?.stop();
      return;
    }
    this.recError.set(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream = stream;
      this.chunks = [];
      this.recorder = new MediaRecorder(stream);
      this.recorder.ondataavailable = (e) => this.chunks.push(e.data);
      this.recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
        this.recording.set(false);
        const blob = new Blob(this.chunks, { type: this.recorder?.mimeType || 'audio/webm' });
        const file = new File([blob], `запись-${Date.now()}.webm`, { type: blob.type });
        await this.onFile(file);
        this.recorder = null;
      };
      this.recorder.start();
      this.recording.set(true);
    } catch {
      this.recError.set('Не удалось получить доступ к микрофону. Загрузите файл.');
    }
  }

  ngOnDestroy(): void {
    if (this.recording()) this.recorder?.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
  }
}
