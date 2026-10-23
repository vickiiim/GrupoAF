/**
 * Configuracion de PM2 para el backend NestJS (TFI 2026 - Grupo AF).
 *
 * Uso:
 *   pm2 start ecosystem.config.js            # entorno production
 *   pm2 start ecosystem.config.js --env development
 *   pm2 logs grupoaf-backend
 *   pm2 reload grupoaf-backend
 *   pm2 save && pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'grupoaf-backend',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      time: true,
      kill_timeout: 5000,
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Las variables ya presentes en el entorno tienen prioridad sobre el .env
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || 5433,
        DB_USERNAME: process.env.DB_USERNAME || 'postgres',
        DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
        DB_DATABASE: process.env.DB_DATABASE || 'clinica_medica',
        JWT_SECRET: process.env.JWT_SECRET || 'cambiar_esta_clave_en_produccion',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        exec_mode: 'fork',
        autorestart: true,
        watch: true,
      },
    },
  ],
};
