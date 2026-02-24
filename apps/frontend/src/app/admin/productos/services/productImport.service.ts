/**
 * Servicio para importar productos desde Excel.
 * Maneja la subida de archivos al backend y procesa la respuesta.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Resultado de la importación de productos
 */
export interface ImportProductsResult {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  errors: number;
  details: Array<{
    row: number;
    sku: string;
    action: "created" | "updated" | "unchanged" | "skipped" | "error";
    message: string;
  }>;
}

/**
 * Obtiene el token de acceso del localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/**
 * Importa productos desde un archivo Excel.
 * @param file - Archivo Excel a importar
 * @returns Resultado de la importación con estadísticas y detalles
 * @throws Error si la importación falla
 */
export async function importProductsFromExcel(
  file: File,
): Promise<ImportProductsResult> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    const err = new Error("No se encontró token de autenticación");
    (err as Error & { translationKey?: string }).translationKey = "admin.products.import.no_token";
    throw err;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/products/admin/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      const err = new Error("No autorizado. Por favor, inicia sesión nuevamente.");
      (err as Error & { translationKey?: string }).translationKey = "admin.products.import.unauthorized";
      throw err;
    }
    if (response.status === 403) {
      const err = new Error("No tienes permisos para importar productos.");
      (err as Error & { translationKey?: string }).translationKey = "errors.forbidden";
      throw err;
    }
    if (response.status === 400) {
      const errorData = await response.json();
      const err = new Error(errorData.message || "Archivo inválido o formato incorrecto.");
      (err as Error & { translationKey?: string }).translationKey = "admin.products.import.invalid_file";
      throw err;
    }
    const err = new Error(`Error al importar productos: ${response.statusText}`);
    (err as Error & { translationKey?: string }).translationKey = "admin.products.import.import_error";
    (err as Error & { translationParams?: Record<string, string> }).translationParams = { statusText: response.statusText };
    throw err;
  }

  const result: ImportProductsResult = await response.json();
  return result;
}

/**
 * Valida que el archivo sea un Excel válido
 * @param file - Archivo a validar
 * @returns true si el archivo es válido
 * @throws Error si el archivo no es válido
 */
export function validateExcelFile(file: File): boolean {
  const validTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const validExtensions = [".xls", ".xlsx"];
  const fileExtension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));

  if (
    !validTypes.includes(file.type) &&
    !validExtensions.includes(fileExtension)
  ) {
    const err = new Error("Tipo de archivo inválido. Solo se permiten archivos Excel (.xlsx, .xls).");
    (err as Error & { translationKey?: string }).translationKey = "admin.products.import.invalid_type";
    throw err;
  }

  // Límite de 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    const err = new Error("El archivo es demasiado grande. El tamaño máximo es 10MB.");
    (err as Error & { translationKey?: string }).translationKey = "admin.products.import.file_too_large";
    throw err;
  }

  return true;
}
