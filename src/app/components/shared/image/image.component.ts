import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BackendService } from 'src/app/services/api/backend.service';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
})
export class ImageComponent {
  @Input() key!: string;

  @Input() form!: FormGroup | any;
  @Input() addFiles!: Function;

  @Input() set setForm(value: any) {
    this.form = value;
    this.updateValue();
  }

  @Output() onDelete = new EventEmitter<string>();

  image!: File;
  isMultiple = false;
  images: any[] = [''];

  constructor(private backend: BackendService) {}

  updateValue() {
    let value = this.form.get(this.key)?.value;

    this.isMultiple = Array.isArray(value);
    this.images = this.isMultiple
      ? (value || []).filter((e: any) => e)
      : [value || ''];
  }

  onDirectAssetFileChange(event: DragEvent, index: number) {
    event.preventDefault();

    let files = event.dataTransfer?.files as FileList;

    for (let i = 0; i < files.length; i++) {
      let image = files[i];

      if (image) {
        if (this.isMultiple) {
          // In a multiple-image section, upload each image separately
          this.uploadFile(image, this.images.length + i);
        } else {
          // In a single-image section, replace the existing image
          this.uploadFile(image, 0);
        }
      }
    }
  }

  handleDragOver(event: Event) {
    let el = event.target as HTMLElement;

    el.classList.add('dragging');
    event.preventDefault();
  }

  handleDragLeave(event: Event) {
    let el = event.target as HTMLElement;

    el.classList.remove('dragging');
    event.preventDefault();
  }

  deleteFile(index: number) {
    this.onDelete.emit(this.images[index]);
    this.images = this.images.filter((_, i) => i !== index);

    if (!this.isMultiple && this.images.length === 0) {
      // For single-image section, show "Drop Image" message
      this.images.push('');
    }

    if (this.isMultiple) {
      this.form.get(this.key)?.removeAt(index);
    }

    this.setValue();
  }

  blobToFileURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  uploadFile(imageFile: File, imageIndex: number) {
    const formData = new FormData();

    formData.append('files', imageFile);

    if (this.isMultiple) {
      // If it's a multiple-image section and the corresponding index doesn't exist, add a new entry
      if (!this.images[imageIndex]) {
        this.addFiles();
      }
    } else {
      // If it's a single-image section, replace the existing image at index 0
      imageIndex = 0;
    }

    this.images[imageIndex] = this.blobToFileURL(imageFile);
    this.setValue();
  }

  setValue() {
    let value = this.isMultiple ? this.images : this.images[0];

    if (this.form) this.form.patchValue({ [this.key]: value });
  }
}
