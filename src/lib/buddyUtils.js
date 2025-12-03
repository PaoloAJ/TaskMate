import { generateClient } from "aws-amplify/data";

const client = generateClient({ authMode: "userPool" });

/**
 * Clear a user's buddy relationship and remove the user's id (and their buddy's id)
 * from every other user's sent/request arrays. Returns an object with details.
 */
export async function clearBuddyAndCleanup(userId) {
  if (!userId) throw new Error("userId required");

  // Fetch the user's profile to find buddy info
  const res = await client.models.UserProfile.get({ id: userId });
  const profile = res?.data;
  if (!profile) return { cleared: false, reason: "profile-not-found" };

  const buddyId = profile.buddy_id;

  // If there's a buddy, clear buddy_id on both and clear sent/request arrays
  if (buddyId) {
    try {
      await Promise.all([
        client.models.UserProfile.update({ id: userId, buddy_id: null, sent: [], request: [] }),
        client.models.UserProfile.update({ id: buddyId, buddy_id: null, sent: [], request: [] }),
      ]);
    } catch (err) {
      console.error("Failed to clear buddy relationship:", err);
      // continue to cleanup references even if this fails
    }
  } else {
    // Ensure user's own sent/request arrays are cleared
    try {
      await client.models.UserProfile.update({ id: userId, sent: [], request: [] });
    } catch (err) {
      console.error("Failed to clear user sent/request arrays:", err);
    }
  }

  // Remove both IDs from every other user's sent/request arrays
  const idsToRemove = buddyId ? [userId, buddyId] : [userId];
  const removeSet = new Set(idsToRemove);

  try {
    let next = null;
    do {
      const listRes = await client.models.UserProfile.list({ limit: 100, nextToken: next });
      const items = listRes?.data || [];
      next = listRes?.nextToken;

      const updates = [];
      for (const p of items) {
        if (!p || !p.id) continue;
        if (removeSet.has(p.id)) continue; // skip the users being removed

        const sent = Array.isArray(p.sent) ? p.sent : [];
        const request = Array.isArray(p.request) ? p.request : [];

        const newSent = sent.filter((uid) => !removeSet.has(uid));
        const newRequest = request.filter((uid) => !removeSet.has(uid));

        if (newSent.length !== sent.length || newRequest.length !== request.length) {
          const payload = { id: p.id };
          if (newSent.length !== sent.length) payload.sent = newSent;
          if (newRequest.length !== request.length) payload.request = newRequest;
          updates.push(client.models.UserProfile.update(payload));
        }
      }

      if (updates.length) {
        await Promise.allSettled(updates);
      }
    } while (next);
  } catch (e) {
    console.error("Failed to clean up user references:", e);
  }

  return { cleared: true, buddyId };
}
