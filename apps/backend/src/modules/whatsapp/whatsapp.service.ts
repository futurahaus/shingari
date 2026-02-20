import { Injectable, BadRequestException } from '@nestjs/common';

export interface ConnectionStateResponse {
  instanceName: string;
  state: string;
  connected: boolean;
}

export interface QrCodeResponse {
  base64?: string;
  pairingCode?: string;
  code?: string;
  count?: number;
}

@Injectable()
export class WhatsAppService {
  private getConfig() {
    const evolutionApiUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    const evolutionInstance = process.env.EVOLUTION_INSTANCE_NAME;

    if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance) {
      throw new BadRequestException(
        'Evolution API no está configurado. Configure EVOLUTION_API_URL, EVOLUTION_API_KEY y EVOLUTION_INSTANCE_NAME.',
      );
    }

    return { evolutionApiUrl, evolutionApiKey, evolutionInstance };
  }

  private async evolutionFetch(
    path: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const { evolutionApiUrl, evolutionApiKey } = this.getConfig();
    const url = `${evolutionApiUrl.replace(/\/$/, '')}${path}`;

    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey,
        ...options.headers,
      },
    });
  }

  async getConnectionState(): Promise<ConnectionStateResponse> {
    const { evolutionInstance } = this.getConfig();
    const response = await this.evolutionFetch(
      `/instance/connectionState/${evolutionInstance}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadRequestException(
        `Evolution API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    const instance = data.instance ?? data;
    const instanceName = instance.instanceName ?? evolutionInstance;
    const state = instance.state ?? 'close';
    const connected = state === 'open';

    return {
      instanceName,
      state,
      connected,
    };
  }

  async getQrCode(): Promise<QrCodeResponse> {
    const { evolutionInstance } = this.getConfig();
    const response = await this.evolutionFetch(
      `/instance/connect/${evolutionInstance}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadRequestException(
        `Evolution API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();

    return {
      base64: data.base64 ?? data.qrcode?.base64,
      pairingCode: data.pairingCode,
      code: data.code,
      count: data.count,
    };
  }

  async restart(): Promise<ConnectionStateResponse> {
    const { evolutionInstance } = this.getConfig();
    const response = await this.evolutionFetch(
      `/instance/restart/${evolutionInstance}`,
      { method: 'PUT' },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadRequestException(
        `Evolution API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    const instance = data.instance ?? data;
    const instanceName = instance.instanceName ?? evolutionInstance;
    const state = instance.state ?? 'close';
    const connected = state === 'open';

    return {
      instanceName,
      state,
      connected,
    };
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const { evolutionInstance } = this.getConfig();
    const response = await this.evolutionFetch(
      `/instance/logout/${evolutionInstance}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadRequestException(
        `Evolution API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    const message =
      data.response?.message ?? data.message ?? 'Instancia desconectada';

    return {
      success: data.status === 'SUCCESS' || data.error === false,
      message,
    };
  }
}
