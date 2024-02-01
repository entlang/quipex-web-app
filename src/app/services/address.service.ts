import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { IAddress } from '../interfaces/IAddress';

import addresses from '../mock-data/addresses';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  search(searchTerm: string): Observable<IAddress[]> {
    return of(
      addresses.filter(
        (address) =>
          address.addressLine1.toLowerCase().includes(searchTerm) ||
          address.suburb.toLowerCase().includes(searchTerm)
      )
    ).pipe(delay(300));
  }
}
