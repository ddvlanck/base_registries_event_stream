import { Response } from 'express';

export function addHeaders(response: Response, pageSize: number, numberOfObjects: number) {
  addContentTypeHeader(response);
  //response.setHeader('Access-Control-Allow-Origin', '*'); // This header is automatically set, so no need to do this again

  // When the number of objects returned is lower than the page size
  // We reached the last page
  if (numberOfObjects === pageSize) {
      setCacheControl(response);
  }
  
  // We can't cache the last page, because it can still change, but we don't know when.
  // With the ETag header present by the NGINX cache, the browser will check on the server if the page was changed.
  // If not changed, then the local version is used, else the newest version is downloaded from the server
}

export function addContentTypeHeader(response: Response){
  response.setHeader('Content-Type', 'application/ld+json');
}

export function setCacheControl(response: Response){
  response.setHeader('Cache-control', 'public, max-age=31557600');  // Cache it for one year
}

export function setNoCache(response: Response){
  response.setHeader('Cache-control', 'no-cache');
}
