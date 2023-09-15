import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Login {
  email: string;
  password: string;
}

interface LoginResponse {
  mes: string;
  data: {
    token: string;
  };
}

interface UploadFile {
  files: File[];
}

interface UploadFileResponse {
  mes: string;
  data: string[];
}

@Injectable()
export class BackendService {
  api: any = {
    login: '/auth/login',
    upload: '/files/upload',
    activity: '/activity',
    projects: '/apartment',
    blogs: '/blogs',
    locations: '/apartment/apt_locations',
    trendingAdd: '/trending/apartment/single',
    trending: '/trending/apartment',
  };

  noIntercept = {
    headers: { 'no-intercept': '1' },
  };

  constructor(private http: HttpClient) {}

  login(body: Login): Observable<LoginResponse | any> {
    return this.http.post(this.api.login, body, this.noIntercept);
  }

  upload(body: FormData | UploadFile): Observable<UploadFileResponse | any> {
    return this.http.post(this.api.upload, body, this.noIntercept);
  }

  deleteFiles(body: string[]): any {
    return this.http.delete(
      this.api.upload + `?${body.map((url) => 'url=' + url).join('&')}`
    );
  }

  getActivities(type: string) {
    return this.http.get(this.api.activity + '?type=' + type);
  }

  addActivity(body: any) {
    return this.http.post(this.api.activity, body);
  }
  updateActivity({ _id, ...body }: any) {
    return this.http.put(this.api.activity + '/' + _id, body);
  }
  deleteActivity(activityId: any) {
    return this.http.delete(this.api.activity + '/' + activityId);
  }

  getProjects() {
    return this.http.get(this.api.projects);
  }

  getLocations() {
    return this.http.get(this.api.locations);
  }

  addProject(body: any) {
    return this.http.post(this.api.projects, body);
  }

  deleteProject(projectId: any) {
    return this.http.delete(this.api.projects + '/' + projectId);
  }

  updateProject({ _id, ...body }: any) {
    return this.http.put(this.api.projects + '/' + _id, body);
  }

  getBlogs() {
    return this.http.get(this.api.blogs);
  }

  deleteBlog(blogId: any) {
    return this.http.delete(this.api.blogs + '/' + blogId);
  }

  updateBlog(body: any) {
    return this.http.post(this.api.blogs, body);
  }
  addTrendingAppart(id: any) {
    return this.http.post(this.api.trendingAdd, { ids: [id] });
  }
  deleteTrendingAppart(id: any) {
    return this.http.delete(this.api.trendingAdd, { body: { ids: [id] } });
  }
  getTrendingAppart() {
    return this.http.get(this.api.trending);
  }
  updateTrendingAppart(id: any[]) {
    return this.http.post(this.api.trending, { ids: id });
  }
}
