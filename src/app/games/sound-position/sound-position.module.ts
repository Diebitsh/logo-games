import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundPositionComponent } from './sound-position.component';



@NgModule({
  exports: [SoundPositionComponent],
  declarations: [SoundPositionComponent],
  imports: [
    CommonModule
  ]
})
export class SoundPositionModule { }
