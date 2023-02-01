import { Component } from "@angular/core";
import { SimpleInnerSubscriber } from "rxjs/internal/innerSubscribe";

@Component({
    selector: 'app-loading-spinner',
    template: '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>',
    styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {

}