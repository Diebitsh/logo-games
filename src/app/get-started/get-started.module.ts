import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetStartedComponent } from './get-started.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [GetStartedComponent],
  exports: [GetStartedComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class GetStartedModule { }
