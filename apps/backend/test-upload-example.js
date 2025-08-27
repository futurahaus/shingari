// Ejemplo de prueba para el endpoint de subida de documentos
// Este archivo es solo para pruebas, no es parte del código de producción

const fs = require('fs');
const FormData = require('form-data');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const JWT_TOKEN = 'TU_JWT_TOKEN_AQUI'; // Reemplaza con un token válido
const ORDER_ID = '123e4567-e89b-12d3-a456-426614174000'; // Reemplaza con un ID de orden válido

// Función para subir un documento
async function uploadDocument(filePath, documentType = 'general') {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('documentType', documentType);

    const response = await fetch(`${API_BASE_URL}/orders/${ORDER_ID}/upload-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Documento subido exitosamente:');
    console.log('URL:', result.url);
    console.log('Path:', result.path);
    return result;
  } catch (error) {
    console.error('❌ Error al subir documento:', error.message);
    throw error;
  }
}

// Función para eliminar un documento
async function deleteDocument(filePath) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${ORDER_ID}/documents/${filePath}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Documento eliminado exitosamente:', result.message);
    return result;
  } catch (error) {
    console.error('❌ Error al eliminar documento:', error.message);
    throw error;
  }
}

// Ejemplo de uso
async function testUpload() {
  console.log('🚀 Iniciando prueba de subida de documentos...\n');

  try {
    // Ejemplo 1: Subir un PDF
    console.log('📄 Subiendo documento PDF...');
    const result1 = await uploadDocument('./test-document.pdf', 'invoice');
    
    // Ejemplo 2: Subir una imagen
    console.log('\n🖼️ Subiendo imagen...');
    const result2 = await uploadDocument('./test-image.jpg', 'receipt');
    
    // Ejemplo 3: Eliminar un documento
    console.log('\n🗑️ Eliminando documento...');
    await deleteDocument(result1.path);
    
    console.log('\n✅ Todas las pruebas completadas exitosamente!');
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas si este archivo se ejecuta directamente
if (require.main === module) {
  testUpload();
}

module.exports = { uploadDocument, deleteDocument };
