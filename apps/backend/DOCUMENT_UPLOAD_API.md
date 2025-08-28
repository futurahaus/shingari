# API de Subida de Documentos

## Endpoint: POST /api/orders/:id/upload-document

Este endpoint permite subir documentos relacionados con una orden específica y almacenarlos en el bucket de Supabase Storage.

### Autenticación
- Requiere autenticación JWT (Bearer token)
- El usuario debe estar autenticado

### Parámetros de URL
- `id` (UUID): ID de la orden a la que se asociará el documento

### Parámetros del Formulario
- `file` (File): Archivo a subir (requerido)
- `documentType` (string, opcional): Tipo de documento (por defecto: "general")

### Tipos de Archivo Permitidos
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Texto: `text/plain`
- Imágenes: `image/jpeg`, `image/png`, `image/gif`

### Límites
- Tamaño máximo: 10MB
- El archivo debe existir y ser válido

### Respuesta Exitosa (201)
```json
{
  "url": "https://spozhuqlvmaieeqtaxvq.supabase.co/storage/v1/object/public/shingari/orders/123e4567-e89b-12d3-a456-426614174000/invoice_1703123456789.pdf",
  "path": "orders/123e4567-e89b-12d3-a456-426614174000/invoice_1703123456789.pdf"
}
```

### Respuestas de Error
- `400`: Archivo no válido, tipo no permitido, o tamaño excesivo
- `404`: Orden no encontrada
- `401`: No autenticado
- `500`: Error interno del servidor

### Ejemplo de Uso con cURL
```bash
curl -X POST \
  http://localhost:3001/api/orders/123e4567-e89b-12d3-a456-426614174000/upload-document \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'file=@/path/to/document.pdf' \
  -F 'documentType=invoice'
```

### Ejemplo de Uso con JavaScript/Fetch
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

## Endpoint: DELETE /api/orders/:id/documents/:filePath

Este endpoint permite eliminar un documento específico de una orden.

### Autenticación
- Requiere autenticación JWT (Bearer token)
- El usuario debe estar autenticado

### Parámetros de URL
- `id` (UUID): ID de la orden
- `filePath` (string): Ruta del archivo a eliminar

### Respuesta Exitosa (200)
```json
{
  "message": "Documento eliminado exitosamente"
}
```

### Ejemplo de Uso
```bash
curl -X DELETE \
  http://localhost:3001/api/orders/123e4567-e89b-12d3-a456-426614174000/documents/orders/123e4567-e89b-12d3-a456-426614174000/invoice_1703123456789.pdf \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Configuración de Supabase

Para que este endpoint funcione correctamente, asegúrate de que:

1. El bucket `shingari` existe en tu proyecto de Supabase
2. Las políticas de seguridad del bucket permiten subir y eliminar archivos
3. Las variables de entorno están configuradas:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Políticas de Seguridad Recomendadas

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
