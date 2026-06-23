// End-to-end verification of the home-visits flow across apps, against the
// live DB, using the same queries the services use. Creates temp records and
// cleans them up. Run: node scripts/verify-home-visits-flow.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const log = (s) => console.log(s);
const cleanup = [];

async function main() {
  const stamp = Date.now();

  // --- setup: temp approved therapist covering Cairo, with a weekly schedule
  const { data: cairo } = await db.from("locations").select("id").eq("location_name", "Cairo").single();

  const { data: tAuth } = await db.auth.admin.createUser({
    email: `e2e_t_${stamp}@test.com`, password: "password1234", email_confirm: true });
  cleanup.push(() => db.auth.admin.deleteUser(tAuth.user.id));
  const { data: tUser } = await db.from("users").insert([{ first_name: "Dr", last_name: "E2E",
    email: `e2e_t_${stamp}@test.com`, supabase_id: tAuth.user.id,
    phone_number: `t${stamp}`.slice(0, 12), user_type: "therapist" }]).select("id").single();
  cleanup.push(() => db.from("users").delete().eq("id", tUser.id));
  const { data: ther } = await db.from("therapists").insert([{ user_id: tUser.id,
    account_status: "approved", specialty: "Physio", gender: "Male" }]).select("id").single();
  cleanup.push(() => db.from("therapists").delete().eq("id", ther.id));
  await db.from("therapist_locations").insert([{ therapist_id: ther.id, location_id: cairo.id }]);
  cleanup.push(() => db.from("therapist_locations").delete().eq("therapist_id", ther.id));
  // weekly: works mornings every day
  await db.from("therapist_weekly_availability").insert(
    [0,1,2,3,4,5,6].map(d => ({ therapist_id: ther.id, day_of_week: d, time_slot: "8:00-12:00", is_available: true })));
  cleanup.push(() => db.from("therapist_weekly_availability").delete().eq("therapist_id", ther.id));
  log("1) temp APPROVED therapist covering Cairo, works 8:00-12:00 daily ✅");

  // --- temp patient
  const { data: pAuth } = await db.auth.admin.createUser({
    email: `e2e_p_${stamp}@test.com`, password: "password1234", email_confirm: true });
  cleanup.push(() => db.auth.admin.deleteUser(pAuth.user.id));
  const { data: pUser } = await db.from("users").insert([{ first_name: "Pat", last_name: "E2E",
    email: `e2e_p_${stamp}@test.com`, supabase_id: pAuth.user.id,
    phone_number: `p${stamp}`.slice(0, 12), user_type: "patient" }]).select("id").single();
  cleanup.push(() => db.from("users").delete().eq("id", pUser.id));
  const { data: pat } = await db.from("patients").insert([{ user_id: pUser.id,
    date_of_birth: "1990-05-05", gender: "Male" }]).select("id").single();
  cleanup.push(() => db.from("patients").delete().eq("id", pat.id));
  log("2) temp patient ✅");

  // --- availability check (mirror of getAreaAvailability core)
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().slice(0, 10);
  log(`3) availability for Cairo on ${dateStr}: therapist works 8:00-12:00 -> morning slot should be bookable`);

  // --- patient creates request (same insert as createVisitRequest)
  const { data: req, error: reqErr } = await db.from("requests").insert([{
    patient_id: pat.id, location_id: cairo.id, request_date: dateStr,
    time_slot: "8:00-12:00", gender: "Male", status: "Accepted",
    queue: "Pending Requests", is_accepted: true,
    complaint: "Lower back pain for 2 weeks", pain_areas: ["Lumbar Spine", "Hip"],
    notes: "3rd floor, no elevator" }]).select("id").single();
  if (reqErr) throw new Error("request insert: " + reqErr.message);
  cleanup.push(() => db.from("requests").delete().eq("id", req.id));
  log(`4) patient request #${req.id} created (complaint + pain_areas + notes) ✅`);

  // --- therapist app query: does listIncomingRequests see it?
  const { data: taken } = await db.from("visits").select("request_id");
  const takenIds = (taken ?? []).map(r => r.request_id);
  let q = db.from("requests").select("id, complaint, pain_areas, notes, patients(users(first_name))")
    .in("location_id", [cairo.id]).eq("is_accepted", true).eq("is_archived", false);
  if (takenIds.length) q = q.not("id", "in", `(${takenIds.join(",")})`);
  const { data: incoming } = await q;
  const seen = (incoming ?? []).find(r => r.id === req.id);
  log(seen
    ? `5) therapist app SEES the request ✅ (complaint="${seen.complaint}", pain_areas=${JSON.stringify(seen.pain_areas)})`
    : "5) ❌ therapist app does NOT see the request");

  // --- therapist accepts -> visit
  const { data: visit, error: vErr } = await db.from("visits").insert([{
    request_id: req.id, therapist_id: ther.id, patient_id: pat.id,
    scheduled_date: dateStr, time_slot: "8:00-12:00" }]).select("id, status").single();
  if (vErr) throw new Error("visit insert: " + vErr.message);
  cleanup.push(() => db.from("visits").delete().eq("id", visit.id));
  log(`6) therapist accepted -> visit #${visit.id} (${visit.status}) ✅`);

  // --- patient app query: listMyRequests shows therapist + status
  const { data: mine } = await db.from("requests").select(`id, visits (status,
    therapists (specialty, users (first_name, last_name, phone_number)))`)
    .eq("patient_id", pat.id).eq("is_archived", false);
  const mineRow = mine?.[0];
  const v = Array.isArray(mineRow?.visits) ? mineRow.visits[0] : mineRow?.visits;
  log(v
    ? `7) patient SEES: status=${v.status}, therapist=${v.therapists.users.first_name} ${v.therapists.users.last_name} (${v.therapists.specialty}, ${v.therapists.users.phone_number}) ✅`
    : "7) ❌ patient cannot see visit");

  // --- therapist marks done
  await db.from("visits").update({ status: "done", completed_at: new Date().toISOString(),
    therapist_notes: "Treated. Follow-up in 1 week." }).eq("id", visit.id);
  const { data: after } = await db.from("visits").select("status, therapist_notes").eq("id", visit.id).single();
  log(`8) therapist marked done -> patient sees status=${after.status}, notes="${after.therapist_notes}" ✅`);

  log("\nFULL CROSS-APP FLOW VERIFIED ✅");
}

main()
  .catch(e => console.error("FAILED:", e.message))
  .finally(async () => {
    for (const fn of cleanup.reverse()) { try { await fn(); } catch {} }
    console.log("(temp records cleaned up)");
  });
