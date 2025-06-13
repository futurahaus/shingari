import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const hasAuthHeader = request.headers.authorization;

    // Si no hay header de autorización, permitimos el acceso sin autenticación
    if (!hasAuthHeader) {
      return true;
    }

    // Si hay header de autorización, intentamos autenticar
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Si hay error o no hay usuario, retornamos undefined
    if (err || !user) {
      return undefined;
    }
    return user;
  }
} 