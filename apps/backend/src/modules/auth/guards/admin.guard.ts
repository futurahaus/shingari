import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

interface RequestWithUser {
  user: { id: string; email: string };
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as RequestWithUser;
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('Usuario no autenticado.');
    }

    try {
      // Check if user has admin role by looking up the role name
      const userRole = await this.prisma.user_roles.findFirst({
        where: {
          user_id: user.id,
          roles: {
            name: 'admin',
          },
        },
        include: {
          roles: true,
        },
      });

      if (!userRole) {
        throw new ForbiddenException(
          'Acceso denegado. Se requieren permisos de administrador.',
        );
      }

      return true;
    } catch (error) {
      console.error(
        'Error en AdminGuard al verificar el rol del usuario:',
        error,
      );
      throw new InternalServerErrorException(
        'Error al verificar los permisos de administrador.',
      );
    }
  }
} 