# Configuración de Evolution API para WhatsApp

Este proyecto utiliza Evolution API para enviar notificaciones de WhatsApp al administrador cuando se crea una nueva orden.

## Variables de Entorno Requeridas

Agregar las siguientes variables al archivo `.env`:

```env
# Evolution API Configuration
EVOLUTION_API_URL=https://tu-evolution-api.com
EVOLUTION_API_KEY=tu-api-key-aqui
EVOLUTION_INSTANCE_NAME=tu-instancia-nombre

# WhatsApp Admin Notifications
ADMIN_WHATSAPP_NUMBER=34612345678  # Número del admin para recibir notificaciones de nuevas órdenes
```

## Configuración de Evolution API

### 1. Instalación de Evolution API

Puedes usar Evolution API de varias formas:

#### Opción A: Docker (Recomendado)
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=tu-api-key-aqui \
  -e DEV_MODE=false \
  atendai/evolution-api:latest
```

#### Opción B: VPS/Servidor
Sigue la documentación oficial de Evolution API: https://doc.evolution-api.com/

### 2. Crear una Instancia

```bash
curl -X POST \
  'https://tu-evolution-api.com/instance/create' \
  -H 'Content-Type: application/json' \
  -H 'apikey: tu-api-key-aqui' \
  -d '{
    "instanceName": "shingari-bot",
    "token": "token-opcional",
    "qrcode": true
  }'
```

### 3. Conectar WhatsApp

1. Accede a `https://tu-evolution-api.com/instance/connect/shingari-bot`
2. Escanea el código QR con WhatsApp
3. ¡Listo! Tu instancia está conectada

## Funcionalidad Implementada

### Para Administradores:
- ✅ **Notificación de nueva orden**: Se envía automáticamente al `ADMIN_WHATSAPP_NUMBER`
- ✅ **Formato optimizado**: Incluye emojis y información clave de la orden
- ✅ **Link directo**: Para ver la orden en el panel de admin

## Ejemplo de Mensaje

### Notificación al Admin:
```
🔔 *Nueva orden pendiente*

📋 *ID:* abc123def
📅 *Fecha:* 15/12/2024, 14:30:00
💰 *Total:* €125.50
📊 *Estado:* pending
👤 *Usuario:* usuario-id-123

🔗 Ver en admin: https://shingari.onrender.com/admin/pedidos/abc123def
```

## API Endpoint Utilizado

- **Enviar Texto**: `POST /message/sendText/{instanceName}`

## Formato de Números de Teléfono

El servicio formatea automáticamente el número del admin:
- **Entrada**: `612345678` (España)
- **Salida**: `34612345678@c.us`

## Manejo de Errores

- Si Evolution API no está configurado, se continúa solo con email
- Los errores de WhatsApp no afectan la creación de órdenes
- Se registran logs detallados para debugging

## Seguridad

- ✅ API Key protegida en variables de entorno
- ✅ Validación de números de teléfono
- ✅ Manejo de errores robusto
- ✅ Logs sin información sensible