# Endpoint de Subida de Documentos - Configuración

## 🚀 Configuración Inicial

### 1. Variables de Entorno
Asegúrate de tener estas variables en tu archivo `.env`:

```env
SUPABASE_URL=https://spozhuqlvmaieeqtaxvq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3podXFsdm1haWVlcXRheHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mzg3NzAsImV4cCI6MjA2NzMxNDc3MH0.Miy0dfwpJNSxCzh4V7C-S0S6kSQWsr0k-r4oZxv8K_M
```

### 2. Configuración del Bucket en Supabase

#### Crear el bucket "shingari":
1. Ve a tu dashboard de Supabase
2. Navega a Storage
3. Crea un nuevo bucket llamado `shingari`
4. Configúralo como público

#### Configurar políticas de seguridad:
Ejecuta estas consultas SQL en el SQL Editor de Supabase:

```sql
-- Permitir subir archivos a usuarios autenticados
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir ver archivos a usuarios autenticados
CREATE POLICY "Users can view documents" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir eliminar archivos a usuarios autenticados
CREATE POLICY "Users can delete documents" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');
```

## 📋 Endpoints Disponibles

### POST `/api/orders/:id/upload-document`
Sube un documento asociado a una orden específica.

**Parámetros:**
- `id`: ID de la orden (UUID)
- `file`: Archivo a subir (multipart/form-data)
- `documentType`: Tipo de documento (opcional, default: "general")

**Ejemplo con cURL:**
```bash
curl -X POST \
  http://localhost:3001/api/orders/123e4567-e89b-12d3-a456-426614174000/upload-document \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'file=@/path/to/document.pdf' \
  -F 'documentType=invoice'
```

### DELETE `/api/orders/:id/documents/:filePath`
Elimina un documento específico de una orden.

**Ejemplo con cURL:**
```bash
curl -X DELETE \
  http://localhost:3001/api/orders/123e4567-e89b-12d3-a456-426614174000/documents/orders/123e4567-e89b-12d3-a456-426614174000/invoice_1703123456789.pdf \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## 🔧 Tipos de Archivo Permitidos

- **PDF**: `application/pdf`
- **Word**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Excel**: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Texto**: `text/plain`
- **Imágenes**: `image/jpeg`, `image/png`, `image/gif`

## 📏 Límites

- **Tamaño máximo**: 10MB por archivo
- **Organización**: Los archivos se guardan en `shingari/orders/{orderId}/{fileName}`

## 🧪 Pruebas

### Usar el archivo de ejemplo:
```bash
# Instalar dependencias si no las tienes
npm install form-data

# Editar el archivo test-upload-example.js
# Reemplazar JWT_TOKEN y ORDER_ID con valores válidos

# Ejecutar la prueba
node test-upload-example.js
```

### Ejemplo con JavaScript/Fetch:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('documentType', 'invoice');

const response = await fetch('/api/orders/123e4567-e89b-12d3-a456-426614174000/upload-document', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});

const result = await response.json();
console.log('Document URL:', result.url);
```

## 📁 Estructura de Archivos

Los archivos se organizan de la siguiente manera:
```
shingari/
└── orders/
    └── {orderId}/
        ├── invoice_1703123456789.pdf
        ├── receipt_1703123456790.jpg
        └── contract_1703123456791.docx
```

## 🔍 URLs de Acceso

Las URLs públicas tendrán el formato:
```
https://spozhuqlvmaieeqtaxvq.supabase.co/storage/v1/object/public/shingari/orders/{orderId}/{fileName}
```

## ⚠️ Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un JWT token válido
2. **Validación**: Se valida la existencia de la orden antes de subir archivos
3. **Nombres únicos**: Los archivos se renombran automáticamente para evitar conflictos
4. **Logging**: Todas las operaciones se registran en los logs del servidor

## 🐛 Solución de Problemas

### Error 400: "Tipo de archivo no permitido"
- Verifica que el archivo sea de uno de los tipos permitidos
- Asegúrate de que la extensión del archivo sea correcta

### Error 400: "El archivo es demasiado grande"
- El archivo debe ser menor a 10MB
- Comprime el archivo si es necesario

### Error 404: "Orden no encontrada"
- Verifica que el ID de la orden sea válido
- Asegúrate de que la orden exista en la base de datos

### Error 401: "No autenticado"
- Verifica que el JWT token sea válido
- Asegúrate de incluir el header `Authorization: Bearer {token}`
