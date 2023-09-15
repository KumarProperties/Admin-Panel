import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {
  alertErrorHandler,
  alertModal,
  alertModalWithoutConfirm,
} from 'src/app/helpers/alert';
import { BackendService } from 'src/app/services/api/backend.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
interface Activity {
  _id?: string;
  title: string;
  sub_title: string;
  date: {
    start_date: string;
    end_date: string;
    dates: string[];
  };
  files: string[];
  thumb: string;
  location: string;
  desc: string | undefined;
  address: string;
  redirection_link: string;
  share_link: string;
  related_to_project: string;
}
@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.scss']
})
export class TestimonialComponent {
  isLoading = false;

  activities: Activity[] = [];
  activityForm!: FormGroup;
  activityType = 'TESTIMONIAL';
  videoLink="https://www.youtube.com/embed/"
  activityTypes = Object.values(this.activityType);
safeUrl!: SafeResourceUrl;
  constructor(private formBuilder: FormBuilder, public api: BackendService,private sanitizer: DomSanitizer) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoLink);
  }

  ngOnInit() {
    this.initializeForm();
    this.getActivities(this.activityType);

  }

  initializeForm() {
    this.activityForm = this.formBuilder.group({
      _id: [''],
      title: ['', Validators.required],
      sub_title: ['',],
      type: [this.activityType, Validators.required],
      location: ['', Validators.required],
      date: this.formBuilder.group({
        start_date: ['', Validators.required],
        end_date: [''],
        dates: this.formBuilder.array([]),
      }),
      files: this.formBuilder.array([]),
      thumb: [''],
      desc: '',
      address: '',
      redirection_link: '',
      share_link: '',
      related_to_project: '',
    });

    this.activityForm.patchValue({
      date: {
        start_date: new Date().toISOString().split('T')[0],
      },
    });
  }

  ngAfterViewInit(): void {

  }

  onSubmit() {
    console.debug(
      `🌿 => ActivityComponent => onSubmit => activity:`,
      this.activityForm.value
    );
    if (this.activityForm.valid) {
      const activity: Activity = this.activityForm.value;
      this.isLoading = true;
      const responseConfig = {
        next: (res: any) => {
          console.debug(
            `🌿 => ActivityComponent => this.api.updateActivity => res:`,
            res
          );
          this.activityForm.reset();
          this.getActivities(this.activityType);
          this.isLoading = false;
          alertModalWithoutConfirm('success', 'Event Updated');
        },
        error: alertErrorHandler,
        complete: () => {
          this.isLoading = false;
        },
      };
      activity._id
        ? this.api.updateActivity(activity).subscribe(responseConfig)
        : this.api.addActivity(activity).subscribe(responseConfig);
    } else {
      this.activityForm.markAllAsTouched();
      alertModal('error', 'Fill all the Fields!');
    }
  }

  editActivity(activity: Activity) {
    (document.getElementById('addNewActivity') as HTMLElement).click();
    console.log(activity);
    activity.date.dates.forEach((e: any) => this.addNewDate());
    activity.files.forEach((e: any) => this.addNewFile());
    this.activityForm.patchValue(activity);
  }

  async getActivities(type: string) {
    this.isLoading = true;
    this.api.getActivities(type).subscribe({
      next: (res: any) => {
        this.activities = res.data;
        this.isLoading = false;
        console.log(res,"this is response");
        console.log(this.videoLink+res.data[0].redirection_link);
      },
      error: alertErrorHandler,
    });
  }

  getDateControls(): FormArray {
    return this.activityForm.get('date.dates') as FormArray;
  }

  getFileControls(): FormArray {
    return this.activityForm.get('files') as FormArray;
  }

  addNewDate() {
    const itemsArray = this.getDateControls();
    itemsArray.push(this.formBuilder.control('', Validators.required));
  }

  addNewFile() {
    const itemsArray = this.getFileControls();
    itemsArray.push(this.formBuilder.control(''));
  }

  deleteActivity(id: string | undefined) {
    this.api.deleteActivity(id).subscribe({
      next: () => {
        alertModalWithoutConfirm('success', 'Activity deleted successfully');
        this.getActivities(this.activityType);
      },
    });
  }

  showDate(activity: Activity) {
    return [
      activity.date.start_date,
      ...(activity.date.dates || []),
      activity.date.end_date,
    ]
      .filter((e) => e)
      .join(',');
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoLink + (url || ''));
  }
}
