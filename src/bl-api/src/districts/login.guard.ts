// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios'; // Import HttpService to make HTTP requests
import { lastValueFrom } from 'rxjs'; // Helper function to convert an Observable to a Promise

@Injectable()
export class LoginGuard implements CanActivate {
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
	if (!token) {
	  throw new UnauthorizedException('No authentication token found');
	}


    return this.validateTokenWithAuthApi(token)
  }

  private async validateTokenWithAuthApi(token: string): Promise<boolean> {
	const authApiUrl = 'http://localhost:28080/auth/';
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
		console.error(error);
		throw new UnauthorizedException('Invalid authentication token');
	}
  }
}