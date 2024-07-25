// admin.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly httpService: HttpService) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const cookies = request.cookies;
        const token = cookies['authentication'];

  if(token === 'undefined') {
    throw new UnauthorizedException('No authentication token found');
  }
 console.log(token)

        if (!token) {
            throw new UnauthorizedException('No authentication token found');
        }

        return this.validateTokenWithAuthApi(token).then(role => {
            if (role === 'admin') {
                // Only allow if the user is an admin
                return true;
            } else {
                // If the user is not an admin, throw an exception
                throw new UnauthorizedException('Access denied. Admin role required.');
            }
        });
    }

    private async validateTokenWithAuthApi(token: string): Promise<string> {
        const authApiUrl = 'localhost:28080/auth/';
        try {
            const response = await lastValueFrom(this.httpService.get(authApiUrl, {
                headers: { authentication: token },
            }));
    
            if (response.status === 200 && response.data.perms) {
                // Correctly access perms from response.data
                return response.data.perms; // Return the user's role
            } else {
                throw new UnauthorizedException('Invalid authentication token');
            }
        } catch (error) {
            throw new UnauthorizedException('Invalid authentication token');
        }
    }
}