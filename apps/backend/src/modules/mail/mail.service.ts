import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { OrderResponseDto } from '../orders/dto/order-response.dto';

@Injectable()
export class MailService {
    constructor() {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            throw new Error('SENDGRID_API_KEY environment variable is required');
        }
        sgMail.setApiKey(apiKey);
    }

    async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
        const senderEmail = process.env.SENDGRID_SENDER_EMAIL;
        if (!senderEmail) {
            throw new Error('SENDGRID_SENDER_EMAIL environment variable is required');
        }
        
        const msg = {
            to,
            from: senderEmail, // correo verificado en SendGrid
            subject,
            html: htmlContent,
        };

        try {
            await sgMail.send(msg);
            console.log('Correo enviado con éxito');
        } catch (error) {
            console.error('Error al enviar el correo:', error.response?.body || error.message);
            throw error;
        }
    }

    async sendOrderNotification(order: OrderResponseDto, userId?: string): Promise<void> {
        const adminEmail = process.env.SENDGRID_SENDER_EMAIL;
        if (!adminEmail) {
            console.warn('SENDGRID_SENDER_EMAIL not configured, skipping order notification');
            return;
        }

        const subject = 'Nueva orden pendiente';
        const htmlContent = `
            <h2>Nueva orden creada</h2>
            <p><strong>ID de la orden:</strong> ${order.id}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            <p><strong>Total:</strong> €${order.total_amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}</p>
            <p><strong>Estado:</strong> ${order.status}</p>
            ${userId ? `<p><strong>Usuario:</strong> ${userId}</p>` : '<p><strong>Usuario:</strong> No autenticado</p>'}
            <br>
            <p><a href="https://shingari.onrender.com/admin/pedidos/${order.id}" style="background-color: #EA3D15; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver orden en el panel de admin</a></p>
        `;
        
        await this.sendEmail(adminEmail, subject, htmlContent);
    }
}
