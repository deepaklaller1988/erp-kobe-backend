import 'express';

declare module 'express' {
  export interface Response {
    errorMessage?: string;
  }
}