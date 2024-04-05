import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatSoundComponent } from './what-sound.component';

@NgModule({
  declarations: [WhatSoundComponent],
  exports: [WhatSoundComponent],
  imports: [
    CommonModule
  ]
})
export class WhatSoundModule { }
