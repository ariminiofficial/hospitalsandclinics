module.exports = {
  apps: [
    {
      name: 'infinity-api',
      cwd: './api',
      script: 'src/index.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        CORS_ORIGIN: 'https://clinic.arimini.in',
        COOKIE_SECURE: 'true',
      },
      max_memory_restart: '500M',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
    },
  ],
};
