import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrl: './get-started.component.scss'
})
export class GetStartedComponent implements OnInit {

  ngOnInit(): void {
    
		document.body.className = "image-back";
  }
}
