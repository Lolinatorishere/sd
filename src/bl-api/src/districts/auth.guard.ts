// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios'; // Import HttpService to make HTTP requests
import { lastValueFrom } from 'rxjs'; // Helper function to convert an Observable to a Promise

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {} // Inject HttpService

  canActivate(
	context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
	const request = context.switchToHttp().getRequest();
	const cookies = request.cookies; // Assuming you have cookie-parser middleware set up
  const token = cookies['authentication'];
  if(token === 'undefined') {
    throw new UnauthorizedException('No authentication token found');
  }
 console.log(token)

	if (!token) {
	  throw new UnauthorizedException('No authentication token found');
	}

    return this.validateTokenWithAuthApi(token).then(role => {
        switch (role) {
          case 'admin':
          case 'edit':
            // Admins and editors are allowed
            return true;
          case 'viewer':
            // Viewers might be restricted based on your application's logic
            // For example, throw an exception or return false
            throw new UnauthorizedException('Insufficient permissions');
          default:
            // No recognized role or missing permissions
            throw new UnauthorizedException('Invalid role or permissions');
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