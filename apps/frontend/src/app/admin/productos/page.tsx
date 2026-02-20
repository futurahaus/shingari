"use client";
import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { EditionModal } from "./components/EditionModal";
import { CreationModal } from "./components/CreationModal";
import { DeleteModal } from "./components/DeleteModal";
import { TranslationModal } from "./components/TranslationModal";
import { AdminProductRow } from "./components/AdminProductRow";
import { ProductsListSkeleton } from "./components/ProductsListSkeleton";
import { Button } from "@/app/ui/components/Button";
import { Product } from "./interfaces/product.interfaces";
import { useAdminProducts, useCategories } from "./hooks/useAdminProducts.hook";
import { Text } from "@/app/ui/components/Text";
import { FaSearch } from "react-icons/fa";
import { exportProductsToExcel } from "./services/productExport.service";
import {
  importProductsFromExcel,
  validateExcelFile,
} from "./services/productImport.service";

export default function AdminProductsPage() {
  const { t, locale } = useTranslation();
  const { showSuccess, showError, showInfo } = useNotificationContext();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda real
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const lastProductRef = useRef<HTMLTableRowElement>(null!);

  const [sortField, setSortField] = useState<
    | "created_at"
    | "updated_at"
    | "sku"
    | "name"
    | "list_price"
    | "wholesale_price"
    | "iva"
    | "units_per_box"
  >("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Usar el hook para obtener categorías
  const { categories, loading: categoriesLoading } = useCategories(locale);

  // Usar el hook para obtener productos con searchQuery (no searchTerm)
  const { products, loading, error, lastPage, refetch } = useAdminProducts({
    page,
    limit: 10,
    search: searchQuery,
    sortField,
    sortDirection,
    categoryId: selectedCategory,
    status: selectedStatus,
    locale,
  });

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const openTranslationModal = (product: Product) => {
    setSelectedProduct(product);
    setShowTranslationModal(true);
  };

  const handleProductUpdated = () => {
    refetch();
  };

  const handleProductCreated = () => {
    refetch();
  };

  const handleProductDeleted = () => {
    refetch();
  };

  const handleTranslationUpdated = () => {
    refetch();
  };

  const handleProductStatusChange = (productId: string, newStatus: string) => {
    // El toggle ya hace optimistic update, no necesitamos refetch
    // Solo actualizamos el estado local si es necesario para otros componentes
    // El estado visual ya está actualizado en ProductStatusToggle
    void productId;
    void newStatus;
  };

  const handleExportProducts = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportProductsToExcel();
      showSuccess(
        t("admin.products.export_success"),
        t("admin.products.export_success_message"),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("admin.products.export_error_message");
      showError(t("admin.products.export_error"), errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [t, showSuccess, showError]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset input para permitir seleccionar el mismo archivo de nuevo
      event.target.value = "";

      try {
        validateExcelFile(file);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : t("admin.products.import_error_message");
        showError(t("admin.products.import_error"), errorMessage);
        return;
      }

      setIsImporting(true);
      try {
        const result = await importProductsFromExcel(file);

        // Mostrar resultado
        const message = t("admin.products.import_result_message", {
          created: result.created,
          updated: result.updated,
          unchanged: result.unchanged || 0,
          skipped: result.skipped,
          errors: result.errors,
        });

        if (result.errors > 0) {
          showInfo(t("admin.products.import_partial_success"), message);
        } else {
          showSuccess(t("admin.products.import_success"), message);
        }

        // Refrescar la lista de productos
        refetch();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : t("admin.products.import_error_message");
        showError(t("admin.products.import_error"), errorMessage);
      } finally {
        setIsImporting(false);
      }
    },
    [t, showSuccess, showError, showInfo, refetch],
  );

  const handlePageChange = (newPage: number) => {
    if (newPage !== page && newPage > 0 && newPage <= lastPage) {
      setPage(newPage);
    }
  };

  // Función para manejar cambios en el input (solo actualiza el estado local)
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Función para ejecutar la búsqueda (cuando se quita el foco o se presiona Enter)
  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchTerm);
    setPage(1); // Resetear a la primera página cuando se busca
  }, [searchTerm]);

  // Función para manejar el evento de presionar Enter
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit],
  );

  // Función para manejar el cambio de categoría
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1); // Resetear a la primera página cuando se cambia de categoría
  }, []);

  // Función para manejar el sorting de columnas
  const handleColumnSort = useCallback(
    (
      field:
        | "created_at"
        | "updated_at"
        | "sku"
        | "name"
        | "list_price"
        | "wholesale_price"
        | "iva"
        | "units_per_box",
    ) => {
      if (sortField === field) {
        const newDirection = sortDirection === "asc" ? "desc" : "asc";
        setSortDirection(newDirection);
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
      setPage(1); // Resetear a la primera página cuando se cambia el sorting
    },
    [sortField, sortDirection],
  );

  return (
    <div className="">
      {/* Input file oculto para importación */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        aria-label={t("admin.products.import_products")}
      />
      <div className="">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Text size="3xl" weight="bold" color="gray-900" as="h1">
              {t("admin.products.title")}
            </Text>
            <div className="flex gap-2">
              <Button
                onPress={handleExportProducts}
                type="secondary"
                text={
                  isExporting
                    ? t("admin.products.exporting")
                    : t("admin.products.export_products")
                }
                testID="export-products-button"
                icon="FaDownload"
                inline
                disabled={isExporting}
              />
              <Button
                onPress={handleImportClick}
                type="secondary"
                text={
                  isImporting
                    ? t("admin.products.importing")
                    : t("admin.products.import_products")
                }
                testID="import-products-button"
                icon="FaUpload"
                inline
                disabled={isImporting}
              />
              <Button
                onPress={() => setShowCreateModal(true)}
                type="primary-admin"
                text={t("admin.products.new_product")}
                testID="create-product-button"
                icon="FaPlus"
                inline
              />
            </div>
          </div>
          <Text
            size="sm"
            weight="normal"
            color="gray-500"
            as="p"
            className="mb-4"
          >
            {t("admin.products.subtitle")}
          </Text>

          {/* Buscador, Filtros y Ordenador */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative max-w-md flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("admin.products.search_placeholder")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onBlur={handleSearchSubmit}
                onKeyPress={handleKeyPress}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            {/* Filtro de Categorías */}
            <div className="flex gap-2 items-center">
              <label htmlFor="categoryFilter" className="text-sm text-gray-600">
                {t("admin.products.category")}:
              </label>
              <select
                id="categoryFilter"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm min-w-[150px]"
                disabled={categoriesLoading}
              >
                <option value="all">
                  {t("admin.products.all_categories")}
                </option>
                <option value="none">{t("admin.products.no_category")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <ProductsListSkeleton rowsCount={10} />
        ) : products && products.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                    >
                      <button
                        className="w-full text-left cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200 p-2 -m-2 rounded uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnSort("sku");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center gap-1">
                          {t("admin.products.table.sku")}
                          {sortField === "sku" && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                    >
                      <button
                        className="w-full text-left cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200 p-2 -m-2 rounded uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnSort("name");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center gap-1">
                          {t("admin.products.table.product")}
                          {sortField === "name" && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("admin.products.table.stock")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                    >
                      <button
                        className="w-full text-left cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200 p-2 -m-2 rounded uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnSort("units_per_box");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center gap-1">
                          {t("admin.products.table.units_per_box")}
                          {sortField === "units_per_box" && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                    >
                      <button
                        className="w-full text-left cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200 p-2 -m-2 rounded uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnSort("list_price");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center gap-1">
                          {t("admin.products.table.retail_price")}
                          {sortField === "list_price" && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                    >
                      <button
                        className="w-full text-left cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200 p-2 -m-2 rounded uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnSort("wholesale_price");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center gap-1">
                          {t("admin.products.table.wholesale_price")}
                          {sortField === "wholesale_price" && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("admin.products.table.retail_price_with_iva")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                    >
                      <button
                        className="w-full text-left cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200 p-2 -m-2 rounded uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnSort("iva");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center gap-1">
                          {t("admin.products.table.iva")}
                          {sortField === "iva" && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                    >
                      <button
                        className="w-full text-left cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200 p-2 -m-2 rounded uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnSort("created_at");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center gap-1">
                          {t("admin.products.table.created_at")}
                          {sortField === "created_at" && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                    >
                      <button
                        className="w-full text-left cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200 p-2 -m-2 rounded uppercase"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnSort("updated_at");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center gap-1">
                          {t("admin.products.table.updated_at")}
                          {sortField === "updated_at" && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("admin.products.table.status")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("admin.products.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, index) => (
                    <AdminProductRow
                      key={product.id}
                      product={product}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                      onTranslate={openTranslationModal}
                      onStatusChange={handleProductStatusChange}
                      isLast={index === products.length - 1}
                      lastProductRef={lastProductRef}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginador */}
            <div className="flex justify-center items-center gap-2 py-6">
              <Button
                onPress={() => handlePageChange(page - 1)}
                type="secondary"
                text={t("admin.products.pagination.previous")}
                testID="prev-page-button"
                inline
                textProps={{
                  size: "sm",
                  weight: "medium",
                  color: page === 1 ? "gray-400" : "secondary-main",
                }}
              />
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                const startPage = Math.max(
                  1,
                  page - Math.floor(maxVisiblePages / 2),
                );
                const endPage = Math.min(
                  lastPage,
                  startPage + maxVisiblePages - 1,
                );

                // Agregar primera página si no está incluida
                if (startPage > 1) {
                  pages.push(1);
                  if (startPage > 2) pages.push("...");
                }

                // Agregar páginas visibles
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }

                // Agregar última página si no está incluida
                if (endPage < lastPage) {
                  if (endPage < lastPage - 1) pages.push("...");
                  pages.push(lastPage);
                }

                return pages.map((p, index) => (
                  <Button
                    key={index}
                    onPress={() =>
                      typeof p === "number" ? handlePageChange(p) : undefined
                    }
                    type={p === page ? "primary" : "secondary"}
                    text={p.toString()}
                    testID={`page-${p}-button`}
                    inline
                    disabled={typeof p !== "number"}
                    textProps={{
                      size: "sm",
                      weight: "medium",
                      color:
                        p === page
                          ? "primary-contrast"
                          : typeof p === "number"
                            ? "secondary-main"
                            : "gray-400",
                    }}
                  />
                ));
              })()}
              <Button
                onPress={() => handlePageChange(page + 1)}
                type="secondary"
                text={t("admin.products.pagination.next")}
                testID="next-page-button"
                inline
                textProps={{
                  size: "sm",
                  weight: "medium",
                  color: page === lastPage ? "gray-400" : "secondary-main",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery
                ? t("admin.products.empty.search_not_found")
                : t("admin.products.empty.no_products")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? t("admin.products.empty.try_other_terms")
                : t("admin.products.empty.start_creating")}
            </p>
            <div className="mt-6">
              <Button
                onPress={() => setShowCreateModal(true)}
                type="primary-admin"
                text={t("admin.products.new_product")}
                testID="create-product-empty-button"
                icon="FaPlus"
                inline
              />
            </div>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <CreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProductCreated={handleProductCreated}
      />

      {/* Edit Product Modal */}
      <EditionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

      {/* Delete Product Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductDeleted={handleProductDeleted}
      />

      {/* Translation Modal */}
      <TranslationModal
        isOpen={showTranslationModal}
        onClose={() => {
          setShowTranslationModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onTranslationUpdated={handleTranslationUpdated}
      />
    </div>
  );
}
