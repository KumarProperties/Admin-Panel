import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { ContainerComponent } from './components/container/container.component';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

import { ActivityComponent } from './components/activity/activity.component';
import { BlogsComponent } from './components/blogs/blogs.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { TestimonialComponent } from './components/testimonial/testimonial.component';
import { TrendingComponent } from './components/trending/trending.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: ContainerComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'activity/:param',
        component: ActivityComponent,
      },
      {
        path: 'blogs',
        component: BlogsComponent,
      },
      {
        path: 'projects',
        component: ProjectsComponent,
      },
      {
        path:'testimonials',
        component:TestimonialComponent
      },
      {
        path:'trending',
        component:TrendingComponent
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
