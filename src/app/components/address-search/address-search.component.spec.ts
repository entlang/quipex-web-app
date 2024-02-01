import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AddressService } from '../../services/address.service';
import { AddressSearchComponent } from './address-search.component';

describe('AddressSearchComponent', () => {
  let component: AddressSearchComponent;
  let fixture: ComponentFixture<AddressSearchComponent>;

  const mockedAddressService = jasmine.createSpyObj('AddressService', [
    'search',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressSearchComponent, NoopAnimationsModule],
      providers: [
        {
          provide: AddressService,
          useValue: mockedAddressService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should restore address', () => {
    const address = {
      id: '1',
      addressLine1: '',
      addressLine2: '',
      suburb: '',
      state: '',
      postcode: '',
    };
    component.addressToRestore = address;

    fixture.detectChanges();

    expect(component.addressSearchCtrl.value.id).toBe('1');
  });

  it('should trigger search', fakeAsync(() => {
    fixture.detectChanges();

    mockedAddressService.search.and.returnValue(
      of([
        {
          id: '3',
          addressLine1: '20 Pitt St',
          addressLine2: '',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        },
      ])
    );

    const searchInput = fixture.debugElement.query(
      By.css('.mat-mdc-input-element')
    ).nativeElement;
    searchInput.value = 'syd';
    searchInput.dispatchEvent(new Event('input'));

    tick(500);

    fixture.whenStable().then(() => {
      expect(component.filteredAddresses$.value[0].id).toBe('3');
    });

    flush();
  }));
});
