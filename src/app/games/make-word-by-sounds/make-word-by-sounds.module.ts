import { NgModule } from "@angular/core";
import { MakeWordBySoundsComponent } from "./make-word-by-sounds.component";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [CommonModule],
    exports: [MakeWordBySoundsComponent],
    declarations: [MakeWordBySoundsComponent],
    providers: [],
})
export class MakeWordBySoundsModule {}