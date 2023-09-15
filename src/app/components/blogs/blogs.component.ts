import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {
  alertErrorHandler,
  alertModalWithoutConfirm,
} from 'src/app/helpers/alert';
import { BackendService } from 'src/app/services/api/backend.service';

interface Content {
  image?: string;
  text: string;
}

interface Blog {
  _id?: string;
  title: string;
  sub_title: string;
  date: string;
  desc: string;
  thumb: string;
  content: Content[];
}

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss'],
})
export class BlogsComponent implements OnInit {
  isLoading = false;
  blogs: Blog[] = [];
  blogForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, public api: BackendService) {}
  ngOnInit() {
    this.initializeForm();
    this.getBlogs();
  }

  initializeForm() {
    this.blogForm = this.formBuilder.group({
      _id: [''],
      title: ['', Validators.required],
      sub_title: ['', Validators.required],
      desc: ['', Validators.required],
      date: ['', Validators.required],
      thumb: ['', Validators.required],
      content: this.formBuilder.array([]),
    });
    this.blogForm.valueChanges.subscribe((form: any) => {
      console.log('form', form);
    });
  }

  getBlogs() {
    this.isLoading = true;

    this.api.getBlogs().subscribe({
      next: (res: any) => {
        this.blogs = res.data;
        this.isLoading = false;
      },
      error: alertErrorHandler,
    });
  }

  editBlog(blog: any) {
    (document.getElementById('addNewBlog') as HTMLElement).click();

    blog.content.forEach((e: any, i: number) => {
      this.addContent(e);
    });

    this.blogForm.patchValue(blog);
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
    if (this.blogForm.valid) {
      const [newBlog, imageLinks]: any = await this.uploadAllImages(
        this.blogForm.value
      );
      console.debug(`🌿 => BlogsComponent => onSubmit => newBlog:`, newBlog);
      this.deleteImagesOnClose = imageLinks;

      if (!newBlog._id) {
        delete newBlog._id;
      }

      this.api.updateBlog(newBlog).subscribe({
        next: (res: any) => {
          this.deleteImages(this.deleteImageLinksOnSubmit);

          this.deleteImageLinksOnSubmit = [];
          this.deleteImagesOnClose = [];

          this.blogs.push(res);
          this.blogForm.reset();
          this.getBlogs();

          (document.getElementById('closeAddBlog') as HTMLElement).click();
          alertModalWithoutConfirm('success', 'Blog Updated');
        },
        error: (err: any) => {
          alertErrorHandler(err);
          this.closeProject();
        },
      });
    } else {
      this.blogForm.markAllAsTouched();
    }
  }

  deleteBlog(blogId: string | undefined) {
    console.debug(`🌿 => BlogsComponent => deleteBlog => blogId:`, blogId);
    this.api.deleteBlog(blogId).subscribe({
      next: () =>
        alertModalWithoutConfirm('success', 'Blog deleted successfully'),
      error: alertErrorHandler,
      complete: () => {
        this.getBlogs();
      },
    });
  }

  getContents(): FormArray {
    return this.blogForm.get('content') as FormArray;
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

  addContent(value?: any) {
    const itemsArray = this.getContents() as any;

    itemsArray.push(
      this.formBuilder.group({
        image: [''],
        text: ['', Validators.required],
      })
    );

    let contentIndex = itemsArray.length - 1,
      contentDivId = '#quill-test-' + contentIndex;

    setTimeout(() => {
      let quill = new (window as any).Quill(contentDivId, {
        modules: {
          toolbar: this.toolbarOptions,
        },
        theme: 'snow',
      });

      quill.on('text-change', () => {
        let editor = document.querySelector(contentDivId + ' .ql-editor');

        itemsArray.controls[contentIndex]?.patchValue({
          text: editor?.innerHTML,
        });
      });

      if (value) {
        console.log('value', value);
        quill.clipboard.dangerouslyPasteHTML(0, value.text);
      }
    }, 0);
  }

  removeContent(itemToDeleteIndex: number): void {
    this.getContents().removeAt(itemToDeleteIndex);
  }

  moveContentUp(index: number) {
    if (index > 0) {
      const contents = this.getContents();
      const currentContent = contents.at(index);
      contents.removeAt(index);
      contents.insert(index - 1, currentContent);
    }
  }

  moveContentDown(index: number) {
    const contents = this.getContents();
    if (index < contents.length - 1) {
      const currentContent = contents.at(index);
      contents.removeAt(index);
      contents.insert(index + 1, currentContent);
    }
  }
}
