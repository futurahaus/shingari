# Sistema de Diseño UI - Shingari

Este directorio contiene el sistema de diseño UI del proyecto Shingari, incluyendo la paleta de colores oficial y componentes reutilizables.

## 📁 Estructura

```
/ui/
├── colors.ts              # Paleta de colores oficial
├── ColorPalette.tsx       # Componente visual de la paleta
├── components/            # Componentes UI reutilizables
│   └── Button.tsx        # Componente de botón
├── page.tsx              # Página de demostración de componentes
└── README.md             # Este archivo
```

## 🎨 Paleta de Colores

### Colores Principales
- **Primary**: `#EA3D15` - Naranja/rojo principal (botones primarios)
- **Secondary**: `#363F45` - Gris oscuro (botones secundarios)

### Escala de Grises
- **Gray-50**: `#f9fafb` - Fondos muy claros
- **Gray-100**: `#f3f4f6` - Fondos claros
- **Gray-200**: `#e5e7eb` - Bordes claros
- **Gray-300**: `#d1d5db` - Bordes medios
- **Gray-400**: `#9ca3af` - Texto deshabilitado
- **Gray-500**: `#6b7280` - Texto terciario
- **Gray-600**: `#4b5563` - Texto secundario
- **Gray-700**: `#374151` - Texto principal
- **Gray-800**: `#1f2937` - Títulos
- **Gray-900**: `#111827` - Texto principal

### Colores de Estado
- **Success**: `#10b981` - Verde para éxito
- **Warning**: `#f59e0b` - Amarillo para advertencia
- **Error**: `#ef4444` - Rojo para error
- **Info**: `#3b82f6` - Azul para información

## 🚀 Cómo Usar

### Importar la Paleta

```typescript
import { colors, tailwindClasses } from '@/app/ui/colors';
```

### Uso Directo en Estilos

```typescript
// En componentes React
<div style={{ backgroundColor: colors.primary.main }}>
  Contenido
</div>
```

### Uso con Tailwind CSS

```typescript
// Usando colores personalizados
<button className="bg-[#EA3D15] text-white">
  Botón Primario
</button>

// Usando clases predefinidas
<button className={tailwindClasses.button.primary}>
  Botón Primario
</button>
```

### Uso en CSS/SCSS

```css
.my-component {
  background-color: #EA3D15;
  color: white;
}

.my-component:hover {
  background-color: #c53211;
}
```

## 🧩 Componentes Disponibles

### Button

Componente de botón reutilizable con soporte para diferentes tipos y iconos.

```typescript
import { Button } from '@/app/ui/components/Button';

<Button
  onPress={() => console.log('Click!')}
  type="primary"
  text="Guardar"
  testID="save-button"
  icon="FaSave"
/>
```

#### Props

- `onPress`: Función que se ejecuta al hacer clic
- `type`: `'primary' | 'secondary'` - Tipo de botón
- `text`: Texto del botón
- `testID`: ID para testing
- `icon`: Icono de FontAwesome (opcional)

## 📱 Visualización de la Paleta

Para ver una visualización completa de la paleta de colores, visita:
`/ui/color-palette`

O importa y usa el componente `ColorPalette`:

```typescript
import ColorPalette from '@/app/ui/ColorPalette';

// En tu página
<ColorPalette />
```

## 🎯 Mejores Prácticas

1. **Consistencia**: Siempre usa los colores definidos en `colors.ts`
2. **Accesibilidad**: Asegúrate de que el contraste de texto sea suficiente
3. **Estados**: Usa los colores de estado apropiados para feedback del usuario
4. **Responsive**: Los componentes están diseñados para ser responsive por defecto

## 🔧 Funciones Helper

### withOpacity()

Genera colores con opacidad específica:

```typescript
import { withOpacity } from '@/app/ui/colors';

const semiTransparent = withOpacity(colors.primary.main, 0.5);
```

### generateColorVariations()

Genera variaciones de un color base:

```typescript
import { generateColorVariations } from '@/app/ui/colors';

const variations = generateColorVariations(colors.primary.main);
// Retorna: { lighter, light, medium, dark, darker }
```

## 📝 Contribución

Al agregar nuevos colores o componentes:

1. Actualiza `colors.ts` con los nuevos colores
2. Agrega ejemplos en `ColorPalette.tsx`
3. Documenta el uso en este README
4. Mantén la consistencia con el sistema de diseño existente

## 🔗 Enlaces Útiles

- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [React Icons](https://react-icons.github.io/react-icons/) - Iconos
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/) - Verificar accesibilidad 