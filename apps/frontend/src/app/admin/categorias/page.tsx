"use client";

import { Text } from '@/app/ui/components/Text';
import { useCategories, Category } from '../productos/hooks/useCategories.hook';
import { useState } from 'react';
import { Button } from '@/app/ui/components/Button';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { FaEdit, FaTrash, FaPlus, FaFolder, FaExclamationTriangle, FaGlobe, FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import React from 'react';
import { CategoryTranslationModal } from './components/CategoryTranslationModal';

interface CategoryFormState {
  id?: string;
  name: string;
  parentId?: string;
}

type CategoryWithChildren = Category & { children: CategoryWithChildren[]; order?: number };

function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const map: Record<string, CategoryWithChildren> = {};
  categories.forEach(cat => (map[cat.id] = { ...cat, children: [] }));
  const tree: CategoryWithChildren[] = [];
  categories.forEach(cat => {
    if (cat.parentId && map[cat.parentId]) {
      map[cat.parentId].children.push(map[cat.id]);
    } else {
      tree.push(map[cat.id]);
    }
  });
  return tree;
}

export default function AdminCategoriasPage() {
  const { categories, loading, refetch } = useCategories(true); // Include all translations for admin
  const { showSuccess, showError } = useNotificationContext();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formState, setFormState] = useState<CategoryFormState>({ name: '', parentId: undefined });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const tree = buildCategoryTree(categories);

  const openAddModal = (parentId?: string) => {
    setModalMode('add');
    setFormState({ name: '', parentId });
    setShowModal(true);
  };
  const openEditModal = (cat: Category) => {
    setModalMode('edit');
    setFormState({ id: cat.id, name: cat.name, parentId: cat.parentId });
    setShowModal(true);
  };
  const openDelete = (id: string) => setDeleteId(id);
  const closeModal = () => setShowModal(false);
  const closeDelete = () => setDeleteId(null);

  const openTranslationModal = (category: Category) => {
    setSelectedCategory(category);
    setShowTranslationModal(true);
  };

  const handleTranslationUpdated = () => {
    refetch();
  };

  // Backend integration for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'add') {
        await api.post('/products/categories', {
          name: formState.name,
          parentId: formState.parentId || undefined,
        });
        showSuccess('Categoría creada', 'La categoría se ha creado exitosamente');
      } else if (modalMode === 'edit' && formState.id) {
        await api.put(`/products/categories/${formState.id}`, {
          name: formState.name,
          parentId: formState.parentId || undefined,
        });
        showSuccess('Categoría actualizada', 'La categoría se ha actualizado exitosamente');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error al guardar la categoría';
      showError('Error', error);
    } finally {
      setSaving(false);
    }
  };

  // Backend integration for delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/products/categories/${deleteId}`);
      showSuccess('Categoría eliminada', 'La categoría se ha eliminado exitosamente');
      setDeleteId(null);
      refetch();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error al eliminar la categoría';
      showError('Error', error);
    } finally {
      setDeleting(false);
    }
  };

  // Helper to sort categories by order
  function sortByOrder(a: CategoryWithChildren, b: CategoryWithChildren) {
    return (a.order ?? 0) - (b.order ?? 0);
  }

  // Local state for root categories order
  const [localTree, setLocalTree] = useState<CategoryWithChildren[]>([]);
  // Sync localTree with tree when categories change
  React.useEffect(() => {
    setLocalTree([...buildCategoryTree(categories)].sort(sortByOrder));
  }, [categories]);

  // Generalized drag end handler for any level
  const handleDragEnd = async (result: DropResult, nodes: CategoryWithChildren[], parentId?: string) => {
    if (!result.destination) return;
    const newNodes = Array.from(nodes);
    const [removed] = newNodes.splice(result.source.index, 1);
    newNodes.splice(result.destination.index, 0, removed);
    // Update order field for this level
    const reordered = newNodes.map((cat, idx) => ({ ...cat, order: idx }));
    // Update localTree recursively
    function updateTreeOrder(tree: CategoryWithChildren[]): CategoryWithChildren[] {
      return tree.map(cat => {
        if ((parentId === undefined && !cat.parentId) || cat.id === parentId) {
          // Root or matching parent
          if (parentId === undefined && !cat.parentId) {
            // Root
            return reordered.find(r => r.id === cat.id) || cat;
          } else if (cat.id === parentId) {
            return { ...cat, children: reordered };
          }
        }
        return { ...cat, children: updateTreeOrder(cat.children) };
      });
    }
    setLocalTree(updateTreeOrder(localTree));
    try {
      await api.patch('/products/categories/order', {
        categories: reordered.map((cat, idx) => ({ id: Number(cat.id), order: idx }))
      });
      showSuccess('Orden actualizado', 'El orden de las categorías se ha actualizado');
      refetch();
    } catch {
      showError('Error', 'No se pudo actualizar el orden');
      setLocalTree([...tree].sort(sortByOrder)); // revert
    }
  };

  // Recursive drag-and-drop tree
  function renderDraggableTree(nodes: CategoryWithChildren[], level = 0, parentId?: string) {
    // Sort nodes by order, then by name
    const sortedNodes = [...nodes].sort((a, b) => {
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return a.name.localeCompare(b.name);
    });
    return (
      <DragDropContext onDragEnd={result => handleDragEnd(result, sortedNodes, parentId)}>
        <Droppable droppableId={parentId ? `droppable-${parentId}` : 'root-categories'}>
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps} className={level === 0 ? 'space-y-1' : 'ml-5 border-l-2 border-gray-100 pl-3 space-y-1 flex-1'}>
              {sortedNodes.map((cat, idx) => (
                <Draggable key={cat.id} draggableId={cat.id} index={idx}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center group rounded px-1 py-1 hover:bg-gray-50 transition relative bg-white ${snapshot.isDragging ? 'ring-2 ring-primary-main' : ''}`}
                      style={{ minHeight: 28, ...provided.draggableProps.style }}
                    >
                      <span className="flex items-center mr-2">
                        {cat.image ? (
                          <Image src={cat.image} alt={cat.name} width={18} height={18} className="rounded object-cover" />
                        ) : (
                          <FaFolder className="text-gray-400 w-4 h-4" />
                        )}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 truncate text-base" title={cat.name}>{cat.name}</span>
                        {/* Translation indicator */}
                        {cat.translations && cat.translations.length > 0 && (
                          <div className="flex items-center mt-1">
                            <FaCheck className="w-3 h-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-600 font-medium">
                              Traducido ({cat.translations.map(t => t.locale).join(', ')})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openTranslationModal(cat)} 
                          className={`p-1 rounded-lg transition ${
                            cat.translations && cat.translations.length > 0
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-600 hover:text-blue-600'
                          }`}
                          title={cat.translations && cat.translations.length > 0
                            ? `Traducir categoría (Ya traducido en: ${cat.translations.map(t => t.locale).join(', ')})`
                            : 'Traducir categoría'
                          }
                          type="button"
                        >
                          <FaGlobe size={13} />
                        </button>
                        <button onClick={() => openEditModal(cat)} className="p-1 text-gray-600 hover:text-blue-600 rounded-lg transition" title="Editar categoría" type="button"><FaEdit size={13} /></button>
                        <button onClick={() => openDelete(cat.id)} className="p-1 text-gray-600 hover:text-red-600 rounded-lg transition" title="Eliminar categoría" type="button"><FaTrash size={13} /></button>
                        <button onClick={() => openAddModal(cat.id)} className="p-1 text-gray-600 hover:text-green-600 rounded-lg transition" title="Agregar subcategoría" type="button"><FaPlus size={13} /></button>
                      </div>
                      {cat.children && cat.children.length > 0 && renderDraggableTree(cat.children, level + 1, cat.id)}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <Text size="3xl" weight="bold" color="gray-900" as="h1">Categorías</Text>
          <Button text="Agregar Nueva categoría" type="primary-admin" onPress={() => openAddModal()} testID="add-root" icon="FaPlus" inline />
        </div>
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-md bg-gray-200" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/6 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : tree.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center">
            <FaFolder className="text-gray-300 w-12 h-12 mb-4" />
            <Text size="xl" weight="bold" color="gray-700" as="h2" className="mb-2">No hay categorías</Text>
            <Text size="md" color="gray-500" as="p" className="mb-4">Empieza creando una nueva categoría para organizar tus productos.</Text>
            <Button text="Agregar categoría" type="primary-admin" onPress={() => openAddModal()} testID="add-root-empty" icon="FaPlus" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4">
            {renderDraggableTree([...localTree].sort(sortByOrder))}
          </div>
        )}
      </div>
      {/* Modal for add/edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form className="bg-white p-8 rounded-xl shadow-lg min-w-[340px] max-w-xs w-full relative" onSubmit={handleSubmit}>
            <Text size="xl" weight="bold" as="h2" className="mb-2 flex items-center gap-2">
              {modalMode === 'add' ? 'Agregar categoría' : 'Editar categoría'}
            </Text>
            <Text size="sm" color="gray-500" as="p" className="mb-4">
              {modalMode === 'add' ? 'Crea una nueva categoría o subcategoría.' : 'Edita el nombre o el padre de la categoría.'}
            </Text>
            <label className="block mb-3">
              <span className="text-gray-700 text-sm font-medium">Nombre</span>
              <input className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-primary-main" value={formState.name} onChange={e => setFormState(f => ({ ...f, name: e.target.value }))} required disabled={saving} />
            </label>
            <label className="block mb-4">
              <span className="text-gray-700 text-sm font-medium">Padre</span>
              <select className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-primary-main" value={formState.parentId || ''} onChange={e => setFormState(f => ({ ...f, parentId: e.target.value || undefined }))} disabled={saving}>
                <option value="">Ninguno</option>
                {categories.filter(c => !formState.id || c.id !== formState.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2 mt-6">
              <Button text="Cancelar" type="secondary" onPress={closeModal} testID="cancel-modal" />
              <Button text={modalMode === 'add' ? 'Agregar' : 'Guardar'} type="primary-admin" htmlType="submit" testID="submit-modal" onPress={() => { }} disabled={saving} icon={modalMode === 'add' ? 'FaPlus' : 'FaEdit'} />
            </div>
          </form>
        </div>
      )}
      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg min-w-[340px] max-w-xs w-full">
            <Text size="xl" weight="bold" as="h2" className="mb-2 flex items-center gap-2 text-red-600">
              <FaExclamationTriangle className="text-red-500" />
              Eliminar categoría
            </Text>
            <Text size="md" color="gray-700" as="p" className="mb-4">¿Estás seguro de que deseas eliminar la categoría <span className="font-semibold">{categories.find(c => c.id === deleteId)?.name}</span>?</Text>
            <div className="flex justify-end gap-2 mt-6">
              <Button text="Cancelar" type="secondary" onPress={closeDelete} testID="cancel-delete" disabled={deleting} />
              <Button text={deleting ? 'Eliminando...' : 'Eliminar'} type="secondary" onPress={handleDelete} testID="confirm-delete" disabled={deleting} icon="FaTrash" />
            </div>
          </div>
        </div>
      )}

      {/* Translation Modal */}
      <CategoryTranslationModal
        isOpen={showTranslationModal}
        onClose={() => {
          setShowTranslationModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onTranslationUpdated={handleTranslationUpdated}
      />
    </div>
  );
}