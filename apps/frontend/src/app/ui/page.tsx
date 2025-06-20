'use client';

import React, { useState } from 'react';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { colors } from './colors';

interface ColorSwatchProps {
  name: string;
  color: string;
  textColor?: string;
  description?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, color, textColor = '#ffffff', description }) => {
  return (
    <div className="flex flex-col">
      <div 
        className="w-16 h-16 rounded-lg border border-gray-200 mb-2 flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <span className="text-xs font-mono" style={{ color: textColor }}>
          {color}
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-gray-900">{name}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

const ColorSection: React.FC<{ title: string; colors: Record<string, any>; description?: string }> = ({ 
  title, 
  colors, 
  description 
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(colors).map(([key, value]) => {
          if (typeof value === 'string') {
            return (
              <ColorSwatch
                key={key}
                name={key}
                color={value}
                textColor={key.includes('white') || key.includes('light') ? '#000000' : '#ffffff'}
              />
            );
          } else if (typeof value === 'object' && value.main) {
            return (
              <ColorSwatch
                key={key}
                name={key}
                color={value.main}
                textColor={value.contrast || '#ffffff'}
                description={value.main}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default function ComponentsListPage() {
  const [activeTab, setActiveTab] = useState<'components' | 'colors'>('components');

  const handleButtonClick = (action: string) => {
    console.log(`Botón clickeado: ${action}`);
    // Aquí podrías agregar notificaciones o otras acciones
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Sistema de Diseño UI - Shingari
          </h1>

          {/* Tabs de navegación */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('components')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'components'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Componentes
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'colors'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Paleta de Colores
              </button>
            </div>
          </div>

          {/* Contenido de Componentes */}
          {activeTab === 'components' && (
            <>
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

              {/* Sección de Text */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                  Componente Text
                </h2>
                
                <div className="space-y-8">
                  {/* Diferentes Tamaños */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Diferentes Tamaños</h3>
                    <div className="space-y-2">
                      <Text size="xs" testID="text-xs">Texto extra pequeño (xs)</Text>
                      <Text size="sm" testID="text-sm">Texto pequeño (sm)</Text>
                      <Text size="md" testID="text-md">Texto mediano (md) - Por defecto</Text>
                      <Text size="lg" testID="text-lg">Texto grande (lg)</Text>
                      <Text size="xl" testID="text-xl">Texto extra grande (xl)</Text>
                      <Text size="2xl" testID="text-2xl">Texto 2xl</Text>
                      <Text size="3xl" testID="text-3xl">Texto 3xl</Text>
                      <Text size="4xl" testID="text-4xl">Texto 4xl</Text>
                    </div>
                  </div>

                  {/* Diferentes Pesos */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Diferentes Pesos</h3>
                    <div className="space-y-2">
                      <Text weight="light" testID="text-light">Texto light</Text>
                      <Text weight="normal" testID="text-normal">Texto normal - Por defecto</Text>
                      <Text weight="medium" testID="text-medium">Texto medium</Text>
                      <Text weight="semibold" testID="text-semibold">Texto semibold</Text>
                      <Text weight="bold" testID="text-bold">Texto bold</Text>
                      <Text weight="extrabold" testID="text-extrabold">Texto extrabold</Text>
                    </div>
                  </div>

                  {/* Diferentes Colores */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Diferentes Colores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Colores de Texto</h4>
                        <Text color="primary" testID="text-primary">Texto primario</Text>
                        <Text color="secondary" testID="text-secondary">Texto secundario</Text>
                        <Text color="tertiary" testID="text-tertiary">Texto terciario</Text>
                        <Text color="disabled" testID="text-disabled">Texto deshabilitado</Text>
                        <div className="bg-gray-800 p-2 rounded">
                          <Text color="inverse" testID="text-inverse">Texto inverso</Text>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Colores Principales</h4>
                        <Text color="primary-main" testID="text-primary-main">Color principal</Text>
                        <Text color="primary-light" testID="text-primary-light">Color principal claro</Text>
                        <Text color="primary-dark" testID="text-primary-dark">Color principal oscuro</Text>
                        <div className="bg-[#EA3D15] p-2 rounded">
                          <Text color="primary-contrast" testID="text-primary-contrast">Contraste principal</Text>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Colores de Estado</h4>
                        <Text color="success" testID="text-success">Texto de éxito</Text>
                        <Text color="warning" testID="text-warning">Texto de advertencia</Text>
                        <Text color="error" testID="text-error">Texto de error</Text>
                        <Text color="info" testID="text-info">Texto informativo</Text>
                      </div>
                    </div>
                  </div>

                  {/* Combinaciones */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Combinaciones</h3>
                    <div className="space-y-4">
                      <Text size="xl" weight="bold" color="primary-main" testID="text-combo-1">
                        Título principal con color de marca
                      </Text>
                      <Text size="lg" weight="semibold" color="secondary" testID="text-combo-2">
                        Subtítulo con peso semibold
                      </Text>
                      <Text size="md" weight="medium" color="success" testID="text-combo-3">
                        Mensaje de éxito con peso medium
                      </Text>
                      <Text size="sm" weight="normal" color="tertiary" testID="text-combo-4">
                        Texto descriptivo más pequeño
                      </Text>
                    </div>
                  </div>

                  {/* Diferentes Elementos HTML */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Diferentes Elementos HTML</h3>
                    <div className="space-y-2">
                      <Text as="h1" size="3xl" weight="bold" color="primary-main" testID="text-h1">
                        Título H1
                      </Text>
                      <Text as="h2" size="2xl" weight="semibold" color="secondary" testID="text-h2">
                        Título H2
                      </Text>
                      <Text as="h3" size="xl" weight="medium" color="gray-700" testID="text-h3">
                        Título H3
                      </Text>
                      <Text as="span" size="md" color="tertiary" testID="text-span">
                        Texto en span
                      </Text>
                      <Text as="label" size="sm" weight="medium" color="gray-600" testID="text-label">
                        Etiqueta de formulario
                      </Text>
                    </div>
                  </div>
                </div>
              </section>

              {/* Información del componente */}
              <section className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-4">Información de los Componentes</h3>
                <div className="text-sm text-blue-700 space-y-4">
                  <div>
                    <p><strong>Componente Button - Propiedades:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><code>onPress: () =&gt; void</code> - Función que se ejecuta al hacer clic</li>
                      <li><code>type: &apos;primary&apos; | &apos;secondary&apos;</code> - Tipo de botón</li>
                      <li><code>text: string</code> - Texto del botón</li>
                      <li><code>testID: string</code> - Identificador para testing</li>
                      <li><code>icon?: keyof typeof FaIcons</code> - Icono opcional de Font Awesome</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p><strong>Componente Text - Propiedades:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><code>children: React.ReactNode</code> - Contenido del texto</li>
                      <li><code>size?: &apos;xs&apos; | &apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; | &apos;xl&apos; | &apos;2xl&apos; | &apos;3xl&apos; | &apos;4xl&apos;</code> - Tamaño del texto</li>
                      <li><code>weight?: &apos;light&apos; | &apos;normal&apos; | &apos;medium&apos; | &apos;semibold&apos; | &apos;bold&apos; | &apos;extrabold&apos;</code> - Peso de la fuente</li>
                      <li><code>color?: TextColor</code> - Color del texto (usa la paleta de colores)</li>
                      <li><code>as?: &apos;p&apos; | &apos;span&apos; | &apos;div&apos; | &apos;h1&apos; | &apos;h2&apos; | &apos;h3&apos; | &apos;h4&apos; | &apos;h5&apos; | &apos;h6&apos; | &apos;label&apos;</code> - Elemento HTML</li>
                      <li><code>className?: string</code> - Clases CSS adicionales</li>
                      <li><code>testID?: string</code> - Identificador para testing</li>
                    </ul>
                  </div>
                  
                  <p className="mt-4"><strong>Iconos disponibles:</strong> Cualquier icono de Font Awesome (FaSave, FaSearch, FaPlus, etc.)</p>
                </div>
              </section>
            </>
          )}

          {/* Contenido de Paleta de Colores */}
          {activeTab === 'colors' && (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                  Paleta de Colores - Shingari
                </h2>
                <p className="text-gray-600 mb-6">
                  Sistema de colores oficial del proyecto organizado por categorías y uso.
                </p>

                {/* Colores Principales */}
                <ColorSection
                  title="Colores Principales"
                  description="Colores de marca principales utilizados en botones y elementos destacados"
                  colors={colors.primary}
                />

                {/* Colores Secundarios */}
                <ColorSection
                  title="Colores Secundarios"
                  description="Colores complementarios para elementos secundarios"
                  colors={colors.secondary}
                />

                {/* Colores de Estado */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Colores de Estado</h3>
                  <p className="text-sm text-gray-600 mb-3">Colores para diferentes estados y feedback del usuario</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(colors.status).map(([statusName, statusColors]) => (
                      <div key={statusName} className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 capitalize">{statusName}</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(statusColors).map(([colorKey, colorValue]) => (
                            <ColorSwatch
                              key={colorKey}
                              name={colorKey}
                              color={colorValue as string}
                              textColor={colorKey === 'contrast' ? '#000000' : '#ffffff'}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escala de Grises */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Escala de Grises</h3>
                  <p className="text-sm text-gray-600 mb-3">Escala completa de grises para textos, fondos y bordes</p>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                    {Object.entries(colors.neutral.gray).map(([shade, color]) => (
                      <ColorSwatch
                        key={shade}
                        name={`gray-${shade}`}
                        color={color}
                        textColor={parseInt(shade) < 500 ? '#000000' : '#ffffff'}
                      />
                    ))}
                  </div>
                </div>

                {/* Colores de Texto */}
                <ColorSection
                  title="Colores de Texto"
                  description="Colores específicos para diferentes tipos de texto"
                  colors={colors.text}
                />

                {/* Colores de Fondo */}
                <ColorSection
                  title="Colores de Fondo"
                  description="Colores para diferentes niveles de fondo"
                  colors={colors.background}
                />

                {/* Colores de Borde */}
                <ColorSection
                  title="Colores de Borde"
                  description="Colores para bordes y separadores"
                  colors={colors.border}
                />

                {/* Información de Uso */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Cómo Usar Esta Paleta</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>Importar:</strong> <code className="bg-blue-100 px-2 py-1 rounded">import {'{ colors }'} from '@/app/ui/colors'</code></p>
                    <p><strong>Uso directo:</strong> <code className="bg-blue-100 px-2 py-1 rounded">style={'{ backgroundColor: colors.primary.main }'}</code></p>
                    <p><strong>Con Tailwind:</strong> <code className="bg-blue-100 px-2 py-1 rounded">className="bg-[#EA3D15]"</code></p>
                    <p><strong>Clases predefinidas:</strong> <code className="bg-blue-100 px-2 py-1 rounded">import {'{ tailwindClasses }'} from '@/app/ui/colors'</code></p>
                  </div>
                </div>

                {/* Ejemplos de Componentes */}
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Ejemplos de Uso en Componentes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Botón Primario</h4>
                      <Button
                        onPress={() => handleButtonClick('Ejemplo Primario')}
                        type="primary"
                        text="Botón Primario"
                        testID="example-primary-button"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Botón Secundario</h4>
                      <Button
                        onPress={() => handleButtonClick('Ejemplo Secundario')}
                        type="secondary"
                        text="Botón Secundario"
                        testID="example-secondary-button"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Texto Principal</h4>
                      <p className="text-[#111827]">Este es un ejemplo de texto principal</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Texto Secundario</h4>
                      <p className="text-[#4b5563]">Este es un ejemplo de texto secundario</p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 