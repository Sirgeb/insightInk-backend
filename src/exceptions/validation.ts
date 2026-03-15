import { HttpException } from "./root";

export class UnprocessableEntity extends HttpException { 
  constructor(error: any, message: string) {
    super(message, 422, error)
  }
}
