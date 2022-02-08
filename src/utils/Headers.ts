import type { Response } from 'express';
import type { IFragmentMetadata } from './FragmentMetadata';

export function addResponseHeaders(response: Response, fragmentMetadata: IFragmentMetadata): void {
  // Set content-type to JSON-LD
  response.setHeader('Content-Type', 'application/ld+json');

  // Set caching headers
  if (fragmentMetadata.nextFragment.present) {
    // Cache older fragment, as it will not change over time
    setCacheControl(response);
  } else {
    // Last fragment cann still be updated.
    // However, we cache it untill midnight
    const date = new Date();
    date.setHours(24, 0, 0, 0);
    response.setHeader('Expires', date.toString());
  }
}

export function addContentTypeHeader(response: Response): void {
  response.setHeader('Content-Type', 'application/ld+json');
}

export function setCacheControl(response: Response): void {
  response.setHeader('Cache-control', 'public, max-age=31536000, immutable');
}
