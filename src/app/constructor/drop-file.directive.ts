import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDropFile]',
  standalone: true,
  host: {
    class: 'drop-zone',
    '[class.drag-over]': 'isOver',
  },
})
export class DropFileDirective {
  @Input() accept = '';
  @Output() fileSelected = new EventEmitter<File>();

  isOver = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('dragover', ['$event'])
  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.isOver = true;
  }

  @HostListener('dragleave')
  onDragLeave(): void {
    this.isOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.isOver = false;
    const file = ev.dataTransfer?.files?.[0];
    if (file && this.matches(file)) this.fileSelected.emit(file);
  }

  @HostListener('click')
  onClick(): void {
    const input = document.createElement('input');
    input.type = 'file';
    if (this.accept) input.accept = this.accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file && this.matches(file)) this.fileSelected.emit(file);
    };
    input.click();
  }

  private matches(file: File): boolean {
    if (!this.accept) return true;
    const list = this.accept.split(',').map((s) => s.trim().toLowerCase());
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return list.some((pat) => {
      if (pat.startsWith('.')) return name.endsWith(pat);
      if (pat.endsWith('/*')) return type.startsWith(pat.slice(0, -1));
      return type === pat;
    });
  }
}
