import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  alertErrorHandler,
  alertModalWithoutConfirm,
} from 'src/app/helpers/alert';
import { BackendService } from 'src/app/services/api/backend.service';

interface Location {
  name: string;
  location_id: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  isLoading = false;

  projectForm!: FormGroup;
  projects!: any;
  locations: Location[] = [];
  trendingProject: any;
  constructor(private formBuilder: FormBuilder, public api: BackendService) {}

  ngOnInit() {
    this.initializeForm();

    this.getProjects();
    this.getLocations();
  }

  initializeForm() {
    this.projectForm = this.formBuilder.group({
      _id: [''],
      logo: [''],
      title: [''],
      location_id: ['', Validators.required],
      apt_type: this.formBuilder.array([]),
      status: ['', Validators.required],
      propertyType: ['', Validators.required],
      sub_title: [''],
      tags: this.formBuilder.array([]),
      title_image: this.formBuilder.array([]),
      // contact_number: [
      //   '',
      //   [Validators.required, Validators.pattern(/^\d{10}$/)],
      // ],
      description: [''],
      size: [''],
      gallery_medias: this.formBuilder.array([]),
      flat_view: this.formBuilder.group({
        walk_through: [''],
        flat_view_360: [''],
        live_view: [''],
      }),
      tech_stack: this.formBuilder.group({
        title: [''],
        description: [''],
        image_top: [''],
        image_bottom: [''],
        entries: this.formBuilder.array([]),
      }),
      flat_details: this.formBuilder.group({
        amenities: this.formBuilder.group({
          images: this.formBuilder.array([]),
          bulleting: this.formBuilder.array([]),
        }),
        specification: this.formBuilder.group({
          top_image: [''],
          bottom_image: [''],
          bulleting: this.formBuilder.array([]),
        }),
        isometric_view: this.formBuilder.group({
          media: this.formBuilder.array([]),
        }),
      }),
      layout: [''],
      apartment_document: this.formBuilder.array([]),
      certification: this.formBuilder.group({
        description: [''],
        qr_images: this.formBuilder.array([]),
      }),
      maps: this.formBuilder.array([]),
      location_in_map: [''],
      slug: [''],
      meta_tags: this.formBuilder.array([]),
    });
  }

  getLocations() {
    this.api.getLocations().subscribe({
      next: (res: any) => {
        this.locations = res.data.locations as Location[];
      },
      error: alertErrorHandler,
    });
  }

  async getProjects() {
    this.isLoading = true;
    this.api.getProjects().subscribe({
      next: (res: any) => {
        this.projects = res.data;
        console.log(this.projects);
        this.api.getTrendingAppart().subscribe((res: any) => {
          console.log(res);
          this.trendingProject = res.data.apartments;
        });
      },
      error: alertErrorHandler,
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  editProject(project: any) {
    (document.getElementById('addNewProject') as HTMLElement).click();
    project.title_image.forEach((e: any) => this.addTitileImg());
    project.tags.forEach((e: any) => this.addTag());
    project.apt_type.forEach((e: any) => this.addApartmentType());
    project.gallery_medias.forEach((e: any) => this.addGalleryMedia());
    console.debug(
      `🌿 => ProjectsComponent => editProject => project.gallery_medias:`,
      project.gallery_medias
    );
    project.flat_details.amenities.images.forEach((e: any) =>
      this.addAminitiesImg()
    );
    project.flat_details.amenities.bulleting.forEach((e: any, i: number) => {
      this.addAmenity();
      e.points.forEach((e: any) => this.addAmenityPoint(i));
    });
    project.flat_details.specification.bulleting.forEach(
      (e: any, i: number) => {
        this.addSpecification();
        e.points.forEach((e: any) => this.addSpecificationPoint(i));
      }
    );
    project.flat_details.isometric_view.media.forEach((e: any) =>
      this.addIsometricViewMedia()
    );
    project.meta_tags.forEach((e: any) => this.addMetaTags());
    project.tech_stack.entries.forEach((e: any) => this.addTeamMember());
    project.certification.qr_images.forEach((e: any) => this.addQrCode());
    project.apartment_document.forEach((e: any) => this.addApartmentDocument());
    project.maps.forEach((e: any, i: any) => {
      console.log(e);
      this.addMapTitle();
      e.locations.forEach((e: any) => this.addMapLocation(i));
    });

    console.debug(
      `🌿 => ProjectsComponent => editProject => this.projectForm:`,
      this.projectForm
    );
    this.projectForm.patchValue(project);
  }

  async uploadAllImages(data: object) {
    let dataString = JSON.stringify(data),
      imageLinkMatcher = /(blob:http.*?)(?=")/gm,
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
    console.debug(`🌿 => projectForm.value;:`, this.projectForm.value);

    if (this.projectForm.valid) {
      this.isLoading = true;
      const [project, imageLinks]: any = await this.uploadAllImages(
        this.projectForm.value
      );
      this.deleteImagesOnClose = imageLinks;

      const responseConfig = {
        next: (res: any) => {
          this.deleteImages(this.deleteImageLinksOnSubmit);

          this.deleteImageLinksOnSubmit = [];
          this.deleteImagesOnClose = [];

          this.projectForm.reset();
          this.getProjects();
          this.isLoading = false;
          alertModalWithoutConfirm('success', 'Project Updated');
          (document.getElementById('closeAddProject') as HTMLElement).click();
        },
        error: (err: any) => {
          alertErrorHandler(err);
          this.closeProject();
        },
        complete: () => {
          this.isLoading = false;
        },
      };

      if (!project._id) {
        delete project._id;
      }

      project._id
        ? this.api.updateProject(project).subscribe(responseConfig)
        : this.api.addProject(project).subscribe(responseConfig);
    } else {
      this.projectForm.markAllAsTouched();
    }
  }

  deleteProject(project_id: string) {
    this.api.deleteProject(project_id).subscribe({
      next: () =>
        alertModalWithoutConfirm('success', 'Project deleted successfully'),
      error: alertErrorHandler,
      complete: () => {
        this.getProjects();
      },
    });
  }

  getTags(): FormArray {
    return this.projectForm.get('tags') as FormArray;
  }
  addTag() {
    const itemsArray = this.getTags();
    itemsArray.push(this.formBuilder.control(''));
  }
  removeTag(itemToDeleteIndex: number): void {
    this.getTags().removeAt(itemToDeleteIndex);
  }
  getMetaTags(): FormArray {
    return this.projectForm.get('meta_tags') as FormArray;
  }
  addMetaTags() {
    const itemsArray = this.getMetaTags();
    itemsArray.push(
      this.formBuilder.group({
        key: [''],
        tag: [''],
      })
    );
  }
  removeMetaTag(itemToDeleteIndex: number): void {
    this.getMetaTags().removeAt(itemToDeleteIndex);
  }
  getApartmentTypes(): FormArray {
    return this.projectForm.get('apt_type') as FormArray;
  }
  addApartmentType() {
    const itemsArray = this.getApartmentTypes();
    itemsArray.push(this.formBuilder.control(''));
  }
  removeApartmentType(itemToDeleteIndex: number): void {
    this.getApartmentTypes().removeAt(itemToDeleteIndex);
  }

  getGalleryMedias(): FormArray {
    return this.projectForm.get('gallery_medias') as FormArray;
  }
  addGalleryMedia() {
    const itemsArray = this.getGalleryMedias();
    itemsArray.push(this.formBuilder.control(''));
  }

  getAmenities(): FormArray {
    return this.projectForm.get(
      'flat_details.amenities.bulleting'
    ) as FormArray;
  }
  addAmenity() {
    const itemsArray = this.getAmenities();
    itemsArray.push(
      this.formBuilder.group({
        title: [''],
        points: this.formBuilder.array([]),
      })
    );
  }
  removeAmenity(itemToDeleteIndex: number): void {
    this.getAmenities().removeAt(itemToDeleteIndex);
  }
  getTeamMember(): FormArray {
    return this.projectForm.get('tech_stack.entries') as FormArray;
  }
  addTeamMember() {
    const itemsArray = this.getTeamMember();
    itemsArray.push(
      this.formBuilder.group({
        key: '',
        value: '',
      })
    );
  }
  getMap(): FormArray {
    return this.projectForm.get('maps') as FormArray;
  }
  removeMap(index: number) {
    this.getMap().removeAt(index);
  }
  addMapTitle() {
    const itemsArray = this.getMap();
    itemsArray.push(
      this.formBuilder.group({
        type: [''],
        title: [''],
        locations: this.formBuilder.array([]),
      })
    );
  }
  getMapLocation(index: any): FormArray {
    return (<FormGroup>(
      (<FormArray>this.projectForm.get('maps')).controls[index]
    )).get('locations') as FormArray;
  }
  addMapLocation(index: any) {
    const itemsArray = this.getMapLocation(index);
    itemsArray.push(
      this.formBuilder.group({
        distance: '',
        location_name: '',
      })
    );
  }
  removeMapLocation(index: number) {
    this.getMapLocation(index).removeAt(index);
  }
  removeTeamMember(index: number) {
    this.getTeamMember().removeAt(index);
  }
  getAmenityPoints(index: number): FormArray {
    return this.getAmenities().controls[index].get('points') as FormArray;
  }
  addAmenityPoint(index: number) {
    const itemsArray = this.getAmenityPoints(index);

    itemsArray.push(this.formBuilder.control(''));
  }
  removeAmenityPoint(parentIndex: number, itemToDeleteIndex: number): void {
    this.getAmenityPoints(parentIndex).removeAt(itemToDeleteIndex);
  }

  getSpecifications(): FormArray {
    return this.projectForm.get(
      'flat_details.specification.bulleting'
    ) as FormArray;
  }
  addSpecification() {
    const itemsArray = this.getSpecifications();
    itemsArray.push(
      this.formBuilder.group({
        title: [''],
        points: this.formBuilder.array([]),
      })
    );
  }
  removeSpecification(itemToDeleteIndex: number): void {
    const itemsArray = this.getSpecifications().controls;

    itemsArray.splice(itemToDeleteIndex, 1);
  }
  getSpecificationPoints(index: number): FormArray {
    return this.getSpecifications().controls[index].get('points') as FormArray;
  }
  addSpecificationPoint(index: number) {
    const itemsArray = this.getSpecificationPoints(index);

    itemsArray.push(this.formBuilder.control(''));
  }
  removeSpecificationPoint(
    parentIndex: number,
    itemToDeleteIndex: number
  ): void {
    this.getSpecificationPoints(parentIndex).removeAt(itemToDeleteIndex);
  }

  getIsometricViewMedias(): FormArray {
    return this.projectForm.get(
      'flat_details.isometric_view.media'
    ) as FormArray;
  }
  addIsometricViewMedia() {
    const itemsArray = this.getIsometricViewMedias();

    itemsArray.push(this.formBuilder.control(''));
  }

  getApartmentDocuments(): FormArray {
    return this.projectForm.get('apartment_document') as FormArray;
  }

  addApartmentDocument() {
    const itemsArray = this.getApartmentDocuments();

    itemsArray.push(
      this.formBuilder.group({
        title: [''],
        location: [''],
      })
    );
  }
  removeApartmentDocument(itemToDeleteIndex: number): void {
    this.getApartmentDocuments().removeAt(itemToDeleteIndex);
  }

  getQrCodes(): FormArray {
    return this.projectForm.get('certification.qr_images') as FormArray;
  }
  addQrCode() {
    const itemsArray = this.getQrCodes();
    itemsArray.push(this.formBuilder.control(''));
  }
  getTitleImg() {
    return this.projectForm.get('title_image') as FormArray;
  }
  addTitileImg() {
    const itemsArray = this.getTitleImg();
    itemsArray.push(this.formBuilder.control(''));
  }
  getAminitiesImg() {
    return this.projectForm.get('flat_details.amenities.images') as FormArray;
  }
  addAminitiesImg() {
    const itemsArray = this.getAminitiesImg();
    itemsArray.push(this.formBuilder.control(''));
  }
  addTrendingProject(id: any) {
    this.api.addTrendingAppart(id).subscribe({
      next: () =>
        alertModalWithoutConfirm('success', 'Project Added successfully'),
      error: alertErrorHandler,
      complete: () => {
        this.getProjects();
        this.api.getTrendingAppart().subscribe((res: any) => {
          console.log(res);
          this.trendingProject = res.data;
        });
      },
    });
  }

  // isButtonDisabled(): boolean {
  //   if (!this.trendingProject || !this.projects) {
  //     return false; // Button is not disabled if trendingProject or projects are not found
  //   }

  //   return this.projects.some((project: any) =>
  //     this.trendingProject.some((trending: any) => project._id === trending._id)
  //   );
  // }
  isProjectTrending(projectId: string): boolean {
    if (this.trendingProject?.length === 0) {
      return false; // Show the button if trendingProject is empty
    }
    return this.trendingProject?.some(
      (project: any) => project._id === projectId
    );
  }
}
