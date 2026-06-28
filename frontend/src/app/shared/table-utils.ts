export type SortDir = 'asc' | 'desc' | null;

export interface SortState {
  column: string;
  dir: SortDir;
}

export interface FilterState {
  [column: string]: Set<string>;
}

export function applySort<T>(items: T[], sort: SortState | null): T[] {
  if (!sort || !sort.dir) return items;
  const sorted = [...items].sort((a, b) => {
    const va = (a as any)[sort.column];
    const vb = (b as any)[sort.column];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'number' && typeof vb === 'number') {
      return sort.dir === 'asc' ? va - vb : vb - va;
    }
    const sa = String(va).toLowerCase();
    const sb = String(vb).toLowerCase();
    return sort.dir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
  });
  return sorted;
}

export function applyFilters<T>(items: T[], filters: FilterState): T[] {
  let result = items;
  for (const [col, values] of Object.entries(filters)) {
    if (values.size === 0) continue;
    result = result.filter(item => {
      const v = (item as any)[col];
      const display = v == null ? '' : String(v);
      return values.has(display);
    });
  }
  return result;
}

export function getFilterOptions<T>(items: T[], column: string): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const v = (item as any)[column];
    set.add(v == null ? '' : String(v));
  }
  return Array.from(set).filter(s => s !== '').sort((a, b) => a.localeCompare(b));
}

export function toggleFilter(filters: FilterState, column: string, value: string): FilterState {
  const next: FilterState = {};
  for (const [k, v] of Object.entries(filters)) {
    next[k] = new Set(v);
  }
  if (!next[column]) next[column] = new Set();
  if (next[column].has(value)) {
    next[column].delete(value);
  } else {
    next[column].add(value);
  }
  return next;
}

export function clearFilter(filters: FilterState, column: string): FilterState {
  const next: FilterState = {};
  for (const [k, v] of Object.entries(filters)) {
    if (k !== column) next[k] = new Set(v);
  }
  return next;
}
