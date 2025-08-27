# Configuración de Supabase para Subida de Archivos

## 🔑 Variables de Entorno Requeridas

Para que la subida de archivos funcione correctamente, necesitas configurar estas variables en tu archivo `.env`:

```env
SUPABASE_URL=https://spozhuqlvmaieeqtaxvq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3podXFsdm1haWVlcXRheHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mzg3NzAsImV4cCI6MjA2NzMxNDc3MH0.Miy0dfwpJNSxCzh4V7C-S0S6kSQWsr0k-r4oZxv8K_M
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY_AQUI
```

## 🔍 Cómo Obtener la Service Role Key

1. **Ve a tu dashboard de Supabase**
2. **Navega a Settings > API**
3. **Busca la sección "Project API keys"**
4. **Copia la "service_role" key** (NO la anon key)

## ⚠️ Importante

- **Service Role Key**: Tiene permisos completos para subir archivos
- **Anon Key**: Solo para operaciones públicas
- **Nunca expongas la Service Role Key en el frontend**

## 🛠️ Configuración del Bucket

### 1. Crear el bucket "shingari":
1. Ve a Storage en tu dashboard de Supabase
2. Crea un nuevo bucket llamado `shingari`
3. Configúralo como público

### 2. Configurar políticas de seguridad:
Ejecuta estas consultas SQL en el SQL Editor:

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

## 🧪 Verificación

Después de configurar todo:

1. **Reinicia el servidor backend**
2. **Intenta subir un archivo desde el frontend**
3. **Verifica en la consola del backend que no hay errores de autorización**

## 🔧 Solución de Problemas

### Error: "headers must have required property 'authorization'"
- **Causa**: Falta la `SUPABASE_SERVICE_ROLE_KEY`
- **Solución**: Agregar la variable de entorno

### Error: "Bucket not found"
- **Causa**: El bucket `shingari` no existe
- **Solución**: Crear el bucket en Supabase

### Error: "Policy violation"
- **Causa**: Las políticas de seguridad no están configuradas
- **Solución**: Ejecutar las consultas SQL de políticas
