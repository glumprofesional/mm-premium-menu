# Sistema de Diseño: Menú Premium M&M

## 1. Filosofía de Diseño: "Everything is Design"

Cada decisión, desde la elección de una fuente hasta la latencia de una animación, es una decisión de diseño. No hay elementos neutros. Cada componente, cada píxel y cada milisegundo contribuye a la percepción de la marca y a la experiencia del usuario. Nuestro principio rector es la **intencionalidad**. Nada es arbitrario.

---

## 2. Principios Fundamentales

### 2.1. Cinematic Minimalism
No es solo "diseño oscuro", es una aproximación cinematográfica. Pensamos en términos de dirección de fotografía: la luz (blancos y colores de acento) se usa deliberadamente para guiar el ojo en un entorno predominantemente oscuro. El espacio negativo es tan importante como el contenido. El objetivo es crear enfoque, drama y claridad, eliminando todo lo superfluo.

### 2.2. Premium Through Restraint (Lo Premium a través de la Contención)
La verdadera sofisticación no grita; susurra. Evitamos la decoración excesiva. La calidad se manifiesta en la contención: animaciones sutiles, una paleta de colores limitada pero impactante y una jerarquía visual impecable. La fuerza de nuestro diseño reside en lo que decidimos *no* mostrar.

### 2.3. Intentionality Over Decoration (Intencionalidad sobre Decoración)
Cada línea, sombra y animación debe tener un propósito: mejorar la legibilidad, proporcionar feedback o guiar al usuario. No se añade nada por mero valor estético. Si un elemento puede ser eliminado sin afectar negativamente la función o la claridad, debe ser eliminado.

### 2.4. Anti-Generic AI Design
Rechazamos activamente la estética predeterminada, las plantillas comunes y los patrones de diseño genéricos que a menudo surgen de herramientas de IA sin dirección. Nuestro diseño debe sentirse único, artesanal y alineado con la identidad de marca de M&M. Buscamos una personalidad visual distintiva, no una solución algorítmica.

---

## 3. Principios de Experiencia de Usuario (UX)

### 3.1. Emotional Performance
La performance no es solo una métrica técnica (ms de carga), sino una sensación. Una interfaz que se siente instantánea genera confianza, control y una percepción de calidad. Priorizamos la **velocidad percibida**: la aplicación debe sentirse más rápida de lo que es. Esto se logra a través de transiciones optimistas, skeletons y una respuesta inmediata al input del usuario.

### 3.2. Tactile Feeling
La interfaz debe responder al tacto de una manera que se sienta física y gratificante. Los botones deben dar la sensación de ser presionados, las listas deben desplazarse con una inercia natural y las transiciones deben ser fluidas. Esta sensación táctil es clave para que la experiencia se sienta nativa y no como una simple página web.

### 3.3. Mobile-First & Performance-First
El diseño comienza en el viewport más pequeño y restrictivo. Esta restricción nos fuerza a priorizar y ser intencionales. El rendimiento visual es un componente del diseño, no una ocurrencia tardía. Los elementos visuales se eligen y optimizan para garantizar que no degraden la velocidad.

### 3.4. Accessibility as a Foundation
La accesibilidad no es una lista de verificación, es un pilar del diseño premium. Un diseño accesible es, por definición, un diseño más claro y usable para todos. Garantizamos un alto contraste, tipografía legible, navegación coherente y áreas de toque adecuadas.

---

## 4. Sistema Visual

### 4.1. Typography Philosophy
La tipografía es la voz de nuestra interfaz.
*   **Reglas Explícitas:**
    *   **Jerarquía:** Usar una escala tipográfica clara y consistente (ej. 3-4 niveles: Título de página, Título de sección, Cuerpo de texto, Texto secundario). La variación de peso (Bold, Regular) y tamaño crea ritmo y guía al usuario.
    *   **Legibilidad:** Priorizar la legibilidad en condiciones de poca luz. El interlineado debe ser generoso (aprox. 150% del tamaño de la fuente) para facilitar la lectura rápida.
    *   **Intencionalidad:** Cada elección de fuente debe tener una justificación. Evitar el uso de más de dos familias tipográficas.

### 4.2. Color Philosophy
Nuestra paleta es restringida y de alto contraste, diseñada para un entorno oscuro.
*   **Reglas Explícitas:**
    *   **Base:** Un fondo casi negro (ej. `#0A0A0A`) en lugar de negro puro para reducir la fatiga visual.
    *   **Contenido:** Blancos y grises de alto contraste para el texto (`#FFFFFF`, `#E0E0E0`).
    *   **Acento:** 1-2 colores de acento vibrantes pero no abrumadores. Se usan exclusivamente para elementos interactivos (botones, enlaces activos) y puntos de interés clave.
    *   **Gradientes:** **Prohibidos**. Los gradientes introducen complejidad visual y una sensación de "diseño web" que queremos evitar. Usamos colores sólidos.

### 4.3. Spacing & Rhythm
El espacio es una herramienta activa para reducir la carga cognitiva.
*   **Reglas Explícitas:**
    *   **Sistema de Espaciado:** Usar una cuadrícula base (ej. 8px). Todos los márgenes, paddings y espaciados deben ser múltiplos de esta base para crear un ritmo visual consistente.
    *   **Densidad de Información:** Moderada. Evitar el desorden visual, pero asegurar que la información esencial sea accesible sin necesidad de hacer scroll excesivo. El equilibrio es clave.
    *   **Asimetría vs. Balance:** Emplear un balance asimétrico para crear interés visual y guiar la mirada, pero mantener una estructura subyacente que se sienta ordenada y estable.

### 4.4. Motion & Animation Philosophy
El movimiento debe ser sutil, funcional y performante.
*   **Reglas Explícitas:**
    *   **Motion Restraint:** Menos es más. Las animaciones deben ser casi imperceptibles, como transiciones de opacidad o movimientos muy sutiles.
    *   **Duración:** Las animaciones deben ser rápidas (150-250ms). Cualquier cosa más lenta se percibe como un retraso.
    *   **Propósito:** El movimiento se usa para:
        1.  **Feedback:** Confirmar una acción (ej. un botón que cambia sutilmente al ser presionado).
        2.  **Transición de Estado:** Guiar al usuario entre dos vistas (ej. una tarjeta que se expande).
    *   **Blur & Glassmorphism:** **Prohibidos**. Estos efectos son costosos en términos de rendimiento y contradicen nuestros principios de minimalismo y velocidad. La claridad se logra con opacidad y color, no con desenfoque.

---

## 5. Componentes y Patrones

### 5.1. Cards, Buttons & Badges
*   **Cards:** Deben sentirse como objetos físicos y elevados.
    *   **Sombras:** Usar sombras sutiles y difusas para crear profundidad. **Regla explícita:** Evitar sombras duras y oscuras. Utilizar múltiples capas de sombra suave para un efecto más natural. No usar `box-shadow` genéricos.
*   **Buttons:** Son la principal llamada a la acción.
    *   **Feedback:** Deben tener estados claros (default, hover, pressed). El estado presionado debe dar una sensación táctil, hundiéndose ligeramente.
    *   **Premium Interaction:** Evitar efectos de "glow" o animaciones llamativas. La interacción premium es sutil: un cambio de color o una ligera transformación de escala.
*   **Loading States (Skeletons):**
    *   **Regla explícita:** Siempre usar "skeletons" (marcadores de posición con la forma del contenido final) en lugar de spinners genéricos. Esto reduce la velocidad percibida de carga y gestiona las expectativas del usuario. Los skeletons deben tener una animación de pulso muy sutil para indicar actividad.

### 5.2. Imágenes
*   **Reglas Explícitas:**
    *   **Propósito:** Las imágenes de los productos deben ser de alta calidad, pero optimizadas agresivamente para la web.
    *   **Carga:** Implementar "lazy loading" por defecto. Las imágenes que no están en el viewport no se cargan.
    *   **Placeholder:** Usar un placeholder de color sólido o un blur de muy baja resolución (LQIP) mientras la imagen carga para evitar saltos de layout.

---

## 6. Anti-Patrones: Lo que Debemos Evitar

*   **Sin Decoración Innecesaria:** Divisores, iconos decorativos, fondos con patrones.
*   **Sin Desorden Visual:** Demasiada información compitiendo por la atención.
*   **Sin Sensación de Plantilla:** Diseños que se sienten prefabricados o genéricos.
*   **Sin Estética de IA por Defecto:** Colores sobresaturados, gradientes, sombras irreales, tipografía sin personalidad.
*   **Sin Tiempos de Carga Perceptibles:** Evitar spinners siempre que sea posible.
*   **Sin Animaciones Injustificadas:** El movimiento porque sí está prohibido.

