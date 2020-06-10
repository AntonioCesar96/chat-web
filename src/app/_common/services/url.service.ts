import { StringResources } from 'src/app/string-resources';
import { Injectable } from '@angular/core';

@Injectable()
export class UrlService {
  URL_BASE = '';

  constructor() {
    this.URL_BASE = StringResources.URL_API;
  }

  denifirUrlBase(url: string) {
    this.URL_BASE = url;
  }
}
