import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  switchMap,
} from 'rxjs';
import { IAddress } from '../../interfaces/IAddress';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-address-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './address-search.component.html',
  styleUrl: './address-search.component.scss',
})
export class AddressSearchComponent implements OnInit {
  @Input({ required: false }) set disabled(disabled: boolean) {
    if (disabled) {
      this.form?.reset();
      this.form?.disable();
    } else {
      this.form?.enable();
    }
  }
  @Input({ required: false }) addressToRestore!: IAddress;

  @Output() addressSelect = new EventEmitter<IAddress>();

  form!: FormGroup;
  filteredAddresses$ = new BehaviorSubject<IAddress[]>([]);

  private minNumberOfCharsToTrigerSearch = 3;

  private addressService = inject(AddressService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  get addressSearchCtrl(): FormControl {
    return this.form.controls.addressSearch as FormControl;
  }

  ngOnInit(): void {
    this.configureForm();
    this.configureAddressSearch();

    if (this.addressToRestore) {
      this.restoreAddress(this.addressToRestore);
    }
  }

  displayFn(address: IAddress): string {
    if (!address) return '';

    const addressLine2 = address.addressLine2
      ? `${address.addressLine2}, `
      : '';
    const result = `${address.addressLine1}, ${addressLine2}${address.suburb}, ${address.state}, ${address.postcode}`;
    return result;
  }

  onAddressSelected(event: MatAutocompleteSelectedEvent): void {
    this.addressSelect.emit(event.option.value);
  }

  private configureForm(): void {
    this.form = this.formBuilder.group({
      addressSearch: [''],
    });
  }

  private configureAddressSearch(): void {
    this.addressSearchCtrl.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        filter((value) => {
          return (
            typeof value === 'string' &&
            value.trim() !== '' &&
            value.length >= this.minNumberOfCharsToTrigerSearch
          );
        }),
        switchMap((value) => {
          return this.addressService.search(value.toLowerCase()).pipe(
            catchError((err) => {
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response?.length) {
          response = [
            {
              id: '0',
              addressLine1: '',
              addressLine2: '',
              suburb: '',
              state: '',
              postcode: '',
            },
          ];
        }
        this.filteredAddresses$.next(response);
      });
  }

  private restoreAddress(address: IAddress): void {
    this.filteredAddresses$.next([address]);
    this.addressSearchCtrl.setValue(address);
  }
}
