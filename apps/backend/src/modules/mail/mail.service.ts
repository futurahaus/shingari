import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { OrderResponseDto } from '../orders/dto/order-response.dto';

interface WhatsAppMessage {
  number: string;
  text: string;
}

interface EvolutionApiResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: any;
  messageTimestamp: number;
  status: string;
}

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

    private async sendAdminWhatsApp(message: string): Promise<void> {
        const evolutionApiUrl = process.env.EVOLUTION_API_URL;
        const evolutionApiKey = process.env.EVOLUTION_API_KEY;
        const evolutionInstance = process.env.EVOLUTION_INSTANCE_NAME;
        const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER;

        if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance || !adminWhatsApp) {
            console.warn('Evolution API or admin WhatsApp not configured, skipping WhatsApp notification');
            return;
        }

        const payload: WhatsAppMessage = {
            number: adminWhatsApp,
            text: message
        };

        try {
            const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstance}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': evolutionApiKey,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Evolution API error: ${response.status} - ${errorText}`);
            }

            const result: EvolutionApiResponse = await response.json();
            console.log('WhatsApp de notificación enviado al admin:', result.key.id);
        } catch (error) {
            console.error('Error al enviar WhatsApp al admin:', error.message);
        }
    }

    async sendOrderNotification(order: OrderResponseDto, userId?: string): Promise<void> {
        const adminEmail = process.env.SENDGRID_SENDER_EMAIL;

        // Enviar email
        if (adminEmail) {
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
            
            try {
                await this.sendEmail(adminEmail, subject, htmlContent);
            } catch (error) {
                console.error('Error al enviar email de notificación:', error);
            }
        }

        // Enviar WhatsApp al admin
        const whatsappMessage = `🔔 *Nueva orden pendiente*\n\n` +
            `📋 *ID:* ${order.id}\n` +
            `📅 *Fecha:* ${new Date().toLocaleString('es-ES')}\n` +
            `💰 *Total:* €${order.total_amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}\n` +
            `📊 *Estado:* ${order.status}\n` +
            `👤 *Usuario:* ${userId || 'No autenticado'}\n\n` +
            `🔗 Ver en admin: https://shingari.onrender.com/admin/pedidos/${order.id}`;

        await this.sendAdminWhatsApp(whatsappMessage);

        if (!adminEmail) {
            console.warn('Email no configurado para notificaciones');
        }
    }
}
