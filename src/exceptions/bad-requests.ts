import { HttpException } from "./root";

export class BadRequestsException extends HttpException {
  constructor(message: string, error?: any) {
    super(message, 400, error);
  }
}
