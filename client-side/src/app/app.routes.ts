import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

@Component({
    selector: 'app-empty-route',
    template: '<div>Route is not exist.</div>',
})
export class EmptyRouteComponent {}

const routes: Routes = [
    { path: '**', component: EmptyRouteComponent }
];


@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }