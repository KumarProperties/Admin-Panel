import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  alertErrorHandler,
  alertModal,
  alertModalWithoutConfirm,
} from 'src/app/helpers/alert';
import { BackendService } from 'src/app/services/api/backend.service';

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
  selector: 'app-activity-form',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit, AfterViewInit {
  isLoading = false;

  activities: Activity[] = [];
  activityForm!: FormGroup;
  activityType = '';
  activityTypes = Object.values(this.activityType);

  constructor(
    private formBuilder: FormBuilder,
    public api: BackendService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeForm();

    this.route.params.subscribe((params) => {
      const activity = params['param'];
      this.activityType = activity;
      this.getActivities(activity);
    });
  }

  initializeForm() {
    this.activityForm = this.formBuilder.group({
      _id: [''],
      title: ['', Validators.required],
      // sub_title: ['', Validators.required],
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
    let editor = document.querySelector('.ql-editor');
    if (editor) {
      editor.innerHTML = ''; // Set the editor content to empty
    }
  }

  ngAfterViewInit(): void {
    this.iniTool();
  }

  async uploadAllImages(data: object) {
    let dataString = JSON.stringify(data),
      imageLinkMatcher = /(blob:http:\/\/.*?)(?=")/gm,
      fileBlobUrls = dataString.match(imageLinkMatcher);
    console.debug(`😍 => uploadAllImages => fileBlobUrls:`, fileBlobUrls);

    if (fileBlobUrls) {
      let form = new FormData();

      let fileBlobs = await Promise.all(
        fileBlobUrls.map((fileUrl): Promise<Blob> => {
          return new Promise((res, rej) => {
            fetch(fileUrl)
              .then((res) => res.blob())
              .then((blob) => res(blob))
              .catch(rej);
          });
        })
      );

      const mimes: any = {
        'image/apng': 'apng',
        'image/avif': 'avif',
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'image/tiff': 'tiff',
        'image/tiff-fx': 'tfx',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
      };

      fileBlobs.forEach((blob) => {
        form.append('files', blob, 'name.' + mimes[blob.type]);
      });

      let imageLinks: any = {};

      await new Promise((resolve) =>
        this.api.upload(form).subscribe({
          next: (response) => {
            console.debug(`😍 => this.api.upload => response:`, response);

            fileBlobUrls?.forEach((url, i) => {
              imageLinks[url] = response.data.url[i];
            });

            resolve(true);
          },
          error: alertErrorHandler,
        })
      );

      let newDataWithUrls = dataString.replace(
        imageLinkMatcher,
        (imageLink) => imageLinks[imageLink]
      );

      return [JSON.parse(newDataWithUrls), Object.values(imageLinks)];
    } else {
      return [data, []];
    }
  }

  deleteImagesOnClose: string[] = [];
  deleteImageLinksOnSubmit: string[] = [];

  addDeletedImageUrl(url: any) {
    if (!url.match(/blob:/)) {
      console.debug(`😍 => addDeletedImageUrl => url:`, url);
      this.deleteImageLinksOnSubmit.push(url);
    }
  }

  deleteImages(arr: string[]) {
    if (arr.length) this.api.deleteFiles(arr).subscribe(() => {});
  }

  closeProject() {
    this.deleteImages(this.deleteImagesOnClose);

    this.deleteImagesOnClose = [];
    this.deleteImageLinksOnSubmit = [];
  }

  async onSubmit() {
    if (this.activityForm.valid) {
      const [activity, imageLinks]: any = await this.uploadAllImages(
        this.activityForm.value
      );

      this.deleteImagesOnClose = imageLinks;

      const text = document.querySelector('.ql-editor');
      console.log(text?.innerHTML);
      activity.desc = text?.innerHTML;
      activity.files = activity.files.filter((e: any) => e);

      this.isLoading = true;
      const responseConfig = {
        next: (res: any) => {
          this.deleteImages(this.deleteImageLinksOnSubmit);

          this.deleteImageLinksOnSubmit = [];
          this.deleteImagesOnClose = [];

          this.activityForm.reset();
          this.getActivities(this.activityType);
          this.isLoading = false;
          alertModalWithoutConfirm('success', 'Event Updated');
          (document.getElementById('closeActivity') as HTMLElement).click();
        },
        error: (err: any) => {
          alertErrorHandler(err);
          this.closeProject();
        },
        complete: () => {
          this.isLoading = false;
        },
      };

      if (!activity._id) {
        delete activity._id;
      }

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

    let editor = document.querySelector('.ql-editor');
    if (editor && activity.desc) {
      editor.innerHTML = activity.desc as any;
    }

    this.activityForm.patchValue(activity);
  }

  async getActivities(type: string) {
    this.isLoading = true;
    this.api.getActivities(type).subscribe({
      next: (res: any) => {
        this.activities = res.data;
        this.isLoading = false;
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

  toolbarOptions = [
    ['bold', 'italic', 'underline'], // toggled buttons

    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ align: [] }],

    ['clean'], // remove formatting button
  ];
  iniTool() {
    const contentDivId = document.getElementById('description');
    console.log(contentDivId);
    let quill = new (window as any).Quill(contentDivId, {
      modules: {
        toolbar: this.toolbarOptions,
      },
      theme: 'snow',
    });
  }
}
