import { NgModule } from "@angular/core";
import { PhonemeAnalysisComponent } from "./phoneme-analysis.component";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [PhonemeAnalysisComponent],
    declarations: [PhonemeAnalysisComponent],
    providers: [],
})
export class PhonemeAnalysisModule {}