import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IAddress } from '../../interfaces/IAddress';
import { AddressSearchComponent } from '../address-search/address-search.component';

enum DialogStep {
  GettingStarted = 1,
  BuildingPortfolio,
  Confirm,
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    AddressSearchComponent,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  currentStep = DialogStep.GettingStarted;
  dialogStepEnum = DialogStep;
  form: FormGroup;
  manualAddress = false;
  addressToRestore!: IAddress | null;
  states = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  private dialogRef = inject(MatDialogRef<DialogComponent>);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      addressId: new FormControl(''),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      suburb: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      postcode: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4),
        Validators.pattern('^[0-9]*$'),
      ]),
    });
    this.form.disable();
  }

  onAddressCaptureMethodChange(): void {
    this.manualAddress = !this.manualAddress;

    if (this.manualAddress) {
      this.form.enable();
    } else {
      this.addressToRestore = null;
      this.form.disable();
    }
  }

  onAddressSelect(address: IAddress): void {
    console.log('address selected: ', address);

    this.addressToRestore = address;

    this.form.controls.addressId.patchValue(address.id);
    this.form.controls.addressLine1.patchValue(address.addressLine1);
    this.form.controls.addressLine2.patchValue(address.addressLine2);
    this.form.controls.suburb.patchValue(address.suburb);
    this.form.controls.state.patchValue(address.state);
    this.form.controls.postcode.patchValue(address.postcode);
  }

  getErrorMessage(formControlName: string): string {
    if (formControlName === 'addressLine1') {
      if (this.form.controls.addressLine1.hasError('required')) {
        return 'You must enter a value';
      }
    } else if (formControlName === 'suburb') {
      if (this.form.controls.suburb.hasError('required')) {
        return 'You must enter a value';
      }
    } else if (formControlName === 'state') {
      if (this.form.controls.state.hasError('required')) {
        return 'You must enter a value';
      }
    } else if (formControlName === 'postcode') {
      if (this.form.controls.postcode.hasError('required')) {
        return 'You must enter a value';
      } else if (this.form.controls.postcode.hasError('minlength')) {
        return 'Min Length is 4 chars';
      } else if (this.form.controls.postcode.hasError('maxlength')) {
        return 'Max Length is 4 chars';
      } else if (this.form.controls.postcode.hasError('pattern')) {
        return 'Must use digits';
      }
    }
    return '';
  }

  onNext(): void {
    switch (this.currentStep) {
      case DialogStep.GettingStarted:
        this.currentStep = DialogStep.BuildingPortfolio;
        return;
      case DialogStep.BuildingPortfolio:
        this.currentStep = DialogStep.Confirm;
        return;
      case DialogStep.Confirm:
        this.dialogRef.close(this.form.getRawValue());
        return;
      default:
        return;
    }
  }

  onBack(): void {
    switch (this.currentStep) {
      case DialogStep.Confirm:
        this.currentStep = DialogStep.BuildingPortfolio;
        return;
      case DialogStep.BuildingPortfolio:
        this.currentStep = DialogStep.GettingStarted;
        return;
      default:
        return;
    }
  }

  getDialogTitle(step: DialogStep): string {
    switch (step) {
      case DialogStep.GettingStarted:
        return 'Getting Started';
      case DialogStep.BuildingPortfolio:
        return 'Create New Building Manual';
      case DialogStep.Confirm:
        return 'Create New Building Manual - Confirm';
      default:
        return '';
    }
  }
}
