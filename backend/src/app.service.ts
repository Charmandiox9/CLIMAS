import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getRoutes(): string {
    return 'Modules Available: <br> /auth <br> /user <br> /service <br> /medical-record <br> /consultation <br> /area';
  }
}
