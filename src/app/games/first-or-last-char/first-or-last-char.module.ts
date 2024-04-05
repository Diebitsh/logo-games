import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstOrLastCharComponent } from './first-or-last-char.component';



@NgModule({
  declarations: [FirstOrLastCharComponent],
  exports: [FirstOrLastCharComponent],
  imports: [
    CommonModule
  ]
})
export class FirstOrLastCharModule { }
