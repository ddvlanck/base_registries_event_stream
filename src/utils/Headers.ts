import {Response} from "express";

export function addHeaders(response: Response, pageSize: number, numberOfObjects: number){
  response.setHeader('Content-Type', 'application/ld+json');
  response.setHeader('Access-Control-Allow-Origin', '*');
  //response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // When the number of objects returned is lower than the page size
  // We reached the last page
  if(numberOfObjects === pageSize){
    response.setHeader('Cache-control', 'public, max-age=31557600');  // Cache it for one year
  }
}
