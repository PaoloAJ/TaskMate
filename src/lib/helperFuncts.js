//Collection of helper functions made for ease of use and cleaner code
export function formatDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function arraysEqualAsSets(a = [], b = []) {
  const sa = new Set(a || []);
  const sb = new Set(b || []);
  if (sa.size !== sb.size) return false;
  for (const v of sa) if (!sb.has(v)) return false;
  return true;
}