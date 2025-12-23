# Guía de Despliegue a Vercel (Sin Git)

## Opción 1: Desplegar con Vercel CLI (Más Rápido)

### Paso 1: Login en Vercel
```bash
vercel login
```
Sigue las instrucciones para autenticarte.

### Paso 2: Desplegar
```bash
vercel --prod
```

El CLI te preguntará:
- **Setup and deploy?** → Yes
- **Which scope?** → Selecciona tu cuenta
- **Link to existing project?** → Si ya tienes el proyecto: Yes, sino: No
- **Project name?** → `my-secret-santa` (o el nombre que prefieras)
- **Directory?** → `.` (presiona Enter)

Vercel automáticamente:
1. Detectará la configuración en `vercel.json`
2. Ejecutará `npm run build`
3. Desplegará tu aplicación

### Paso 3: Configurar Variables de Entorno

Después del primer despliegue, ve al dashboard de Vercel:
1. Abre tu proyecto en https://vercel.com/dashboard
2. Ve a **Settings** → **Environment Variables**
3. Agrega:
   - `DATABASE_URL`: Tu connection string de Neon
   - Cualquier otra variable de tu archivo `.env`

4. Redespliega para aplicar las variables:
   ```bash
   vercel --prod
   ```

---

## Opción 2: Instalar Git y Usar GitHub (Para Auto-Deploy)

Si quieres usar Git para auto-deploy:

### 1. Instalar Git para Windows
- Descarga desde: https://git-scm.com/download/win
- Instala con las opciones por defecto
- Reinicia PowerShell

### 2. Configurar Git Remote
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
```

### 3. Push a GitHub
```bash
git add .
git commit -m"Configure Vercel deployment"
git push -u origin main
```

### 4. Conectar Vercel con GitHub
1. Ve a https://vercel.com/dashboard
2. Click en **Import Project**
3. Conecta tu repositorio de GitHub
4. Vercel auto-desplegará en cada push

---

## Recomendación

**Usa la Opción 1 (Vercel CLI)** por ahora. Es más rápido y no requiere configurar Git. Una vez que funcione, puedes configurar Git después si lo necesitas.

## Comando Rápido

```bash
vercel --prod
```

¡Eso es todo! 🚀
