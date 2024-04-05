import { NgModule } from "@angular/core";
import { PhonemicAwarenessComponent } from "./phonemic-awareness.component";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [PhonemicAwarenessComponent],
    declarations: [PhonemicAwarenessComponent],
    providers: [],
})
export class PhonemicAwarenessModule {}