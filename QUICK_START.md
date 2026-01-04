# 🚀 QUICK START - Agregar Productos (5 minutos)

## ⚡ Lo Básico en 30 Segundos

1. **Abre** la app → Ve a **Inventario**
2. **Haz clic** en el botón **[+]** (esquina inferior derecha)
3. **Completa** los campos (nombre, código, categoría, stock)
4. **Haz clic** en **"Guardar Producto"**
5. **¡Listo!** Verás el producto en la lista ✅

---

## 📝 Los 4 Campos Obligatorios

```
🏷️  NOMBRE          →  "Limpiador Multiusos"
📊  CÓDIGO          →  "PROD001"
📁  CATEGORÍA       →  "limpieza"
📦  STOCK INICIAL   →  "50"
```

---

## 🎯 Campos Opcionales (Bonus)

```
🖼️  IMAGEN URL      →  "https://ejemplo.com/img.jpg"
📞  TELÉFONO        →  "+57 300 1234567"
📄  DESCRIPCIÓN     →  "Limpiador versátil para todas las superficies"
```

---

## 📸 Screenshot del Modal

```
┌─────────────────────────────────────┐
│ ✕ Nuevo Producto                    │
├─────────────────────────────────────┤
│                                     │
│         [PREVIEW IMAGEN]            │
│                                     │
│ URL: https://...           (opcional)
│ Nombre: Limpiador Multiusos *       │
│ Código: PROD001 *                   │
│ Categoría: limpieza *               │
│ Teléfono: +57... (opcional)         │
│ Stock: 50 *                         │
│ Descripción: ... (opcional)         │
│                                     │
│ [Cancelar] [✓ Guardar Producto]    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🌍 URLs Listas para Copiar y Pegar

**Limpieza:**
```
https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400
```

**Absorbentes:**
```
https://images.unsplash.com/photo-1624618454411-a9cbfad44f05?w=400&h=400
```

**Dispensadores:**
```
https://images.unsplash.com/photo-1600255894947-c6f763139aa5?w=400&h=400
```

---

## ❌ Errores Comunes

| Error | Solución |
|-------|----------|
| "Nombre es obligatorio" | Escribe un nombre (mín. 3 caracteres) |
| "Código debe tener al menos 2 caracteres" | Agrega más caracteres al código |
| "Imagen no cargó" | Verifica que la URL sea válida |
| Botón "Guardar" deshabilitado | Completa los campos obligatorios |

---

## 💾 ¿Los datos se guardan en Firebase?

✅ **SÍ** - Automático

Cuando haces clic en "Guardar", los datos se envían a Firebase de forma **asincrónica** (no bloquea la app).

Se registra automáticamente en:
- Colección: `productos`
- Historial: `historial` (para auditoría)

---

## 📱 ¿Funciona en mi celular?

✅ **SÍ** - Funciona en:
- iPhone (iOS)
- Android
- Tablets
- Desktop/Laptop

---

## 🎬 Ejemplo Paso a Paso

### Paso 1: Abrir Modal
```
Inventario → Botón [+] → Modal abierto ✨
```

### Paso 2: Agregar URL Imagen (opcional)
```
Copia → https://images.unsplash.com/photo-1585771...
Pega en "URL de la imagen"
Espera → Imagen aparece en preview 📸
```

### Paso 3: Llenar Datos
```
Nombre:        "Papel Higiénico Premium"
Código:        "PH-001"
Categoría:     "absorbentes" (click selector)
Stock:         "100"
Teléfono:      "+57 300 1234567" (opcional)
Descripción:   "Papel higiénico 3 capas" (opcional)
```

### Paso 4: Guardar
```
Click en "✓ Guardar Producto"
⏳ Guardando...
✅ Producto agregado exitosamente!
Modal cierra automáticamente
```

### Paso 5: Verificar
```
Lista se actualiza automáticamente
¡Ves tu nuevo producto en la lista! 🎉
```

---

## 🔍 Validaciones Automáticas

```
✅ Nombre:     3+ caracteres
✅ Código:     2+ caracteres, se convierte a MAYÚSCULAS
✅ Categoría:  3 opciones (limpieza, absorbentes, dispensadores)
✅ Stock:      Solo números, ≥ 0
✅ Teléfono:   Solo números y símbolos (+, -, ())
✅ Imagen URL: Valida formato URL
```

---

## 🎨 Colores del Modal

```
Header:        Gradiente Azul → Púrpura
Campos OK:     Gris neutro
Campos ERROR:  Rojo (se muestran mensajes)
Botón OK:      Azul (habilitado cuando válido)
Botón Cancel:  Gris (siempre habilitado)
```

---

## ⏱️ Tiempos

```
Abrir modal:        0.3 segundos
Escribir campos:    Tu velocidad 😄
Guardar:            1-3 segundos
Toast notificación: 2 segundos
Modal cierra:       Automático
```

---

## 🆘 ¿Qué Hago Si...?

### ... no aparece el botón (+)?
→ Revisa que estés en la página de **Inventario**

### ... el modal no se abre?
→ Intenta cerrar la app y abrirla de nuevo

### ... Firebase da error?
→ Verifica que tienes **conexión a internet**

### ... la imagen no carga?
→ Usa otra URL. Intenta con las de ejemplo

### ... no puedo hacer click en "Guardar"?
→ Rellena **todos los campos obligatorios** (marcados con *)

---

## 📚 Documentación Completa

Para más detalles, lee:
- `AGREGAR_PRODUCTOS_GUIA.md` - Guía completa
- `RESUMEN_CAMBIOS_PRODUCTOS.md` - Cambios técnicos
- `GUIA_VISUAL_INTERFAZ.md` - Cómo se ve

---

## ✅ Checklist de Tu Primer Producto

- [ ] Abrí el modal
- [ ] Escribí un nombre
- [ ] Escribí un código
- [ ] Seleccioné categoría
- [ ] Escribí stock
- [ ] (Opcional) Agregué imagen
- [ ] (Opcional) Agregué teléfono
- [ ] (Opcional) Agregué descripción
- [ ] Hice clic en "Guardar"
- [ ] ✅ ¡Producto creado!

---

## 🎁 Tips Pro

💡 **Tip 1:** Los códigos se convierten automáticamente a MAYÚSCULAS
```
Escribes: "prod001" → Se guarda como "PROD001"
```

💡 **Tip 2:** Puedes dejar campos opcionales en blanco
```
Solo obligatorios: nombre, código, categoría, stock
```

💡 **Tip 3:** La imagen carga automáticamente mientras escribes
```
Pega URL → espera 1s → imagen aparece en preview
```

💡 **Tip 4:** Si hay error, verás el mensaje en rojo debajo
```
Arregla el campo → El mensaje desaparece → Botón se habilita
```

💡 **Tip 5:** Puedes cambiar categoría usando el dropdown
```
Click en categoría → Selecciona limpieza/absorbentes/dispensadores
```

---

## 🚀 ¡Listo Para Empezar!

```
Inventario → [+] → Completa campos → ✓ Guardar → ✅ ¡Hecho!
```

**¡Feliz a agregar productos! 🎉**

---

**Creado:** Diciembre 2025  
**Comparte esta guía con tu equipo:** 📲  
**Si necesitas ayuda:** 💬 Revisa la documentación completa
