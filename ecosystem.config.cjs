module.exports = {
  apps: [
    {
      name: "Atlas",
      script: "index.js",
      cwd: __dirname,
      env: {
        PIDUSAGE_WMIC_DISABLED: "1",
        DOTENV_QUIET: "true",
        DOTENVX_QUIET: "true",
      },
      // interpreter: "bun",
      node_args: "--max-old-space-size=8000 --expose-gc", // ignored when using Bun
      autorestart: true,
      min_uptime: 10000,
      max_restarts: 100,
      exp_backoff_restart_delay: 1000,
      kill_timeout: 30000,
      watch: false,
    },
  ],
};
