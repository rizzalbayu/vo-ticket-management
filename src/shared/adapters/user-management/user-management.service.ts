import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
  ) {}
  private readonly userServiceUrl = this.configService.get('USER_SERVICE_URL');

  async getDetailUser(userId: string) {
    try {
      const response = this.http
        .get(`${this.userServiceUrl}/v1/users/${userId}`)
        .pipe(
          catchError((error) => {
            console.log(error);
            throw new HttpException(
              'Error getting user details',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        );
      const { data } = await firstValueFrom(response);
      return data.data;
    } catch (error) {
      return null;
    }
  }
}
