import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordConversionComponent } from './word-conversion.component';



@NgModule({
  exports: [WordConversionComponent],
  declarations: [WordConversionComponent],
  imports: [
    CommonModule
  ]
})
export class WordConversionModule { }
