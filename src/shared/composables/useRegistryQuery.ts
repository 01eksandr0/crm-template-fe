import { watch, type WatchSource } from 'vue';
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from 'vue-router';

/** Перше значення query-ключа (без масивів). */
export function queryString(query: LocationQuery, key: string): string | undefined {
  const raw = query[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value == null || value === '') return undefined;
  return String(value);
}

export function queryNumber(query: LocationQuery, key: string): number | undefined {
  const raw = queryString(query, key);
  if (raw == null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function queryBoolean(query: LocationQuery, key: string): boolean | undefined {
  const raw = queryString(query, key);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
}

export function toQueryDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return undefined;
}

export function fromQueryDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function cleanQuery(input: Record<string, string | undefined | null>): LocationQueryRaw {
  const out: LocationQueryRaw = {};
  for (const [key, value] of Object.entries(input)) {
    if (value == null || value === '') continue;
    out[key] = value;
  }
  return out;
}

function queriesEqual(a: LocationQueryRaw, b: LocationQuery) {
  const left = cleanQuery(
    Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v == null ? undefined : String(v)])),
  );
  const rightKeys = Object.keys(b);
  const leftKeys = Object.keys(left);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((k) => String(left[k] ?? '') === String(queryString(b, k) ?? ''));
}

/**
 * Пише стан реєстру в `route.query` і дає прочитати стартовий query.
 * Дефолтні значення краще не писати в URL (передавайте `undefined`).
 */
export function useRegistryQuery(
  buildQuery: () => Record<string, string | undefined | null>,
  sources: WatchSource[],
) {
  const route = useRoute();
  const router = useRouter();
  let writing = false;

  function write() {
    const next = cleanQuery(buildQuery());
    if (queriesEqual(next, route.query)) return;
    writing = true;
    void router.replace({ query: next }).finally(() => {
      writing = false;
    });
  }

  watch(sources, write, { deep: true });

  return {
    route,
    isWriting: () => writing,
    write,
  };
}
