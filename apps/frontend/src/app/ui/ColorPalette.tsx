'use client';

import React from 'react';
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
        className="w-20 h-20 rounded-lg border border-gray-200 mb-2 flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <span className="text-xs font-mono" style={{ color: textColor }}>
          {color}
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

const ColorSection: React.FC<{ title: string; colors: Record<string, string | { main: string; contrast?: string }>; description?: string }> = ({
  title,
  colors,
  description
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

export default function ColorPalette() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Paleta de Colores - Shingari
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Sistema de colores oficial del proyecto
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
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Colores de Estado</h3>
            <p className="text-sm text-gray-600 mb-4">Colores para diferentes estados y feedback del usuario</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(colors.status).map(([statusName, statusColors]) => (
                <div key={statusName} className="space-y-3">
                  <h4 className="text-md font-medium text-gray-700 capitalize">{statusName}</h4>
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
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Escala de Grises</h3>
            <p className="text-sm text-gray-600 mb-4">Escala completa de grises para textos, fondos y bordes</p>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
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
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Cómo Usar Esta Paleta</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Importar:</strong> <code className="bg-blue-100 px-2 py-1 rounded">import {'{ colors }'} from &apos;@/app/ui/colors&apos;</code></p>
              <p><strong>Uso directo:</strong> <code className="bg-blue-100 px-2 py-1 rounded">style={'{ backgroundColor: colors.primary.main }'}</code></p>
              <p><strong>Con Tailwind:</strong> <code className="bg-blue-100 px-2 py-1 rounded">className=&quot;bg-[#EA3D15]&quot;</code></p>
              <p><strong>Clases predefinidas:</strong> <code className="bg-blue-100 px-2 py-1 rounded">import {'{ tailwindClasses }'} from &apos;@/app/ui/colors&apos;</code></p>
            </div>
          </div>

          {/* Ejemplos de Componentes */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ejemplos de Uso en Componentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Botón Primario</h4>
                <button className="bg-[#EA3D15] text-white px-4 py-2 rounded-lg hover:bg-[#c53211] transition-colors">
                  Botón Primario
                </button>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Botón Secundario</h4>
                <button className="bg-transparent text-[#363F45] border border-[#363F45] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  Botón Secundario
                </button>
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
        </div>
      </div>
    </div>
  );
}