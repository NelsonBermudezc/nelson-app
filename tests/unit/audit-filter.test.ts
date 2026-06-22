import assert from "node:assert/strict";
import test from "node:test";

import { buildAuditActorOrFilter } from "@/lib/audit/filter";

test("buildAuditActorOrFilter searches admin actor ids and WhatsApp phone actors", () => {
  assert.equal(
    buildAuditActorOrFilter("Maria_%", ["11111111-1111-1111-1111-111111111111"]),
    "actor_admin_id.in.(11111111-1111-1111-1111-111111111111),detail->>phone.ilike.%Maria%",
  );
});

test("buildAuditActorOrFilter still searches phone actors when no admin matches", () => {
  assert.equal(buildAuditActorOrFilter("+5068888", []), "detail->>phone.ilike.%+5068888%");
});
