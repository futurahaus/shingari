import { Injectable, CanActivate, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { } // Inyecta PrismaService

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Poblado por JwtAuthGuard, contiene id y email

        if (!user || !user.id) {
            // Esto no debería ocurrir si JwtAuthGuard se ejecutó correctamente
            throw new ForbiddenException('Usuario no autenticado.');
        }

        try {
            // Asume que tu modelo de usuario en Prisma se llama 'user' y tiene un campo 'id' (string) y 'role' (string).
            // Si tu modelo o campos se llaman diferente, ajusta la consulta.
            const userProfile = await this.prisma.user_roles.findUnique({
                where: { user_id_role_id: { user_id: user.id, role_id: 1 } },
                select: { roles: true },
            });

            if (!userProfile) {
                throw new ForbiddenException('Perfil de usuario no encontrado.');
            }

            return true
        } catch (error) {
            // Loguea el error para depuración
            console.error('Error en AdminGuard al verificar el rol del usuario:', error);
            // Lanza una excepción genérica para no exponer detalles internos
            throw new InternalServerErrorException('Error al verificar los permisos de administrador.');
        }

    }
} 