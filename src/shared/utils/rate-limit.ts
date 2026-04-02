import { createClient } from "@/shared/utils/supabase/server";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const supabase = await createClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const { data, error } = await supabase
    .from("rate_limits")
    .select("count, window_start")
    .eq("key", key)
    .single();

  // Sin registro previo o ventana expirada -> resetear
  if (error || !data || new Date(data.window_start) < windowStart) {
    await supabase
      .from("rate_limits")
      .upsert({ key, count: 1, window_start: now.toISOString() });

    return { allowed: true, remaining: limit - 1 };
  }

  // Dentro de ventana activa -> verificar límite
  if (data.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await supabase
    .from("rate_limits")
    .update({ count: data.count + 1 })
    .eq("key", key);

  return { allowed: true, remaining: limit - data.count - 1 };
}
