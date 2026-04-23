# Cuaderno de Ataques — Corte 3

**Sistema:** Clínica Veterinaria VetSecure  
**Stack:** PostgreSQL 16 · Redis 7 · Node.js (Express) · Next.js  
**Fecha de documentación:** Abril 2026

---

## Preguntas 
**1. ¿Qué política RLS aplicaste a la tabla mascotas? Pega la cláusula exacta y explica con tus palabras qué hace.**
Esta política restringe el acceso para que los veterinarios solo puedan ver a las mascotas que atienden, funciona verificando en una tabla intermedia si existe una relación activa entre el ID del veterinario que inició sesión y la mascota, si no están vinculados, la fila no aparece.

```SQL 
CREATE POLICY pol_mascotas_vet ON mascotas
    FOR SELECT TO veterinario
    USING (id IN (SELECT mascota_id FROM vet_atiende_mascota WHERE vet_id = current_setting('app.current_vet_id', true)::INT AND activa = TRUE));

```
---
**2. Cualquiera que sea la estrategia que elegiste para identificar al veterinario actual en RLS, tiene un vector de ataque posible. ¿Cuál es? ¿Tu sistema lo previene? ¿Cómo?**
El mayor riesgo es la suplantación de identidad, ya que al usar variables de sesión (current_setting), un atacante podría intentar inyectar SQL para cambiar el valor de app.current_vet_id y así saltarse el filtro para ver datos de otros doctores, pero el sistema lo previene usando consultas parametrizadas en el backend, al no concatenar el ID directamente en el texto de la consulta, el motor de la base de datos lo trata como un valor literal y no permite que se ejecuten comandos maliciosos para alterar la sesión.
---
**3. Si usas 'SECURITY DEFINER' en algún procedure, ¿qué medida específica tomaste para prevenir la escalada de
privilegios que ese modo habilita? Si no lo usas, justifica por qué no era necesario.**
No utilice SECURITY DEFINER, use el modo por defecto SECURITY INVOKER para seguir con el mínimo privilegio, garantizando que los procedimientos se ejecuten con los permisos limitados del usuario, evitando que alguien pueda escalar privilegios y realizar acciones de administrador de forma no autorizada.
---
**4. ¿Qué TTL le pusiste al caché Redis y por qué ese valor específico? ¿Qué pasaría si fuera demasiado bajo?
¿Demasiado alto?**
Siento que 5min. es un tiempo razonable para mejorar el rendimiento de la vista de vacunación sin que los datos se queden desactualizados por mucho tiempo, ya que si llegase a ser más bajo, el caché se borraría muy rápido, por lo cual la bd trabajaría igual y no vieramos cambios y si llegase a ser más largo, debido a que es una clinikca esta el riesgo de que una mascota podría aparecer como "pendiente de vacuna" cuando en realidad ya se le aplicó.
---

**5. Tu frontend manda input del usuario al backend. Elige un endpoint crítico y pega la línea exacta donde el backend maneja ese input antes de enviarlo a la base de datos. Explica qué protege esa línea y de qué. Indica archivo y número de línea.**

**Archivo:** `API/src/routes/mascotas.js`,
**Línea exacta:**
```javascript
const result = await client.query(sql, params); //linea 36
```
---
Al usar el arreglo params, el driver se encarga de limpiar el input del usuario antes de mandarlo a la base de datos, por lo que si alguien intenta meter caracteres especiales o comandos como DROP TABLE, el sistema los procesa como simple texto y no como órdenes de ejecución.

**6. Si revocas todos los permisos del rol de veterinario excepto SELECT en mascotas, ¿qué deja de funcionar en tu
sistema? Lista tres operaciones que se romperían.**
- No se le podría agendar nuevas consultas ni modificar las existentes ya que no tendría permisos sobre los procedures.
- No podría marcar vacunas como aplicadas, por lo que el historial clínico no se actualizaría.
- El sistema arrojaría errores constantes porque el trigger de auditoría no podría insertar registros en la tabla de movimientos cada vez que el veterinario intente hacer un cambio.