/**
 * Generated TypeScript types for Algolia index: gs-ml-cb-assets-test
 * This file is auto-generated. Do not edit manually.
 */

export type IdValue<T = string> = {
  id: string;
  value: T;
};


/**
 * Description structure in Algolia
 */
export interface Description {
  matchLevel: string;
  matchedWords: unknown[];
  value: string;
}

/**
 * Name structure in Algolia
 */
export interface Name {
  matchLevel: string;
  matchedWords: unknown[];
  value: string;
}

/**
 * Campground structure in Algolia
 */
export interface Campground {
  description: Description;
  name: Name;
}

/**
 * Highlightresult structure in Algolia
 */
export interface Highlightresult {
  campground: Campground;
  description: Description;
  name: Name;
}

/**
 * Hookupinfo structure in Algolia
 */
export interface Hookupinfo {
  amps: unknown[];
}

/**
 * Parkinfo structure in Algolia
 */
export interface Parkinfo {
  facilityOnSite: unknown[];
}

/**
 * Hit structure in Algolia
 */
export interface Hit {
  _highlightResult: Highlightresult;
  campground: Campground;
  createdAt: string;
  description: string;
  hookupInfo: Hookupinfo;
  instanceCount: number;
  maxRvLength?: unknown | null;
  name: string;
  objectID: string;
  parkInfo: Parkinfo;
  parkingType?: unknown | null;
  photo?: unknown | null;
  price: unknown[];
  rules?: unknown | null;
  size?: unknown | null;
  slideouts?: unknown | null;
  type: number;
  unitType?: unknown | null;
  updatedAt: string;
}

/**
 * Activities structure in Algolia
 */
export interface Activities {
  boating: IdValue<unknown>[];
  recreation: IdValue<unknown>[];
  swimming: unknown[];
}

/**
 * Geolocation structure in Algolia
 */
export interface Geolocation {
  lat: number;
  lng: number;
}

/**
 * Address structure in Algolia
 */
export interface Address {
  address1: string;
  address2: string;
  city: string;
  country: string;
  countryCode: string;
  displayName: string;
  geoLocation: Geolocation;
  postalCode: string;
  state: string;
  stateCode: string;
}

/**
 * Paymentinfo structure in Algolia
 */
export interface Paymentinfo {
  discounts: unknown[];
  paymentMethods: IdValue<unknown>[];
  surcharge: unknown[];
}

/**
 * Policies structure in Algolia
 */
export interface Policies {
  pets: IdValue<unknown>[];
  stay: unknown[];
}

/**
 * Prices structure in Algolia
 */
export interface Prices {
  from: number;
  to: number;
}

/**
 * Appeal structure in Algolia
 */
export interface Appeal {
  hasStar: boolean;
  value: number;
}

/**
 * Facility structure in Algolia
 */
export interface Facility {
  hasStar: boolean;
  value: number;
}

/**
 * General structure in Algolia
 */
export interface General {
  hasStar: boolean;
  value: number;
}

/**
 * Restroom structure in Algolia
 */
export interface Restroom {
  hasStar: boolean;
  value: number;
}

/**
 * Ratings structure in Algolia
 */
export interface Ratings {
  appeal: Appeal;
  facility: Facility;
  general: General;
  restroom: Restroom;
}

/**
 * Rentals structure in Algolia
 */
export interface Rentals {
  accommodations: unknown[];
  rvStorage: unknown[];
}

/**
 * Restrictions structure in Algolia
 */
export interface Restrictions {
  pets: unknown[];
  tents: unknown[];
}

/**
 * Services structure in Algolia
 */
export interface Services {
  repair: unknown[];
  supplies: IdValue<unknown>[];
}

/**
 * System structure in Algolia
 */
export interface System {
  online: IdValue[];
}

/**
 * Urls structure in Algolia
 */
export interface Urls {
  campground: string;
  parMap?: unknown | null;
  parReservation?: unknown | null;
}
