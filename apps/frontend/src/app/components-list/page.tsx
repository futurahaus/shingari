'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export default function ComponentsListPage() {
  const handleButtonClick = (action: string) => {
    console.log(`Botón clickeado: ${action}`);
    // Aquí podrías agregar notificaciones o otras acciones
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Componentes UI - Ejemplos
          </h1>
          
          {/* Sección de Botones */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
              Componente Button
            </h2>
            
            <div className="space-y-8">
              {/* Botones Primarios */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Botones Primarios</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onPress={() => handleButtonClick('Guardar')}
                    type="primary"
                    text="Guardar"
                    testID="save-button"
                    icon="FaSave"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Buscar')}
                    type="primary"
                    text="Buscar"
                    testID="search-button"
                    icon="FaSearch"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Agregar')}
                    type="primary"
                    text="Agregar"
                    testID="add-button"
                    icon="FaPlus"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Confirmar')}
                    type="primary"
                    text="Confirmar"
                    testID="confirm-button"
                    icon="FaCheck"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Enviar')}
                    type="primary"
                    text="Enviar"
                    testID="send-button"
                  />
                </div>
              </div>

              {/* Botones Secundarios */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Botones Secundarios</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onPress={() => handleButtonClick('Cancelar')}
                    type="secondary"
                    text="Cancelar"
                    testID="cancel-button"
                    icon="FaTimes"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Editar')}
                    type="secondary"
                    text="Editar"
                    testID="edit-button"
                    icon="FaEdit"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Eliminar')}
                    type="secondary"
                    text="Eliminar"
                    testID="delete-button"
                    icon="FaTrash"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Ver Detalles')}
                    type="secondary"
                    text="Ver Detalles"
                    testID="details-button"
                    icon="FaEye"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Descargar')}
                    type="secondary"
                    text="Descargar"
                    testID="download-button"
                  />
                </div>
              </div>

              {/* Botones con diferentes iconos */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Botones con Diferentes Iconos</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onPress={() => handleButtonClick('Usuario')}
                    type="primary"
                    text="Usuario"
                    testID="user-button"
                    icon="FaUser"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Carrito')}
                    type="primary"
                    text="Carrito"
                    testID="cart-button"
                    icon="FaShoppingCart"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Configuración')}
                    type="secondary"
                    text="Configuración"
                    testID="settings-button"
                    icon="FaCog"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Notificaciones')}
                    type="secondary"
                    text="Notificaciones"
                    testID="notifications-button"
                    icon="FaBell"
                  />
                  
                  <Button
                    onPress={() => handleButtonClick('Ayuda')}
                    type="secondary"
                    text="Ayuda"
                    testID="help-button"
                    icon="FaQuestionCircle"
                  />
                </div>
              </div>

              {/* Casos de uso específicos */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Casos de Uso Específicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Formulario de ejemplo */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-4">Formulario de Ejemplo</h4>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          onPress={() => handleButtonClick('Guardar Formulario')}
                          type="primary"
                          text="Guardar"
                          testID="form-save-button"
                          icon="FaSave"
                        />
                        <Button
                          onPress={() => handleButtonClick('Cancelar Formulario')}
                          type="secondary"
                          text="Cancelar"
                          testID="form-cancel-button"
                          icon="FaTimes"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Acciones de lista */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-4">Acciones de Lista</h4>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          onPress={() => handleButtonClick('Agregar Item')}
                          type="primary"
                          text="Agregar"
                          testID="add-item-button"
                          icon="FaPlus"
                        />
                        <Button
                          onPress={() => handleButtonClick('Editar Item')}
                          type="secondary"
                          text="Editar"
                          testID="edit-item-button"
                          icon="FaEdit"
                        />
                        <Button
                          onPress={() => handleButtonClick('Eliminar Item')}
                          type="secondary"
                          text="Eliminar"
                          testID="delete-item-button"
                          icon="FaTrash"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Información del componente */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-4">Información del Componente</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Propiedades:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>onPress: () =&gt; void</code> - Función que se ejecuta al hacer clic</li>
                <li><code>type: &apos;primary&apos; | &apos;secondary&apos;</code> - Tipo de botón</li>
                <li><code>text: string</code> - Texto del botón</li>
                <li><code>testID: string</code> - Identificador para testing</li>
                <li><code>icon?: keyof typeof FaIcons</code> - Icono opcional de Font Awesome</li>
              </ul>
              <p className="mt-4"><strong>Iconos disponibles:</strong> Cualquier icono de Font Awesome (FaSave, FaSearch, FaPlus, etc.)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 