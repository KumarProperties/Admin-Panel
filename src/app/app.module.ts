import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BackendService } from './services/api/backend.service';
import { IndexInterceptor } from './services/api/index.interceptor';

import { LoaderComponent } from './components/shared/loader/loader.component';
import { ImageComponent } from './components/shared/image/image.component';

import { LoginComponent } from './components/login/login.component';
import { ContainerComponent } from './components/container/container.component';
import { ActivityComponent } from './components/activity/activity.component';
import { BlogsComponent } from './components/blogs/blogs.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { TestimonialComponent } from './components/testimonial/testimonial.component';
import { TrendingComponent } from './components/trending/trending.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ContainerComponent,
    LoaderComponent,
    ImageComponent,
    ActivityComponent,
    BlogsComponent,
    ProjectsComponent,
    TestimonialComponent,
    TrendingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  providers: [
    BackendService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: IndexInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
