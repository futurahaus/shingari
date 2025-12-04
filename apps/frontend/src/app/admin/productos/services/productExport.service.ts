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
    throw new Error("No se encontró token de autenticación");
  }

  const response = await fetch(`${API_BASE_URL}/products/admin/export`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
    }
    if (response.status === 403) {
      throw new Error("No tienes permisos para exportar productos.");
    }
    throw new Error(`Error al exportar productos: ${response.statusText}`);
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
