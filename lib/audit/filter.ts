export function sanitizeAuditSearch(value: string) {
  return value.trim().replace(/[%_]/g, "");
}

export function buildAuditActorOrFilter(actor: string, adminIds: string[]) {
  const escaped = sanitizeAuditSearch(actor);
  const phoneFilter = `detail->>phone.ilike.%${escaped}%`;

  if (adminIds.length === 0) {
    return phoneFilter;
  }

  return `actor_admin_id.in.(${adminIds.join(",")}),${phoneFilter}`;
}
