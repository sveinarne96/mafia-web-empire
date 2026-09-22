import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const updateProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    activeLanguage: v.optional(v.string()),
    activeBadge: v.optional(v.string()),
    activeRole: v.optional(v.string()),
    activeTitle: v.optional(v.string()),
    activePlatform: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const patch: Record<string, string> = {};
    if (args.bio !== undefined) patch.bio = args.bio;
    if (args.activeLanguage !== undefined) patch.activeLanguage = args.activeLanguage;
    if (args.activeBadge !== undefined) patch.activeBadge = args.activeBadge;
    if (args.activeRole !== undefined) patch.activeRole = args.activeRole;
    if (args.activeTitle !== undefined) patch.activeTitle = args.activeTitle;
    if (args.activePlatform !== undefined) patch.activePlatform = args.activePlatform;
    if (args.profilePictureUrl !== undefined) patch.profilePictureUrl = args.profilePictureUrl;

    await ctx.db.patch(userId, patch);
    return { success: true };
  },
});

export const updateProfilePicture = mutation({
  args: { profilePictureUrl: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { profilePictureUrl: args.profilePictureUrl });
    return { success: true };
  },
});
