/**
 * Paleta de Colores - Shingari
 * 
 * Este archivo define la paleta de colores oficial del sitio web Shingari.
 * Los colores están organizados por categorías y incluyen variaciones para diferentes estados.
 */

export const colors = {
  // Colores Principales de la Marca
  primary: {
    main: '#EA3D15',      // Naranja/rojo principal (usado en botones primarios)
    light: '#ff5a3a',     // Versión más clara para hover
    dark: '#c53211',      // Versión más oscura para hover
    contrast: '#ffffff',  // Color de texto sobre el fondo principal
  },

  // Colores Secundarios
  secondary: {
    main: '#363F45',      // Gris oscuro (usado en botones secundarios)
    light: '#4a5568',     // Versión más clara
    dark: '#2d3748',      // Versión más oscura
    contrast: '#ffffff',  // Color de texto sobre el fondo secundario
  },

  // Colores de Admin (Negro)
  admin: {
    main: '#000000',      // Negro principal (usado en botones de admin)
    light: '#1f2937',     // Versión más clara para hover
    dark: '#000000',      // Versión más oscura para hover
    contrast: '#ffffff',  // Color de texto sobre el fondo admin
  },

  // Colores Neutros
  neutral: {
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },

  // Colores de Estado
  status: {
    success: {
      main: '#10b981',    // Verde para éxito
      light: '#34d399',
      dark: '#059669',
      contrast: '#ffffff',
    },
    warning: {
      main: '#f59e0b',    // Amarillo para advertencia
      light: '#fbbf24',
      dark: '#d97706',
      contrast: '#ffffff',
    },
    error: {
      main: '#ef4444',    // Rojo para error
      light: '#f87171',
      dark: '#dc2626',
      contrast: '#ffffff',
    },
    info: {
      main: '#3b82f6',    // Azul para información
      light: '#60a5fa',
      dark: '#2563eb',
      contrast: '#ffffff',
    },
  },

  // Colores de Fondo
  background: {
    primary: '#ffffff',   // Fondo principal
    secondary: '#f9fafb', // Fondo secundario (gray-50)
    tertiary: '#f3f4f6',  // Fondo terciario (gray-100)
  },

  // Colores de Texto
  text: {
    primary: '#111827',   // Texto principal (gray-900)
    secondary: '#4b5563', // Texto secundario (gray-600)
    tertiary: '#6b7280',  // Texto terciario (gray-500)
    disabled: '#9ca3af',  // Texto deshabilitado (gray-400)
    inverse: '#ffffff',   // Texto sobre fondos oscuros
  },

  // Colores de Borde
  border: {
    light: '#e5e7eb',     // Bordes claros (gray-200)
    medium: '#d1d5db',    // Bordes medios (gray-300)
    dark: '#9ca3af',      // Bordes oscuros (gray-400)
    primary: '#EA3D15',   // Bordes con color primario
    secondary: '#363F45', // Bordes con color secundario
  },

  // Colores de Sombra
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

/**
 * Clases de Tailwind CSS predefinidas para usar con esta paleta
 */
export const tailwindClasses = {
  // Botones
  button: {
    primary: 'bg-[#EA3D15] text-white hover:bg-[#c53211] focus:ring-[#EA3D15]',
    'primary-admin': 'bg-[#000000] text-white hover:bg-[#1f2937] focus:ring-[#000000]',
    secondary: 'bg-transparent text-[#363F45] border border-[#363F45] hover:bg-gray-100 focus:ring-[#363F45]',
    success: 'bg-[#10b981] text-white hover:bg-[#059669] focus:ring-[#10b981]',
    warning: 'bg-[#f59e0b] text-white hover:bg-[#d97706] focus:ring-[#f59e0b]',
    error: 'bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444]',
  },

  // Textos
  text: {
    primary: 'text-[#111827]',
    secondary: 'text-[#4b5563]',
    tertiary: 'text-[#6b7280]',
    disabled: 'text-[#9ca3af]',
    inverse: 'text-white',
  },

  // Fondos
  background: {
    primary: 'bg-white',
    secondary: 'bg-[#f9fafb]',
    tertiary: 'bg-[#f3f4f6]',
  },

  // Bordes
  border: {
    light: 'border-[#e5e7eb]',
    medium: 'border-[#d1d5db]',
    dark: 'border-[#9ca3af]',
    primary: 'border-[#EA3D15]',
    secondary: 'border-[#363F45]',
  },
};

/**
 * Función helper para obtener colores con opacidad
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Convierte hex a rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Función helper para generar variaciones de color
 */
export const generateColorVariations = (baseColor: string) => {
  return {
    lighter: withOpacity(baseColor, 0.1),
    light: withOpacity(baseColor, 0.3),
    medium: withOpacity(baseColor, 0.5),
    dark: withOpacity(baseColor, 0.7),
    darker: withOpacity(baseColor, 0.9),
  };
};

export default colors; 