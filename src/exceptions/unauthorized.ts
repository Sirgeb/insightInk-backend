import { HttpException } from "./root";

export class UnauthorizedException extends HttpException {
  constructor(message: string, error?: any) {
    super(message, 401, error);
  }
}
