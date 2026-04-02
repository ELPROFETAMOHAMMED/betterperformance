-- Migración en Supabase
CREATE TABLE IF NOT EXISTS rate_limits (
  key        TEXT        PRIMARY KEY,
  count      INTEGER     NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-limpiar registros viejos (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- En Supabase Dashboard -> Database -> Cron Jobs
-- Para limpiar reportes antiguos (Requiere extensión pg_cron activada en dashboard)
SELECT cron.schedule(
  'cleanup-rate-limits',
  '0 * * * *',  -- cada hora
  $$DELETE FROM rate_limits 
    WHERE window_start < NOW() - INTERVAL '2 hours'$$
);
