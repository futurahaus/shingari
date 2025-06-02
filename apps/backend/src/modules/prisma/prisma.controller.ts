import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('prisma')
export class PrismaController {
    constructor(private readonly prismaService: PrismaService) { }

    @Get('example')
    async getExampleData() {
        // Example: Fetch all users from the 'auth' schema
        // Replace with your actual logic
        return this.prismaService.roles.findMany();
    }
} 