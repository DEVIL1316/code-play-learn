import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Read the signed-in player's progress for one language track. */
export const getProgress = query({
  args: { language: v.string() },
  handler: async (ctx, { language }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    return await ctx.db
      .query("progress")
      .withIndex("by_user_language", (q) =>
        q.eq("userId", userId).eq("language", language),
      )
      .unique();
  },
});

/** Read every track's progress for the signed-in player. */
export const getAllProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("progress")
      .withIndex("by_user_language", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Mark a quest complete. Replaying a finished quest never grants XP twice. */
export const completeLevel = mutation({
  args: {
    language: v.string(),
    levelId: v.string(),
    xp: v.number(),
  },
  handler: async (ctx, { language, levelId, xp }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("You need to be signed in.");

    const reward = Math.max(0, Math.min(Math.round(xp), 200));
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_language", (q) =>
        q.eq("userId", userId).eq("language", language),
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("progress", {
        userId,
        language,
        completedLevels: [levelId],
        xp: reward,
        updatedAt: Date.now(),
      });
      return;
    }

    if (existing.completedLevels.includes(levelId)) return;

    await ctx.db.patch(existing._id, {
      completedLevels: [...existing.completedLevels, levelId],
      xp: existing.xp + reward,
      updatedAt: Date.now(),
    });
  },
});

/** Wipe progress for a track so the player can start fresh. */
export const resetProgress = mutation({
  args: { language: v.string() },
  handler: async (ctx, { language }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("You need to be signed in.");

    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_language", (q) =>
        q.eq("userId", userId).eq("language", language),
      )
      .unique();

    if (existing) await ctx.db.delete(existing._id);
  },
});
