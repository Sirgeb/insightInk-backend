export class HttpException extends Error {
  message: string;
  error: any;
  statusCode: number; 

  constructor(message: string, statusCode: number, error: any) {
    super(message);
    this.message = message 
    this.statusCode = statusCode 
    this.error = error
  }
}