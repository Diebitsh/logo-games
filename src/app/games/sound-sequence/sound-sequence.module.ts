import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundSequenceComponent } from './sound-sequence.component';



@NgModule({
  exports: [SoundSequenceComponent],
  declarations: [SoundSequenceComponent],
  imports: [
    CommonModule
  ]
})
export class SoundSequenceModule { }
