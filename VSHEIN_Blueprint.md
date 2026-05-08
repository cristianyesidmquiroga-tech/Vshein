# 👗 Blueprint del Proyecto: VSHEIN (Catálogo de Moda)

## 1. COMPRENSIÓN DEL PROYECTO (El "Qué" y "Por qué")
- **Objetivo:** Crear un catálogo digital inmersivo y premium para una tienda de ropa de mujer (inspirado en la estética de Shein/Zara) ubicada en Vélez, Santander.
- **Público Objetivo:** Mujeres. La interfaz debe ser altamente visual, limpia y rápida (usando la tendencia *"Expressive Minimalism"*).
- **Alcance:** Funciona como un "Showroom" digital para generar deseo, redirigir a la tienda física y mejorar el SEO. No requiere carrito de compras ni pasarela de pagos complejos.

## 2. ARQUITECTURA TÉCNICA (Aplicando nuestras 11 Skills)
- **Backend (Skill 4 & 6):** `Python` + `Flask`. Uso de `Blueprints` para separar la vista pública de la privada. Base de datos manejada con `SQLAlchemy` (ORM) en modo transparente (`ECHO=True`).
- **Frontend (Skill 1 & 5):** Arquitectura Desacoplada (API-First). `Vanilla JS` para la lógica interactiva. Para el diseño, usaremos un esquema de colores sofisticado (fondos claros, acentos en tonos pastel/oscuros elegantes), *Glassmorphism* para los menús, e imágenes grandes de alta calidad.
- **Seguridad (Skill 3):** Panel de Administrador blindado con encriptación (`Bcrypt`) y protección contra ataques por fuerza bruta.

## 3. MAPA DE LA BASE DE DATOS
1. **User:** (Solo para el Admin) `id`, `username`, `password_hash`.
2. **Product:** `id`, `name`, `description`, `price`, `stock`, `image_url`, `sales_count` (para filtrar los más vendidos), `created_at`.
3. **Comment:** `id`, `author`, `content`, `rating`, `created_at` (Para SEO y "Social Proof").

## 4. PLAN DE EJECUCIÓN PASO A PASO

### Fase 1: Cimientos y Arquitectura (Feature-Based Structure)
- Inicializar el entorno virtual y git (`.gitignore`, `requirements.txt`).
- Crear la estructura de carpetas basada en tus imágenes (Híbrida / Por Feature):
  - `/features/auth/` (Rutas, controladores y modelos del Admin).
  - `/features/products/` (Rutas y modelos del catálogo y stock).
  - `/core/` o `/shared/` (Configuración de base de datos y utilidades).
- Construir e instanciar la base de datos (SQLite inicial).

### Fase 2: El Cerebro Administrativo (Seguridad)
- Crear el sistema de Login exclusivo para ti (el Admin).
- Construir el Dashboard de Inventario.
- Programar la **Alerta de Stock Mínimo** (Ej: Si `stock < 5`, la fila se pone en rojo o envía alerta).
- Filtros para ordenar por *Más Vendidos* y *Mayor Stock*.

### Fase 3: La Experiencia Pública (Frontend UI/UX)
- **Home/Catálogo:** Grilla de productos estilo "Bento Grid", limpia, donde destaquen las fotos de la ropa.
- **Página de Producto:** Ver detalles del producto sin recargar la página (usando JS `fetch`).
- **Sección 'Quiénes Somos':** Historia visual de la tienda.
- **Ubicación:** Incrustar Google Maps apuntando a Vélez, Santander.
- **Comentarios:** Sistema visual de reseñas para potenciar el SEO orgánico.

### Fase 4: Pulido (QA & Mantenimiento)
- Revisar "Edge Cases" (Skill 9) como intentar agregar un producto sin foto.
- Asegurar que no quede código muerto (Skill 4).
- Documentar cómo subir productos nuevos en el `README.md`.
