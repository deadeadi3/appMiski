# 🖼️ GUÍA VISUAL - Interfaz del Sistema de Agregar Productos

## 📸 Vista 1: Página de Inventario

```
┌─────────────────────────────────────────────────────────┐
│ ◀ [LOGO] ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Header
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Inventario                                              │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ ○ Limpieza │ Absorbentes │ Dispensadores        │   │ ← Categorías
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ 🔍 Buscar productos...                                  │ ← Búsqueda
│                                                          │
│ [📦] Total productos: 12 productos                      │ ← Tarjeta destacada
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [IMG] Limpiador Multiusos              ⋯        │    │ ← Producto 1
│ │       Código: LIM-001                           │    │
│ │       Limpiador versátil...                     │    │
│ │       [🟢 Stock: 45]              ✎ 🗑         │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [IMG] Desinfectante 500ml                  ⋯   │    │ ← Producto 2
│ │       Código: DES-002                          │    │
│ │       Mata 99.9% de bacterias...               │    │
│ │       [🔴 Stock: 5]                ✎ 🗑        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│                  ◄ 1  2  3  4  ►                        │ ← Paginación
│                                                          │
│                                                    [+]   │ ← Botón Flotante
│                                                          │   (Cuando haces clic)
└─────────────────────────────────────────────────────────┘
```

---

## 📸 Vista 2: Modal Nuevo Producto (Abierto)

```
┌─────────────────────────────────────────────────────────┐
│ ✕ Nuevo Producto                                        │ ← Header Gradiente
├─────────────────────────────────────────────────────────┤
│ ═════════════════════════════════════════════════════   │ ← Handle
│                                                         │
│                  ╔═══════════════════╗                  │
│                  ║                   ║                  │ ← Preview Imagen
│                  ║   [IMAGEN HERE]   ║  120x120         │
│                  ║                   ║                  │
│                  ╚═══════════════════╝                  │
│           Carga la URL de la imagen                     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🖼  URL de la imagen                            │   │ ← Campo imagen
│ │ https://ejemplo.com/imagen.jpg                  │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🏷  Nombre del producto *                       │   │ ← Campo nombre
│ │ Ej: Limpiador Multiusos                         │   │   (requerido)
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📊  Código del producto *                       │   │ ← Campo código
│ │ Ej: PROD001                                     │   │   (requerido)
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📁  Categoría *                              ▼  │   │ ← Categoría
│ │ ◉ limpieza  ○ absorbentes ○ dispensadores       │   │   (dropdown)
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📞  Teléfono de contacto                        │   │ ← Teléfono
│ │ +57 (123) 456-7890                              │   │   (opcional)
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📦  Stock inicial *                             │   │ ← Stock
│ │ 0                                               │   │   (requerido)
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📄  Descripción                                 │   │ ← Descripción
│ │ Escribe una descripción del producto (opcional) │   │   (opcional)
│ │ ____________________________________            │   │
│ │                                                 │   │
│ │                                                 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────┐      │
│  │ Cancelar         │  │ ✓ Guardar Producto   │      │ ← Botones
│  └──────────────────┘  └──────────────────────┘      │
│                                                         │
│  * Campos obligatorios                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📸 Vista 3: Validación de Errores

```
┌─────────────────────────────────────────────────────────┐
│ ✕ Nuevo Producto                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 🏷  Nombre del producto *                       │  │
│  │ [campo vacío]                                   │  │ ← Campo inválido
│  │ ❌ Nombre es obligatorio                        │  │   (mensaje error)
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 📊  Código del producto *                       │  │
│  │ A                                               │  │ ← Campo inválido
│  │ ❌ Código debe tener al menos 2 caracteres     │  │   (mensaje error)
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 📞  Teléfono de contacto                        │  │
│  │ abc@xyz                                         │  │ ← Campo inválido
│  │ ❌ Teléfono contiene caracteres inválidos      │  │   (mensaje error)
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ Cancelar         │  │ ✓ Guardar Producto      │   │ ← Botón deshabilitado
│  │ (habilitado)     │  │ (deshabilitado - gris)   │   │
│  └──────────────────┘  └──────────────────────────┘   │
│                                                         │
│  * Campos obligatorios                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📸 Vista 4: Guardando Producto

```
┌─────────────────────────────────────────────────────────┐
│ ✕ Nuevo Producto                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  ⏳ Agregando producto...              │ ← Loading Spinner
│                  [⟳ ⟳ ⟳ ⟳]                            │   (animado)
│                                                         │
│  [Formulario deshabilitado mientras guarda]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📸 Vista 5: Confirmación de Éxito

```
┌─────────────────────────────────────────────────────────┐
│ ◀ [LOGO]                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Inventario                                              │
│                                                         │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    │
│  ┃ ✅ Producto agregado exitosamente              ┃    │ ← Toast notificación
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛    │   (en la parte inferior)
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ ○ Limpieza │ Absorbentes │ Dispensadores        │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ [📦] Total productos: 13 productos                     │ ← Contador actualizado
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ [IMG] Limpiador Multiusos              ⋯        │   │
│ │       Código: PROD001 ✨                       │   │ ← Nuevo producto
│ │       Limpiador versátil...                    │   │   (aparece aquí)
│ │       [🟢 Stock: 50]              ✎ 🗑         │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Otros productos...]                                 │
│                                                         │
│                                                    [+]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Paleta de Colores

```
┌────────────────────────────────────────────────────────┐
│ PRIMARY (Header/Botones):  ■ #6366f1 → #4f46e5        │
│ SUCCESS (Confirmación):    ■ #10b981                  │
│ DANGER (Eliminación):      ■ #ef4444                  │
│ WARNING (Validación):      ■ #f59e0b                  │
│ BACKGROUND:                ■ #f9fafb → #f3f4f6       │
│ BORDER:                    ■ #e5e7eb                  │
│ TEXT PRIMARY:              ■ #1f2937                  │
│ TEXT SECONDARY:            ■ #9ca3af                  │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Interacciones Principales

### 1. Abrir Modal
```
Usuario toca [+] en esquina inferior derecha
        ↓
Modal se desliza hacia arriba (animación)
        ↓
Se muestra form with preview section
```

### 2. Cambiar Imagen
```
Usuario escribe URL en campo imagen
        ↓
Campo validado (sin enviar)
        ↓
Imagen cargada en preview (120x120)
        ↓
Error? → Mostrar imagen por defecto
```

### 3. Guardar Producto
```
Usuario completa campos requeridos
        ↓
Botón "Guardar" se habilita
        ↓
Usuario toca "Guardar"
        ↓
Loading aparece
        ↓
Firebase recibe datos
        ↓
Toast de éxito ✅
        ↓
Modal se cierra (animación)
        ↓
Lista se actualiza automáticamente
```

### 4. Cancelar
```
Usuario toca "Cancelar" o icono ✕
        ↓
Modal se cierra (animación inversa)
        ↓
Datos se pierden (confirmación tácita)
```

---

## 📱 Responsive Breakpoints

### Mobile (320px - 480px)
```
Modal a pantalla completa
Touch-friendly buttons
Vertical layout
Deslizable (swipe up/down)
```

### Tablet (481px - 768px)
```
Modal 50-95% de pantalla
Landscape support
Breakpoints: 25%, 50%, 95%
```

### Desktop (769px+)
```
Modal centrado
Máximo ancho mantenido
Hover effects activos
```

---

## 🎬 Animaciones

### Modal Entrada
```
Duración: 0.3s
Easing: ease-out
Tipo: slideUp
Effect: Sube desde abajo
```

### Cambios de Foco
```
Duración: 0.3s ease
Efecto: Border cambia color → Primary
Shadow aumenta ligeramente
```

### Hover en Botones
```
Primary: Translucent more, shadow increases
Outline: Border y color cambian → Primary
```

---

## 🔔 Estados del Modal

### Estado Inicial
```
- Modal cerrado
- Botón (+) en esquina inferior derecha
- Visible y accesible
```

### Estado Abierto
```
- Modal visible con handle arriba
- Forma está completa
- Campos vacíos listos para input
- Validaciones inactivas (sin errores mostrados)
```

### Estado Validación
```
- Usuario llena campos
- Validación en tiempo real
- Mensajes de error se muestran
- Botón habilitado/deshabilitado según validez
```

### Estado Guardando
```
- Loading spinner visible
- Formulario deshabilitado
- No se puede cerrar con swipe
- Esperando respuesta de Firebase
```

### Estado Éxito
```
- Modal cierra automáticamente
- Toast aparece 2 segundos
- Lista se recarga
- Nuevo producto visible
```

---

## ⌨️ Accesibilidad

✅ **Labels accesibles** - Cada input tiene label
✅ **Mensajes de error claros** - Textos descriptivos
✅ **Colores de validación** - Rojo para error
✅ **Iconos descriptivos** - Cada campo tiene icono
✅ **Botones grandes** - Touch-friendly (44px+)
✅ **Textos legibles** - Contraste suficiente
✅ **Teclado navegable** - Tab order correcto

---

## 🎓 Flujo de Usuario Completo

```
┌─ Entra a inventario-miski
│
├─ Ve lista de productos
│  ├─ Productos con imágenes
│  ├─ Información del stock
│  └─ Botón (+) en esquina
│
└─ Toca botón (+)
   │
   ├─ Modal se abre (swipe up animation)
   │  ├─ Preview de imagen vacío
   │  ├─ 7 campos del formulario
   │  ├─ 2 botones: Cancelar / Guardar
   │  └─ No validaciones iniciales
   │
   ├─ Escribe datos
   │  ├─ Validación en tiempo real
   │  ├─ Si imagen: preview actualiza
   │  ├─ Si error: mensaje rojo aparece
   │  └─ Botón se habilita cuando válido
   │
   ├─ Toca "Guardar Producto"
   │  ├─ Loading spinner aparece
   │  ├─ Envío asincrónico a Firebase
   │  ├─ Se registra en historial
   │  ├─ Lista se recarga automático
   │  ├─ Toast ✅ aparece 2s
   │  └─ Modal se cierra
   │
   └─ Ve lista actualizada
      └─ ¡Nuevo producto visible! 🎉
```

---

**Creado:** Diciembre 2025  
**Última actualización:** Diciembre 2025  
**Compatible con:** iOS | Android | Web Browsers
