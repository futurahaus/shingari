import React, { useState } from "react";

interface ImportSpecialPricesModalProps {
  userId: string;
  onClose: () => void;
  onImported: () => void;
}

export const ImportSpecialPricesModal: React.FC<ImportSpecialPricesModalProps> = ({ userId, onClose, onImported }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Seleccione un archivo válido (.xlsx, .xls, .csv)');
      setSelectedFile(null);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setUploadResult(null);
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
      formData.append('file', selectedFile);

      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/products/bulk-discounts/upload', {
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
      // After successful upload, refresh parent list
      onImported();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir el archivo');
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
              Seleccione archivo Excel o CSV
            </label>
            <input
              id="import-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">Formatos permitidos: .xlsx, .xls, .csv</p>
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
              Nota: reutilizamos el formato del cargador masivo. Asegúrese de que la columna <span className="font-mono">USER_ID</span> contenga el ID del usuario actual mostrado arriba.
            </p>
            <div className="mt-2 bg-white border border-gray-200 rounded">
              <table className="min-w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 px-2 bg-gray-50">SKU</th>
                    <th className="text-left py-1 px-2 bg-gray-50">USER_ID</th>
                    <th className="text-left py-1 px-2 bg-gray-50">PRECIO</th>
                    <th className="text-left py-1 px-2 bg-gray-50">VALIDO_DESDE</th>
                    <th className="text-left py-1 px-2 bg-gray-50">VALIDO_HASTA</th>
                    <th className="text-left py-1 px-2 bg-gray-50">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 px-2">C2391</td>
                    <td className="py-1 px-2">{userId}</td>
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


