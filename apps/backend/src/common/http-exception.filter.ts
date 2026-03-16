import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

const MULTER_ERROR_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: 'El archivo es demasiado grande. El tamaño máximo es 10MB.',
  LIMIT_FILE_COUNT: 'Demasiados archivos. Solo se permite un archivo.',
  LIMIT_UNEXPECTED_FILE: 'Campo de archivo no esperado.',
};

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MulterExceptionFilter.name);

  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const message =
      MULTER_ERROR_MESSAGES[exception.code] ||
      `Error al subir archivo: ${exception.message}`;

    this.logger.warn(`Multer error: ${exception.code} - ${message}`);

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
    });
  }
}
