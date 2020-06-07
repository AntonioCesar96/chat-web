import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    RouterModule,
  ],
  exports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    RouterModule
  ],
  providers: []
})
export class ChatCommonModule { }
