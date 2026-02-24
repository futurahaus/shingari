/**
 * Servicio para exportar productos a Excel.
 * Maneja la descarga de archivos binarios desde el backend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Obtiene el token de acceso del localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/**
 * Exporta los productos y descarga el archivo Excel.
 * @throws Error si la exportación falla
 */
export async function exportProductsToExcel(): Promise<void> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    const err = new Error("No se encontró token de autenticación");
    (err as Error & { translationKey?: string }).translationKey = "admin.products.export.no_token";
    throw err;
  }

  const response = await fetch(`${API_BASE_URL}/products/admin/export`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const err = new Error("No autorizado. Por favor, inicia sesión nuevamente.");
      (err as Error & { translationKey?: string }).translationKey = "admin.products.export.unauthorized";
      throw err;
    }
    if (response.status === 403) {
      const err = new Error("No tienes permisos para exportar productos.");
      (err as Error & { translationKey?: string }).translationKey = "errors.forbidden";
      throw err;
    }
    const err = new Error(`Error al exportar productos: ${response.statusText}`);
    (err as Error & { translationKey?: string }).translationKey = "admin.products.export.export_error";
    (err as Error & { translationParams?: Record<string, string> }).translationParams = { statusText: response.statusText };
    throw err;
  }

  // Obtener el nombre del archivo del header Content-Disposition
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = "productos_export.xlsx";

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  // Convertir la respuesta a blob
  const blob = await response.blob();

  // Crear URL temporal y disparar la descarga
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Agregar al DOM, hacer click y limpiar
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar la URL del objeto
  window.URL.revokeObjectURL(url);
}
