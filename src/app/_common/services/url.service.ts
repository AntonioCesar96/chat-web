import { StringResources } from 'src/app/string-resources';
import { Injectable } from '@angular/core';

@Injectable()
export class UrlService {
  URL = '';
  URL_BASE = '';

  constructor() {
    this.URL = location.origin.includes('chat') ? location.origin : StringResources.URL_SERVIDOR;
    this.URL_BASE = `${this.URL}/${StringResources.API}`;
  }

  denifirUrlBase(url: string) {
    this.URL_BASE = url;
  }
}
