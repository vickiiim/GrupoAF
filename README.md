#  Sistema de Gestión de Citas Médicas - TFI 2026

**Tecnicatura Universitaria en Desarrollo Web — FCAD UNER**  
**Materia:** Desarrollo de Aplicaciones Web / Programación III  
**Trabajo Final Integrador (TFI) — Grupo AF**

---

##  Integrantes y Módulos

| Integrante | Módulo / Responsabilidad |
| :--- | :--- |
| **Sánchez, Miriam Silvana** | Autenticación, Roles (JWT Guards), DTOs Login y Seguridad, Implementación de Guards de acceso (\`@Roles('MEDICO')\`) |
| **Mamberti, Victoria Belén** | Módulo de Pacientes (Reserva de Turnos, Congelamiento de Tarifas y DTOs) | Interfaz de Agenda: Desarrollo de los componentes visuales (\`agenda-medico\`), tabla de turnos y selector de fechas con Angular Material. |
| **Chisté, Sandra** | Módulo de Pacientes (Historial de Reservas, Cancelaciones y ValidationPipes) | Endpoints del controlador de médicos, servicio de consulta de disponibilidad por fecha y cambio de estados (\`ATENDIDO\`/\`AUSENTE\`).
| **Pérez Martín** | Base de Datos (PostgreSQL/Docker), Nginx, PM2 y Documentación y Diseño relacional de la tabla \`medicos\`|

---

##  Descripción del Proyecto

Aplicación Full-Stack para la gestión de reservas de citas médicas en una clínica. El sistema permite:
* **Pacientes:** Solicitar turnos en franja horaria (08:00 a 16:00 hs), visualizar el historial con tarifas congeladas históricamente y cancelar turnos con restricciones según la fecha.
* **Médicos:** Consultar la agenda diaria por fecha y actualizar el estado de los turnos (`ATENDIDO` / `AUSENTE`).
* **Administradores:** Control total del sistema y cancelaciones de turnos de último momento.

---

## 🛠️ Stack Tecnológico

* **Backend:** NestJS, TypeORM, Class-Validator, Swagger, JWT, Bcrypt.
* **Frontend:** Angular (Standalone Components, RxJS, Bootstrap / CSS).
* **Base de Datos:** PostgreSQL (ejecutado vía Docker / Local).
* **Servidor & Despliegue:** Nginx, PM2, Environment Config (`.env`).

> 📘 **Guía ordenada de Docker, PostgreSQL, PM2, Nginx y diseño de `medicos`:**
> [`deploy/GUIA_DESPLIEGUE.md`](deploy/GUIA_DESPLIEGUE.md)

---

## 📂 Estructura del Repositorio

```
TFI-GrupoAF/
├── backend/                    # API REST desarrollada en NestJS
│   ├── src/
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── ecosystem.config.js     # Configuracion de PM2 (nombre, env, modo de ejecucion)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Aplicacion Web desarrollada en Angular
│   ├── src/
│   ├── proxy.conf.json         # Proxy de desarrollo: /api -> http://localhost:3000
│   ├── angular.json            # -> serve.options.proxyConfig = "proxy.conf.json"
│   ├── package.json
│   └── tsconfig.json
├── deploy/
│   ├── GUIA_DESPLIEGUE.md      # Guia ordenada: Docker, PM2, Nginx y diseno de medicos
│   ├── database/
│   │   ├── docker-compose.yml  # PostgreSQL 16 en Docker
│   │   └── init.sql            # DDL de referencia del modelo relacional
│   ├── nginx/
│   │   ├── clinica.conf        # Bloque server: / -> Angular, /api -> NestJS
│   │   └── nginx.conf          # Configuracion principal de Nginx
│   └── scripts/
│       └── deploy.sh           # Script de despliegue (build + PM2 + Nginx)
├── .gitignore                  # Filtro global de Git
└── README.md                   # Documentacion principal del proyecto
```

---

## ⚙️ Configuración e Instalación

###  Base de Datos (PostgreSQL)

Tener PostgreSQL corriendo (vía Docker o instalación local) y crear la base de datos:
```sql
CREATE DATABASE clinica_medica;
```

Con Docker:
```bash
docker run -d --name postgres-clinica -p 5434:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=clinica_medica postgres:16
```

> **Alternativa recomendada:** usar el `docker-compose.yml` incluido, que agrega
> un volumen para no perder los datos:
> ```bash
> cd deploy/database
> docker compose up -d
> ```
> Ver [`deploy/GUIA_DESPLIEGUE.md`](deploy/GUIA_DESPLIEGUE.md) para el paso a paso
> completo de Docker, PM2, Nginx y el diseño relacional de `medicos`.

---

###  Backend (NestJS)

1. Ingresar a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Crear el archivo `.env` a partir de `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Variables disponibles:

   | Variable | Descripción | Valor por defecto |
   | :--- | :--- | :--- |
   | `PORT` | Puerto del backend (destino del proxy) | `3000` |
   | `DB_HOST` / `DB_PORT` | Host y puerto de PostgreSQL | `localhost` / `5434` |
   | `DB_USERNAME` / `DB_PASSWORD` | Credenciales de la base | `postgres` / `postgres` |
   | `DB_DATABASE` | Nombre de la base de datos | `clinica_medica` |
   | `JWT_SECRET` | Clave de firma de los tokens JWT | *(cambiar en producción)* |

4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```
   *El backend estará disponible en `http://localhost:3000/api`*

   Al arrancar, el seeder verifica y crea (si no existen) los usuarios de prueba:

   | Rol | Nombre | Email | Contraseña inicial |
   | :--- | :--- | :--- | :--- |
   | Administrador | Valentina Ríos | `admin@clinica.com` | `123456` |
   | Médico | Martín Gómez | `medico@clinica.com` | `123456` |
   | Médico | Laura Benítez | `laura.benitez@clinica.com` | `123456` |
   | Médico | Diego Sosa | `diego.sosa@clinica.com` | `123456` |
   | Paciente | Sofía Martínez | `paciente@clinica.com` | `123456` |

   También crea tres reservas activas de ejemplo para Sofía Martínez, una con cada
   médico, en fechas futuras dentro del horario de atención.

   La contraseña se guarda hasheada con bcrypt. Podés cambiarla con
   `SEED_DEFAULT_PASSWORD` o desactivar la creación automática con
   `SEED_DEFAULT_USERS=false`.

5. Tests:
   ```bash
   npm test          # tests unitarios
   npm run lint      # linting con oxlint
   npm run test:e2e  # tests end-to-end (requiere PostgreSQL levantado)
   ```

---

###  Frontend (Angular)

1. Ingresar a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar la aplicación Angular:
   ```bash
   npm start
   ```
   *El frontend estará disponible en `http://localhost:4200`*

####  Proxy de desarrollo (rutas relativas)

El frontend **nunca** escribe la URL del backend en el código: todos los servicios
(`AuthService`, `ReservaService`, etc.) consumen rutas relativas (`/api/auth/login`,
`/api/v1/reservas`...). El proxy de desarrollo (archivo `frontend/proxy.conf.json`)
se encarga de reenviarlas al backend:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  }
}
```

El archivo está enganchado en `angular.json` (`serve -> options -> proxyConfig`), por lo que
`ng serve` ya lo aplica de forma automática:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

* `GET http://localhost:4200/api/...` → `GET http://localhost:3000/api/...` (backend)
* `GET http://localhost:4200/api/docs` → Swagger UI development

---

## 🚀 Despliegue en producción (PM2 + Nginx)

###  PM2 — backend en segundo plano

El archivo `backend/ecosystem.config.js` define el nombre de la app, el script de arranque
(`dist/main.js`), las variables de entorno y el modo de ejecución:

```bash
cd backend
npm run build                 # genera dist/main.js
pm2 start ecosystem.config.js --env production
pm2 status                    # la app queda corriendo en segundo plano
pm2 logs grupoaf-backend      # ver los logs en vivo
pm2 restart grupoaf-backend   # reiniciar tras un despliegue
pm2 save && pm2 startup       # reinicio automatico del servidor
```

###  Nginx — archivos estáticos + proxy de la API

La configuración está en `deploy/nginx/clinica.conf`:

| Ruta | Destino |
| :--- | :--- |
| `/` | Archivos estáticos de Angular (`frontend/dist/frontend/browser`) con fallback a `index.html` |
| `/api/` | `proxy_pass` hacia el backend NestJS (`http://127.0.0.1:3000`) |
| `/api/docs` | Documentación interactiva de Swagger |

Instalación en Ubuntu/Debian:

```bash
sudo cp deploy/nginx/clinica.conf /etc/nginx/sites-available/clinica
sudo ln -s /etc/nginx/sites-available/clinica /etc/nginx/sites-enabled/clinica
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

> **Importante:** la directiva `root` de `clinica.conf` debe apuntar a la carpeta donde se
> compila Angular (`<ruta-del-repo>/frontend/dist/frontend/browser`). El script de despliegue
> la ajusta automáticamente.

###  Despliegue completo (un solo comando)

```bash
sudo bash deploy/scripts/deploy.sh
```

El script compila el backend, lo deja corriendo con PM2, compila el frontend, instala la
configuración de Nginx y recarga el servicio.

---

##  Documentación de la API (Swagger & Compodoc)

* **Swagger UI (Interactive API Docs):**  
  Con el backend ejecutándose, podés acceder a la documentación interactiva e ingresar el token JWT en:  
  **`http://localhost:3000/api/docs`** (en producción: `http://<servidor>/api/docs`)

* **Compodoc (Documentación de Angular):**  
  Para generar la documentación visual del frontend:
  ```bash
  cd frontend
  npm run compodoc         # genera la documentación y la publica en http://localhost:8080
  npm run compodoc:build   # solo genera la documentación en ./documentation
  ```

---

##  Video de Presentación del Sistema

Link al video demostrativo del funcionamiento del sistema y defensa de los integrantes:  
  **[Ver Video en YouTube](https://youtube.com/...)**

> En el video se debe demostrar: el backend corriendo con `pm2 status` / `pm2 logs`,
> el acceso a `/api/docs` (Swagger) y la aplicación servida por Nginx (`/` y `/api/`).

---

