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

---

## 📂 Estructura del Repositorio


TFI-GrupoAF/
├── backend/            # API REST desarrollada en NestJS
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── frontend/           # Aplicación Web desarrollada en Angular
│   ├── src/
│   ├── package.json
│   └── angular.json
├── .gitignore          # Filtro global de Git
└── README.md           # Documentación principal del proyecto

---

##  Configuración e Instalación

###  Base de Datos (PostgreSQL)
Tener PostgreSQL corriendo (vía Docker o instalación local) y crear la base de datos:
```sql
CREATE DATABASE clinica_medica;
```

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
3. Crear un archivo `.env` basado en `.env.example`:
   
4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```
   *El backend estará disponible en `http://localhost:3000/api`*

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
   ng serve
   ```
   *El frontend estará disponible en `http://localhost:4200`*

---

##  Documentación de la API (Swagger & Compodoc)

* **Swagger UI (Interactive API Docs):**  
  Con el backend ejecutándose, podés acceder a la documentación interactiva e ingresar el token JWT en:  
  **`http://localhost:3000/api/docs`**

* **Compodoc (Documentación de Angular):**  
  Para generar la documentación visual del frontend:
  ```bash
  npm run compodoc
  ```

---

##  Video de Presentación del Sistema

Link al video demostrativo del funcionamiento del sistema y defensa de los integrantes:  
 **[Ver Video en YouTube](https://youtube.com/...)** 
```

---

