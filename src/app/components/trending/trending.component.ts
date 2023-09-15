import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/api/backend.service';
import {
  alertErrorHandler,
  alertModalWithoutConfirm,
} from 'src/app/helpers/alert';
@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.scss'],
})
export class TrendingComponent {
  projectData!: any[];
  constructor(private api: BackendService) {}

  ngOnInit() {
    this.getProjects()
  }
  deleteProject(id: any) {
    console.log(id);
    this.api.deleteTrendingAppart(id).subscribe({
      next: () =>
        alertModalWithoutConfirm('success', 'Project deleted successfully'),
      error: alertErrorHandler,

      complete: () => {
        this.getProjects()
      },
    });
  }
  moveArrayUp(index: number) {
    console.log(index);
    if (index > 0) {
      const temp = this.projectData[index];
      console.log(temp);
      this.projectData[index] = this.projectData[index - 1];
      this.projectData[index - 1] = temp;
    }
  }

  moveArrayDown(index: number) {
    if (index < this.projectData.length - 1) {
      const temp = this.projectData[index];
      this.projectData[index] = this.projectData[index + 1];
      this.projectData[index + 1] = temp;
      console.log(temp);

    }
  }
  getProjects(){
    this.api.getTrendingAppart().subscribe((res: any) => {
      console.log(res);
      this.projectData = res.data.apartments;
      console.log(this.projectData);
    });
  }

  updateProjects(){
    const updatedOrder = this.projectData.map(item => item._id);
    console.log(updatedOrder);
    this.api.updateTrendingAppart(updatedOrder).subscribe({
      next: () =>alertModalWithoutConfirm('success', 'Project Updated successfully'),
      error: alertErrorHandler,
      complete: () => this.getProjects()
    })

  }
}
