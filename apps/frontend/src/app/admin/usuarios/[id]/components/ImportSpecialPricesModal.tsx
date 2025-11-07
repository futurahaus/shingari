import React, { useState } from "react";
import { useNotificationContext } from '@/contexts/NotificationContext';

interface ImportSpecialPricesModalProps {
  userId: string;
  onClose: () => void;
  onImported: () => void;
}

export const ImportSpecialPricesModal: React.FC<ImportSpecialPricesModalProps> = ({ userId, onClose, onImported }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { showWarning, showSuccess, showError } = useNotificationContext();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setSelectedFile(null);
      setProcessedFile(null);
      return;
    }

    const csvMimeTypes = ['text/csv', 'application/csv'];

    if (!csvMimeTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Este importador solo acepta CSV (.csv)');
      setSelectedFile(null);
      setProcessedFile(null);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setUploadResult(null);

    // Read and transform CSV to inject USER_ID column when missing
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length === 0) {
          setUploadError('El archivo CSV está vacío');
          showError('Importación', 'El archivo CSV está vacío', 4000);
          setProcessedFile(null);
          return;
        }

        // Parse CSV properly handling quoted fields
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const originalHeader = parseCSVLine(lines[0]);
        const hasUserId = originalHeader.some(h => h.toUpperCase() === 'USER_ID');

        // Always enforce our header order and overwrite USER_ID with current user
        const newHeader: string[] = ['SKU', 'USER_ID', 'PRECIO', 'VALIDO_DESDE', 'VALIDO_HASTA', 'ESTADO'];

        // Helper function to escape CSV values (add quotes if needed)
        const escapeCSVValue = (value: string): string => {
          // If value contains comma, newline, or quote, wrap it in quotes
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            // Escape existing quotes by doubling them
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        };

        const dataLines = lines.slice(1);
        const newLines = [newHeader.join(',')];
        for (const line of dataLines) {
          const cols = parseCSVLine(line);
          if (cols.every(c => c.trim() === '')) continue;

          // Map input based on whether original provided USER_ID
          if (hasUserId) {
            // Expected input with USER_ID: [SKU, USER_ID, PRECIO, VALIDO_DESDE, VALIDO_HASTA, ESTADO]
            const sku = escapeCSVValue((cols[0] || '').trim());
            const precio = escapeCSVValue((cols[2] || '').trim());
            const validoDesde = escapeCSVValue((cols[3] || '').trim());
            const validoHasta = escapeCSVValue((cols[4] || '').trim());
            const estado = escapeCSVValue((cols[5] || '').trim());
            const row = [sku, userId, precio, validoDesde, validoHasta, estado].join(',');
            newLines.push(row);
          } else {
            // Expected input without USER_ID: [SKU, PRECIO, VALIDO_DESDE, VALIDO_HASTA, ESTADO]
            const sku = escapeCSVValue((cols[0] || '').trim());
            const precio = escapeCSVValue((cols[1] || '').trim());
            const validoDesde = escapeCSVValue((cols[2] || '').trim());
            const validoHasta = escapeCSVValue((cols[3] || '').trim());
            const estado = escapeCSVValue((cols[4] || '').trim());
            const row = [sku, userId, precio, validoDesde, validoHasta, estado].join(',');
            newLines.push(row);
          }
        }

        const csvOut = newLines.join('\n');
        const blob = new Blob([csvOut], { type: 'text/csv' });
        const newFile = new File([blob], file.name.replace(/\.csv$/i, '') + '_with_user.csv', { type: 'text/csv' });
        setProcessedFile(newFile);
      } catch {
        setUploadError('No se pudo procesar el CSV');
        showError('Importación', 'No se pudo procesar el CSV', 4000);
        setProcessedFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const header = ['SKU', 'PRECIO', 'VALIDO_DESDE', 'VALIDO_HASTA', 'ESTADO'];
    const sampleData = [
      ['C2391', '10.50', '2025-01-01', '2025-12-31', 'activo'],
      ['C2392', '15.75', '2025-01-01', '2025-12-31', 'activo'],
      ['C2393', '8.25', '2025-01-01', '2025-12-31', 'activo']
    ];

    // Create CSV with simple formatting
    const csvContent = [
      header.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_precios_especiales.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Plantilla descargada', 'Se ha descargado la plantilla CSV correctamente', 3000);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Seleccione un archivo primero');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      // Use processed file if available (adds USER_ID from current user)
      formData.append('file', processedFile || selectedFile);

      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products/bulk-discounts/upload`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any;
        try { errorData = JSON.parse(errorText); } catch { errorData = { message: errorText }; }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUploadResult(result);
      
      // Notifications based on result
      const allDetails: any[] = Array.isArray(result?.details) ? result.details : [];
      
      // Separate skipped (duplicates) from actual errors
      const skippedDetails = allDetails.filter((d) => 
        (d?.message || '').toLowerCase().includes('duplicate') || 
        (d?.message || '').toLowerCase().includes('skipped')
      );
      const errorDetails = allDetails.filter((d) => 
        !(d?.message || '').toLowerCase().includes('success') &&
        !(d?.message || '').toLowerCase().includes('duplicate') &&
        !(d?.message || '').toLowerCase().includes('skipped')
      );
      
      const hasErrors = result?.errors && result.errors > 0;
      const hasSkipped = skippedDetails.length > 0;

      if (hasErrors || hasSkipped) {
        const errorsByType = {
          productNotFound: [] as string[],
          userNotFound: [] as string[],
          invalidFields: [] as string[],
          invalidDates: [] as string[],
          duplicates: [] as string[],
          other: [] as string[]
        };

        // Categorize errors by type
        errorDetails.forEach((d) => {
          const sku = String(d?.sku || '').trim();
          const message = (d?.message || '').toLowerCase();
          
          if (message.includes('product not found')) {
            errorsByType.productNotFound.push(sku);
          } else if (message.includes('user not found')) {
            errorsByType.userNotFound.push(sku);
          } else if (message.includes('invalid') && message.includes('date')) {
            errorsByType.invalidDates.push(sku);
          } else if (message.includes('missing') || message.includes('invalid')) {
            errorsByType.invalidFields.push(sku);
          } else {
            errorsByType.other.push(sku);
          }
        });

        // Categorize duplicates
        skippedDetails.forEach((d) => {
          const sku = String(d?.sku || '').trim();
          errorsByType.duplicates.push(sku);
        });

        // Build detailed error messages
        const errorMessages: string[] = [];
        
        if (errorsByType.productNotFound.length > 0) {
          const skus = errorsByType.productNotFound.slice(0, 5).join(', ');
          const more = errorsByType.productNotFound.length > 5 ? ` (+${errorsByType.productNotFound.length - 5} más)` : '';
          errorMessages.push(`❌ Productos no encontrados: ${skus}${more}`);
        }
        
        if (errorsByType.userNotFound.length > 0) {
          errorMessages.push(`❌ Usuario no válido: ${errorsByType.userNotFound.length} fila(s)`);
        }
        
        if (errorsByType.invalidFields.length > 0) {
          const skus = errorsByType.invalidFields.slice(0, 3).join(', ');
          const more = errorsByType.invalidFields.length > 3 ? ` (+${errorsByType.invalidFields.length - 3} más)` : '';
          errorMessages.push(`⚠️ Campos inválidos: ${skus}${more}`);
        }
        
        if (errorsByType.invalidDates.length > 0) {
          const skus = errorsByType.invalidDates.slice(0, 3).join(', ');
          const more = errorsByType.invalidDates.length > 3 ? ` (+${errorsByType.invalidDates.length - 3} más)` : '';
          errorMessages.push(`📅 Fechas inválidas: ${skus}${more}`);
        }
        
        if (errorsByType.duplicates.length > 0) {
          const skus = errorsByType.duplicates.slice(0, 5).join(', ');
          const more = errorsByType.duplicates.length > 5 ? ` (+${errorsByType.duplicates.length - 5} más)` : '';
          errorMessages.push(`ℹ️ Duplicados omitidos: ${skus}${more}`);
        }
        
        if (errorsByType.other.length > 0) {
          const skus = errorsByType.other.slice(0, 3).join(', ');
          const more = errorsByType.other.length > 3 ? ` (+${errorsByType.other.length - 3} más)` : '';
          errorMessages.push(`⚠️ Otros errores: ${skus}${more}`);
        }

        // Show summary notification
        const summaryParts = [`✅ Importados: ${result.success}`];
        if (hasErrors) summaryParts.push(`❌ Errores: ${result.errors}`);
        if (hasSkipped) summaryParts.push(`ℹ️ Omitidos: ${errorsByType.duplicates.length}`);
        const summary = summaryParts.join(' | ');
        const details = errorMessages.join('\n');
        
        if (hasErrors) {
          showWarning('Importación completada con errores', `${summary}\n\n${details}`, 20000); // 20 segundos
        } else {
          showWarning('Importación completada', `${summary}\n\n${details}`, 15000); // 15 segundos
        }
        
        // Show individual notifications for specific issues
        if (errorsByType.productNotFound.length > 0) {
          showError(
            'Productos no encontrados', 
            `${errorsByType.productNotFound.length} producto(s) no existen en el sistema. Verifica los SKUs e inténtalo de nuevo.`, 
            12000 // 12 segundos
          );
        }
        
        if (errorsByType.duplicates.length > 0 && !hasErrors) {
          showWarning(
            'Descuentos duplicados omitidos',
            `${errorsByType.duplicates.length} descuento(s) ya existían con los mismos valores y fueron omitidos.`,
            10000 // 10 segundos
          );
        }
      } else if (result?.success > 0) {
        showSuccess('✅ Importación completada', `${result.success} precio(s) especial(es) importado(s) correctamente`, 8000); // 8 segundos
      } else {
        showWarning('Sin cambios', 'No se importaron registros', 6000); // 6 segundos
      }
      // After successful upload, refresh parent list
      onImported();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir el archivo';
      setUploadError(message);
      showError('Error de importación', message, 6000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Importar precios</h3>
            <p className="text-sm text-gray-500">Usuario actual: <span className="font-mono">{userId}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="import-file" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccione archivo CSV
            </label>
            <input
              id="import-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointers"
            />
            <p className="mt-1 text-xs text-gray-500">Formato permitido: CSV (.csv). El ID del usuario se agregará automáticamente.</p>

            <div className="mt-3">
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar plantilla CSV
              </button>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-md transition-colors cursor-pointer"
          >
            {isUploading ? 'Procesando…' : 'Subir y procesar'}
          </button>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <p>{uploadError}</p>
            </div>
          )}

          {uploadResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Correctos</p>
                  <p className="text-2xl font-bold text-green-600">{uploadResult.success}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Errores</p>
                  <p className="text-2xl font-bold text-red-600">{uploadResult.errors}</p>
                </div>
              </div>

              {uploadResult.details && uploadResult.details.length > 0 && (
                <div className="max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fila</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadResult.details.map((d: any, i: number) => (
                        <tr key={i} className={d.message?.includes('successfully') ? 'bg-green-50' : 'bg-red-50'}>
                          <td className="px-3 py-2">{d.row}</td>
                          <td className="px-3 py-2">{d.sku}</td>
                          <td className="px-3 py-2">{d.userId}</td>
                          <td className="px-3 py-2">{d.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              Nota: no incluya la columna <span className="font-mono">USER_ID</span>. Se insertará automáticamente con el ID del usuario actual mostrado arriba.
            </p>
            <div className="mt-2 bg-white border border-gray-200 rounded">
              <table className="min-w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 px-2 bg-gray-50">SKU</th>
                    <th className="text-left py-1 px-2 bg-gray-50">PRECIO</th>
                    <th className="text-left py-1 px-2 bg-gray-50">VALIDO_DESDE</th>
                    <th className="text-left py-1 px-2 bg-gray-50">VALIDO_HASTA</th>
                    <th className="text-left py-1 px-2 bg-gray-50">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 px-2">C2391</td>
                    <td className="py-1 px-2">10</td>
                    <td className="py-1 px-2">2025-01-01</td>
                    <td className="py-1 px-2">2025-12-31</td>
                    <td className="py-1 px-2">activo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">Cerrar</button>
        </div>
      </div>
    </div>
  );
};


