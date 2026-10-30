-- =============================================================================
-- Esquema de referencia - Clinica Medica TFI 2026 - Grupo AF
-- -----------------------------------------------------------------------------
-- IMPORTANTE:
--   La aplicacion usa TypeORM con synchronize=true, por lo que las tablas se
--   crean/actualizan automaticamente al iniciar el backend.
--
--   Este archivo sirve como documentacion del diseno relacional y como script
--   opcional para inicializar una base vacia de forma manual.
--
--   Los usuarios, medicos y reservas de prueba NO se insertan aca: los crea el
--   seeder de NestJS (backend/src/seeders/seeders.service.ts).
-- =============================================================================

-- 1. Tipos ENUM ---------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE roles_usuarios AS ENUM ('MEDICO', 'PACIENTE', 'ADMINISTRADOR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE estados_usuarios AS ENUM ('ACTIVO', 'BAJA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE estados_reservas AS ENUM ('ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Usuarios -----------------------------------------------------------------
-- Base para la autenticacion JWT. Un usuario puede ser ADMINISTRADOR, MEDICO
-- o PACIENTE. La contrasena se guarda hasheada con bcrypt.
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  documento TEXT NOT NULL UNIQUE,
  apellidos TEXT NOT NULL,
  nombres TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  clave TEXT NOT NULL,
  estado estados_usuarios NOT NULL DEFAULT 'ACTIVO',
  rol roles_usuarios NOT NULL
);

-- 3. Medicos ------------------------------------------------------------------
-- Relacion 1 a 0..1 con usuarios:
--   * id_usuario es la clave foranea hacia usuarios.id.
--   * UNIQUE(id_usuario) impide que un mismo usuario tenga dos perfiles.
--   * matricula es la matricula profesional del medico (INT NOT NULL).
--   * valor_consulta es la tarifa actual del medico.
CREATE TABLE IF NOT EXISTS medicos (
  id SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL UNIQUE,
  matricula INTEGER NOT NULL,
  valor_consulta INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT fk_medicos_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id)
    ON DELETE CASCADE
);

-- 4. Reservas -----------------------------------------------------------------
-- Relacion 1 medico -> N reservas y 1 paciente -> N reservas.
-- valor_consulta se copia al momento de reservar para congelar la tarifa
-- historica, aunque despues el administrador cambie la tarifa del medico.
CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  id_medico INTEGER NOT NULL,
  id_paciente INTEGER NOT NULL,
  fecha_hora TIMESTAMP NOT NULL,
  estado estados_reservas NOT NULL DEFAULT 'ACTIVO',
  valor_consulta INTEGER NOT NULL,
  CONSTRAINT fk_reservas_medico
    FOREIGN KEY (id_medico)
    REFERENCES medicos (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_paciente
    FOREIGN KEY (id_paciente)
    REFERENCES usuarios (id)
    ON DELETE RESTRICT
);

-- 5. Indices recomendados -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_reservas_medico_fecha
  ON reservas (id_medico, fecha_hora);

CREATE INDEX IF NOT EXISTS idx_reservas_paciente
  ON reservas (id_paciente);

-- =============================================================================
-- Consultas utiles para verificar el diseno
-- =============================================================================
-- Medicos con sus datos de usuario:
--   SELECT m.id, u.nombres, u.apellidos, u.email, m.matricula, m.valor_consulta
--   FROM medicos m
--   JOIN usuarios u ON u.id = m.id_usuario
--   ORDER BY m.id;
--
-- Reservas con medico y paciente:
--   SELECT r.id, r.fecha_hora, r.estado, r.valor_consulta,
--          um.nombres || ' ' || um.apellidos AS medico,
--          up.nombres || ' ' || up.apellidos AS paciente
--   FROM reservas r
--   JOIN medicos m ON m.id = r.id_medico
--   JOIN usuarios um ON um.id = m.id_usuario
--   JOIN usuarios up ON up.id = r.id_paciente
--   ORDER BY r.fecha_hora;
-- =============================================================================
