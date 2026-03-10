"use client";

import React from "react";
import Image from "next/image";
import { FaFolder, FaEdit, FaTrash, FaPlus, FaGlobe, FaCheck } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { Category } from "../productos/hooks/useCategories.hook";

type CategoryWithChildren = Category & { children: CategoryWithChildren[]; order?: number };

interface CategoryTreeWithDndProps {
  localTree: CategoryWithChildren[];
  tree: CategoryWithChildren[];
  onDragEnd: (result: DropResult, nodes: CategoryWithChildren[], parentId?: string) => Promise<void>;
  sortByOrder: (a: CategoryWithChildren, b: CategoryWithChildren) => number;
  getTranslatedName: (cat: Category) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
  openTranslationModal: (cat: Category) => void;
  openEditModal: (cat: Category) => void;
  openDelete: (id: string) => void;
  openAddModal: (parentId?: string) => void;
}

export function CategoryTreeWithDnd({
  localTree,
  tree,
  onDragEnd,
  sortByOrder,
  getTranslatedName,
  t,
  openTranslationModal,
  openEditModal,
  openDelete,
  openAddModal,
}: CategoryTreeWithDndProps) {
  function renderDraggableTree(nodes: CategoryWithChildren[], level = 0, parentId?: string) {
    const sortedNodes = [...nodes].sort((a, b) => {
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return a.name.localeCompare(b.name);
    });
    return (
      <DragDropContext onDragEnd={(result) => onDragEnd(result, sortedNodes, parentId)}>
        <Droppable droppableId={parentId ? `droppable-${parentId}` : "root-categories"}>
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={
                level === 0
                  ? "space-y-1"
                  : "ml-5 border-l-2 border-gray-100 pl-3 space-y-1 flex-1"
              }
            >
              {sortedNodes.map((cat, idx) => (
                <Draggable key={cat.id} draggableId={cat.id} index={idx}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center group rounded px-1 py-1 hover:bg-gray-50 transition relative bg-white ${
                        snapshot.isDragging ? "ring-2 ring-primary-main" : ""
                      }`}
                      style={{ minHeight: 28, ...provided.draggableProps.style }}
                    >
                      <span className="flex items-center mr-2">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            width={18}
                            height={18}
                            className="rounded object-cover"
                          />
                        ) : (
                          <FaFolder className="text-gray-400 w-4 h-4" />
                        )}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-medium text-gray-900 truncate text-base"
                            title={getTranslatedName(cat)}
                          >
                            {getTranslatedName(cat)}
                          </span>
                        </div>
                        {cat.translations && cat.translations.length > 0 && (
                          <div className="flex items-center mt-1">
                            <FaCheck className="w-3 h-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-600 font-medium">
                              {t("admin.categories.translated")} (
                              {cat.translations!.map((tr) => tr.locale).join(", ")})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openTranslationModal(cat)}
                          className={`p-1 rounded-lg transition ${
                            cat.translations && cat.translations.length > 0
                              ? "text-green-600 hover:text-green-700"
                              : "text-gray-600 hover:text-blue-600"
                          }`}
                          title={
                            cat.translations && cat.translations.length > 0
                              ? t("admin.categories.translate_category_already", {
                                  locales: cat.translations!.map((tr) => tr.locale).join(", "),
                                } as Record<string, string>)
                              : t("admin.categories.translate_category")
                          }
                          type="button"
                        >
                          <FaGlobe size={13} />
                        </button>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1 text-gray-600 hover:text-blue-600 rounded-lg transition"
                          title={t("admin.categories.edit_category")}
                          type="button"
                        >
                          <FaEdit size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(cat.id)}
                          className="p-1 text-gray-600 hover:text-red-600 rounded-lg transition"
                          title={t("admin.categories.delete_category")}
                          type="button"
                        >
                          <FaTrash size={13} />
                        </button>
                        <button
                          onClick={() => openAddModal(cat.id)}
                          className="p-1 text-gray-600 hover:text-green-600 rounded-lg transition"
                          title={t("admin.categories.add_subcategory")}
                          type="button"
                        >
                          <FaPlus size={13} />
                        </button>
                      </div>
                      {cat.children && cat.children.length > 0 &&
                        renderDraggableTree(cat.children, level + 1, cat.id)}
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
    <div className="bg-white rounded-lg shadow-sm p-4">
      {renderDraggableTree([...localTree].sort(sortByOrder))}
    </div>
  );
}
