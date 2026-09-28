import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ═══════════════════════════════════════════════════════════════════
   EMPIRE FEATURES — bot population, bank hack, rank trials, tickets
   ═══════════════════════════════════════════════════════════════════ */

/* ═══════════ 1. BOT POPULATION ═══════════
   Two-layer design so a 14,000-player city stays cheap:
   • ~1,500 REAL bot docs in `users` — these chat, send DMs, get hacked,
     show on leaderboards (every interaction needs a real `_id`).
   • BOT_ROSTER_SIZE presence slots generated 100% deterministically from
     the slot number (name, color, level, city, online state). Zero DB
     reads, zero documents — the full 14,000 roster costs nothing. */
export const BOT_ROSTER_SIZE = 14000;
const REAL_BOT_DOCS = 1500;

async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const player = await ctx.db.get(userId);
  if (!player) throw new Error("Player not found");
  return player;
}

/* ═══════════ 1b. SHARED BOT NAME/CITY DATA ═══════════ */

const FIRST = ["Ghost", "Shadow", "Iron", "Blade", "Vito", "Luca", "Marco", "Tony", "Frank", "Sal", "Enzo", "Rocco", "Nico", "Bruno", "Carlo", "Dante", "Silvio", "Aldo", "Emil", "Gino", "Lupo", "Faust", "Vito", "Nero", "Corvo", "Wolf", "Raven", "Viper", "Cobra", "Falcon", "Hawk", "Stone", "Steel", "Cash", "Ace", "King", "Duke", "Baron", "Count", "Lord", "Doc", "Slim", "Tiny", "Big", "Lil", "Mad", "Crazy", "Slick", "Smooth", "Lucky"];
const LAST = ["Moretti", "Corleone", "Barzini", "Tattaglia", "Cuneo", "Stracci", "Greco", "Falcone", "Maroni", "Penguin", "Riddler", "Vitelli", "Zangara", "DiMarco", "Costello", "Lucchese", "Genovese", "Bonanno", "Colombo", "Gambino", "Mangano", "Inzerillo", "LaBarbera", "Bufalino", "Scaglione", "Santoro", "Randazzo", "Catania", "Messina", "Palermo", "Rizzuto", "Cuntrera", "Caruana", "Ferraro", "Grasso", "Marino", "Russo", "Romano", "Greco", "Conti", "Gallo", "Costa", "Giordano", "Mancuso", "Fontana", "Vitale", "Lombardo", "Pellegrino", "Paris", "Milano"];
const CITIES = ["New York", "Chicago", "Los Angeles", "Miami", "Las Vegas", "Detroit", "New Orleans", "Atlantic City", "Philadelphia", "Boston"];
const CLASSES = ["enforcer", "hustler", "thief"];

// Deterministic pseudo-random so bot list is stable per level
function botName(i: number): string {
  const f = FIRST[i % FIRST.length];
  const l = LAST[(i * 7 + Math.floor(i / FIRST.length)) % LAST.length];
  const suffix = i >= FIRST.length * LAST.length ? ` ${i}` : "";
  return `${f}${i % 3 === 0 ? "_" : ""}${l}${suffix}`;
}

/** Names for the 12,500 presence-only slots (never collide with the 1,500
 *  real docs, which use indices 0..1499). */
function rosterBotName(slot: number): string {
  return botName(slot + 1500);
}

/** Deterministic roster entry for a presence slot — no DB reads. */
function rosterEntry(slot: number, now: number) {
  const name = rosterBotName(slot);
  const level = 1 + ((slot * 37) % 80) + (slot % 5);
  const online = (slot * 7919 + Math.floor(now / 60000)) % 1000 < 680;
  const city = CITIES[(slot * 13 + 7) % CITIES.length];
  const cls = CLASSES[slot % 3];
  const kills = (slot * 13) % 200;
  return {
    slot,
    name,
    color: botNeonColor(slot),
    level,
    location: city,
    playerClass: cls,
    wanted: slot % 7 === 0 ? 1 + (slot % 5) : 0,
    kills,
    online,
  };
}

/** Ensure bot population exists. Returns count created. */
async function ensureBots(ctx: any): Promise<{ created: number; total: number }> {
  const TARGET = REAL_BOT_DOCS;
  const existing = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("isBotPlayer"), true))
    .collect();
  let created = 0;
  const need = TARGET - existing.length;
  if (need <= 0) return { created: 0, total: existing.length };
  const usedNames = new Set(existing.map((e: any) => e.nickname));
  const batch: any[] = [];
  for (let i = 0; i < need && i < 60; i++) {
    // Insert in stable slots so names stay consistent between runs
    let idx = existing.length + i;
    let name = botName(idx);
    while (usedNames.has(name)) { idx++; name = botName(idx); }
    usedNames.add(name);
    const level = 1 + ((idx * 37) % 80) + (idx % 5);
    const money = 5000 + (idx * 8237) % 900000;
    const kills = (idx * 13) % 200;
    const slot = idx * 13 + 7;
    batch.push({
      nickname: name,
      name,
      playerClass: CLASSES[idx % 3],
      role: "user",
      isBotPlayer: true,
      isSystemChar: false,
      systemVisible: true,
      botSlot: slot,
      botColor: botNeonColor(slot),
      money,
      bank: money * 2,
      points: (idx * 137) % 50000,
      coins: (idx * 7) % 200,
      life: 100, maxLife: 100 + level * 5, maxEnergy: 100,
      attack: 10 + level * 10, defense: 10 + level * 10,
      level, experience: (idx * 137) % 2000,
      location: CITIES[idx % CITIES.length],
      inPrison: false, prisonTime: 0, isDead: false,
      totalCrimes: level * 10, totalFights: kills + level, totalKills: kills, totalDeaths: kills / 2 | 0,
      dailyRaidUsed: 0, lastDailyRaid: Date.now(), lastRegenAt: Date.now(),
      wantedLevel: idx % 7 === 0 ? 1 + (idx % 5) : 0,
      reputation: (idx * 31) % 100, reputationAlignment: "neutral",
      prestige: idx % 20, prestigeMultiplier: 1, levelUpPending: false, skillPoints: 0,
      registeredAt: Date.now() - (idx % 300) * 86400000,
      lastActive: Date.now() - 30000 - (idx % 60) * 1000,
      lastCrimeAt: Date.now() - (idx % 10) * 60000,
      isBanned: false,
      bullets: 100, energy: 100, stamina: 100, maxStamina: 100,
      focus: 100, maxFocus: 100, morale: 100, maxMorale: 100,
      adrenaline: 0, maxAdrenaline: 100, heat: 0, maxHeat: 100,
      lastEnergyRegen: Date.now(), lastStaminaRegen: Date.now(), lastFocusRegen: Date.now(),
      familyId: undefined,
    });
  }
  for (const b of batch) {
    await ctx.db.insert("users", b);
    created++;
  }
  return { created, total: existing.length + created };
}

/** Per-bot neon color: every bot gets its own hue, stable for its whole life.
 *  Derived from the bot's roster slot, so recoloring = one tiny patch. */
export function botNeonColor(slot: number): string {
  const hue = (slot * 137.508) % 360; // golden-angle distribution
  return hslToHex(hue, 100, 62);
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/** Public: trigger population check (called on dashboard load / heartbeat). */
export const populateBots = mutation({
  args: {},
  handler: async (ctx) => {
    const res = await ensureBots(ctx);
    // Paint every bot that doesn't have its neon color yet (max 200/run so
    // backfilling 1.5k colors takes ~8 calls, spread over a few minutes).
    const unpainted = await ctx.db
      .query("users")
      .withIndex("by_bot_slot", (q: any) => q.eq("isBotPlayer", true))
      .take(400);
    let painted = 0;
    for (const b of unpainted) {
      if (b.botColor && b.botSlot !== undefined) continue;
      const slot = b.botSlot ?? Math.floor(Math.random() * 100000);
      await ctx.db.patch(b._id, { botSlot: slot, botColor: botNeonColor(slot) });
      painted++;
      if (painted >= 200) break;
    }
    return { ...res, painted };
  },
});

/** Internal: called every minute by cron. Slot-based — touches at most a
 *  few hundred bots per run instead of reading & rewriting all docs. */
export const tickBots = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const bots = await ctx.db
      .query("users")
      .withIndex("by_bot_slot", (q: any) => q.eq("isBotPlayer", true))
      .take(500);
    // Deterministic rotation: each minute a different slice of the roster is
    // the "active shift", so over an hour every bot gets touched ~2x.
    const minute = Math.floor(now / 60000);
    let ticked = 0;
    for (let i = 0; i < bots.length; i++) {
      const b = bots[i];
      const slot = b.botSlot ?? i;
      const rot = (slot * 7919 + minute) % 1000;
      const shouldOnline = rot < 680;
      const lastActive = shouldOnline
        ? now - 30000 - (slot % 60000)
        : now - 600000 - (slot % 3600000) * 30;
      const patch: any = { lastActive };
      if (rot % 7 === 0) patch.experience = (b.experience ?? 0) + 1;
      if (rot % 17 === 0) patch.money = Math.max(0, (b.money ?? 0) + Math.floor(Math.random() * 5000 - 2000));
      await ctx.db.patch(b._id, patch);
      ticked++;
    }
    return { ticked };
  },
});

/** Public: how many bots exist (no full scan). */
export const botStats = query({
  args: {},
  handler: async (ctx) => {
    const bots = await ctx.db
      .query("users")
      .withIndex("by_bot_slot", (q: any) => q.eq("isBotPlayer", true))
      .take(REAL_BOT_DOCS + 1);
    const now = Date.now();
    let online = 0;
    for (const b of bots) if ((b.lastActive ?? 0) > now - 120000) online++;
    const minutes = Math.floor(now / 60000);
    // Deterministic presence across all 14,000 slots (matches getBotRoster)
    let rosterOnline = 0;
    for (let s = 0; s < BOT_ROSTER_SIZE; s++) {
      if ((s * 7919 + minutes) % 1000 < 680) rosterOnline++;
    }
    return {
      total: BOT_ROSTER_SIZE,
      docs: bots.length,
      online: online + rosterOnline,
    };
  },
});

/** Public: deterministic bot roster for the Online Players page.
 *  Returns presence slots computed purely from the slot number — no DB reads,
 *  so 14,000 bots cost the same as 10. */
export const getBotRoster = query({
  args: {
    offset: v.optional(v.number()),
    take: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const now = Date.now();
    const offset = Math.max(0, args.offset ?? 0);
    const take = Math.min(300, Math.max(1, args.take ?? 100));
    const bots = [];
    for (let i = 0; i < take; i++) {
      const slot = offset + i;
      if (slot >= BOT_ROSTER_SIZE) break;
      bots.push(rosterEntry(slot, now));
    }
    return { total: BOT_ROSTER_SIZE, offset, bots };
  },
});

/* ═══════════ 2. BOT MESSAGES — inbox chatter + reward ═══════════ */

const BOT_LINES = [
  "yo, heard you been running the block",
  "nice work on that last job, keep it quiet",
  "you looking for a crew? we pay well",
  "someone put a hit on the streets, watch your back",
  "got a shipment coming in, interested?",
  "the don wants to see you. no funny business",
  "i owe you one from back in the day",
  "cops are heavy downtown tonight, lay low",
  "your rep is spreading fast, respect",
  "need bullets? i know a guy, cheap",
  "that bank job was clean, very clean",
  "don't trust the new guy, something's off",
  "we should talk business. private club, 10pm",
  "your name came up at the table tonight",
  "lose the tail, then call me",
  "the family protects its own. remember that",
  "that stunt with the car? legendary",
  "i got what you need. cash first",
  "meet me at the docks, bring muscle",
  "you're on the list now. that's good AND bad",
  "people are talking about you in the wrong way",
  "solid work. here's a cut of the take",
];

const REWARDS = [
  { type: "money", label: "$50,000", amount: 50000 },
  { type: "money", label: "$150,000", amount: 150000 },
  { type: "money", label: "$500,000", amount: 500000 },
  { type: "points", label: "500 points", amount: 500 },
  { type: "points", label: "2,500 points", amount: 2500 },
  { type: "bullets", label: "250 bullets", amount: 250 },
  { type: "coins", label: "50 coins", amount: 50 },
  { type: "xp", label: "5,000 XP", amount: 5000 },
];

/** Public: pick up bot messages in your inbox (unread ones). */
export const getBotMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q: any) => q.eq("receiverId", userId))
      .order("desc")
      .take(50);
    const out: any[] = [];
    for (const m of msgs) {
      const sender = await ctx.db.get(m.senderId);
      if (sender && (sender as any).isBotPlayer) {
        out.push({ ...m, senderName: sender.nickname, senderLevel: sender.level, senderIsBot: true });
      }
    }
    return out;
  },
});

/** Public: reply to a bot message within 25 min → random reward. */
export const claimBotReplyReward = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");
    if (msg.receiverId !== player._id) throw new Error("Not your message");
    if ((msg as any).rewardClaimed) throw new Error("Reward already claimed for this message");

    const age = Date.now() - msg.timestamp;
    const inWindow = age <= 25 * 60 * 1000;
    const sender = await ctx.db.get(msg.senderId);
    if (!sender || !(sender as any).isBotPlayer) throw new Error("You can only reply to street contacts");

    let reward = null;
    if (inWindow) {
      // Fast replies get better odds
      const fastBonus = age < 5 * 60 * 1000 ? 2 : 1;
      const pool = REWARDS.concat(REWARDS.slice(0, fastBonus * 2));
      reward = pool[Math.floor(Math.random() * pool.length)];
    }

    const patch: any = {
      body: (msg.body + (msg.body ? "\n\n" : "") + `[YOU]: ${"Reply sent. Respect earned."}`),
      read: true,
      rewardClaimed: true,
    };
    await ctx.db.patch(args.messageId, patch);

    if (!reward) {
      return { success: true, reward: null, text: "Reply sent — but you were too slow. Reply within 25 minutes next time!" };
    }

    const p2: any = {};
    switch (reward.type) {
      case "money": p2.money = (player.money ?? 0) + reward.amount; break;
      case "points": p2.points = (player.points ?? 0) + reward.amount; break;
      case "bullets": p2.bullets = (player.bullets ?? 0) + reward.amount; break;
      case "coins": p2.coins = (player.coins ?? 0) + reward.amount; break;
      case "xp": p2.experience = (player.experience ?? 0) + reward.amount; break;
    }
    await ctx.db.patch(player._id, p2);
    await ctx.db.insert("notifications", { userId: player._id, type: "reward", message: `🎁 Street contact rewarded you: ${reward.label}!`, read: false, timestamp: Date.now() });
    return { success: true, reward: reward.label, text: `🎁 Fast reply! You received: ${reward.label}` };
  },
});

/** Internal: drop a bot message into a random real player's inbox. */
export const botSendRandomMessage = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bots = await ctx.db.query("users")
      .withIndex("by_bot_slot", (q: any) => q.eq("isBotPlayer", true))
      .take(200);
    if (bots.length === 0) return { sent: 0 };
    // Random slice of the bot roster so different bots talk each run.
    const minute = Math.floor(Date.now() / 60000);
    const start = (minute * 37) % Math.max(1, bots.length - 20);
    const pool = bots.slice(start, start + 20);
    const bot = pool[Math.floor(Math.random() * pool.length)];
    const humans = await ctx.db.query("users")
      .filter((q: any) => q.neq(q.field("isBotPlayer"), true))
      .filter((q: any) => q.neq(q.field("isBanned"), true))
      .collect();
    const real = humans.filter((h: any) => h.nickname && !h.isBotPlayer);
    if (real.length === 0) return { sent: 0 };
    const target = real[Math.floor(Math.random() * real.length)];
    await ctx.db.insert("messages", {
      senderId: bot._id,
      receiverId: target._id,
      subject: `📍 Word on the street from ${bot.nickname}`,
      body: BOT_LINES[Math.floor(Math.random() * BOT_LINES.length)],
      read: false,
      timestamp: Date.now(),
    });
    return { sent: 1 };
  },
});

/* ═══════════ 3. BANK HACK A PLAYER ═══════════ */

export const getHackTargets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const me = await ctx.db.get(userId);
    const all = await ctx.db.query("users").collect();
    return all
      .filter((u: any) => u._id !== userId && u.nickname && !u.isBanned)
      .map((u: any) => ({
        _id: u._id,
        nickname: u.nickname,
        level: u.level ?? 1,
        isBot: !!(u as any).isBotPlayer,
        bank: (u as any).isBotPlayer ? (u.bank ?? 0) : 0, // real players' bank hidden until hacked
        wantedLevel: u.wantedLevel ?? 0,
        online: (u.lastActive ?? 0) > Date.now() - 120000,
      }))
      .sort((a: any, b: any) => b.level - a.level)
      .slice(0, 80);
  },
});

export const hackPlayerBank = mutation({
  args: { targetId: v.id("users"), tool: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    if (player.inPrison) throw new Error("You are in prison!");
    if (player.isDead) throw new Error("You are dead!");

    const target = await ctx.db.get(args.targetId);
    if (!target) throw new Error("Target not found");
    if (args.targetId === player._id) throw new Error("You can't hack yourself!");
    if ((target as any).isBotPlayer && !(target.bank || 0)) throw new Error("Target's vault is empty");

    // Energy cost
    const energy = (player.energy ?? 100);
    if (energy < 15) throw new Error("Not enough energy (need 15)");

    const levelDiff = (target.level ?? 1) - (player.level ?? 1);
    const toolBonus = (args.tool === "quantum") ? 0.15 : args.tool === "ghost" ? 0.10 : 0;
    let successChance = 0.55 + toolBonus + Math.min(0.15, levelDiff * 0.002);
    if (levelDiff > 20) successChance -= 0.15;
    const success = Math.random() < Math.max(0.15, Math.min(0.9, successChance));

    const now = Date.now();
    const wantedGain = success ? 3 : 2;
    const xpGained = success ? Math.floor(50 + (target.level ?? 1) * 2) : 12;

    // Trace / prison risk — 30% on failure, 8% on success
    const traced = Math.random() < (success ? 0.08 : 0.30);

    let stolen = 0;
    if (success) {
      // Take 1-8% of target's bank
      const pct = 0.01 + Math.random() * 0.07;
      stolen = Math.max(1000, Math.floor((target.bank ?? 0) * pct));
      if (!(target as any).isBotPlayer) {
        // Real player actually loses money
        await ctx.db.patch(target._id, { bank: Math.max(0, (target.bank ?? 0) - stolen) } as any);
        await ctx.db.insert("notifications", {
          userId: target._id, type: "hack",
          message: `🏦 Your bank was hacked! ${player.nickname} stole $${stolen.toLocaleString()}!`,
          read: false, timestamp: now,
        });
      }
    }

    const patches: any = {
      money: success ? (player.money ?? 0) + stolen : (player.money ?? 0),
      energy: Math.max(0, energy - 15),
      wantedLevel: Math.min(20, (player.wantedLevel ?? 0) + wantedGain),
      lastCrimeAt: now,
      experience: (player.experience ?? 0) + xpGained,
      totalCrimes: (player.totalCrimes ?? 0) + 1,
    };
    if (traced) {
      const jailMs = 120000 + Math.floor(Math.random() * 120000);
      patches.inPrison = true;
      patches.prisonTime = jailMs;
    }
    await ctx.db.patch(player._id, patches);

    await ctx.db.insert("crimes", {
      userId: player._id, type: "bank_hack", target: target.nickname ?? "vault",
      success, moneyEarned: stolen, pointsEarned: xpGained,
      damageTaken: 0, timestamp: now,
    });
    await ctx.db.insert("notifications", {
      userId: player._id, type: success ? "hack_success" : "hack_fail",
      message: success
        ? `🏦 Hacked ${target.nickname}'s vault: $${stolen.toLocaleString()}${traced ? " — BUT you were traced!" : " clean!"}`
        : `🚫 Hack on ${target.nickname} failed${traced ? " — you were traced and arrested!" : ""}`,
      read: false, timestamp: now,
    });

    return {
      success, stolen, traced, xpGained, wantedGain,
      targetName: target.nickname,
      message: success
        ? (traced ? `💥 Breached ${target.nickname} for $${stolen.toLocaleString()} — tripwire triggered, cops incoming!` : `💥 Breached ${target.nickname} for $${stolen.toLocaleString()}! Ghost protocol held.`)
        : (traced ? `🚨 Firewall held. Trace initiated — you're going downtown.` : `🚫 Hack failed. You slipped away in the noise.`),
    };
  },
});

/* ═══════════ 4. RANK TRIALS — new rank-up system ═══════════ */

const TRIALS = [
  { id: "shadow_trial", name: "Shadow Trial", icon: "🌑", needLevel: 10, trials: 3, desc: "Prove you can operate unseen." },
  { id: "blood_trial", name: "Blood Trial", icon: "🩸", needLevel: 20, trials: 5, desc: "Earn your scars." },
  { id: "iron_trial", name: "Iron Trial", icon: "⛓️", needLevel: 35, trials: 7, desc: "Unbreakable. Unbending." },
  { id: "fire_trial", name: "Fire Trial", icon: "🔥", needLevel: 50, trials: 10, desc: "Walk through it and survive." },
  { id: "ghost_trial", name: "Ghost Trial", icon: "👻", needLevel: 65, trials: 13, desc: "Become the whisper." },
  { id: "crown_trial", name: "Crown Trial", icon: "👑", needLevel: 80, trials: 16, desc: "Take the crown. Hold it." },
  { id: "void_trial", name: "Void Trial", icon: "🕳️", needLevel: 95, trials: 20, desc: "The city forgets your name. That is the point." },
];

const TRIAL_TYPES = [
  { id: "crime", desc: "Commit {n} crimes", xp: 30 },
  { id: "kill", desc: "Score {n} kills", xp: 60 },
  { id: "gta", desc: "Steal {n} vehicles", xp: 40 },
  { id: "heist", desc: "Complete {n} heists", xp: 80 },
  { id: "hack", desc: "Hack {n} bank accounts", xp: 50 },
  { id: "fight", desc: "Win {n} fights", xp: 35 },
];

export const getRankTrials = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const level = player.level ?? 1;
    const state = (player as any).rankTrials ?? {};
    const unlocked = TRIALS.filter((t) => level >= t.needLevel);
    const current = TRIALS.find((t) => level < t.needLevel) ?? null;
    return {
      level,
      trials: unlocked.map((t) => ({
        ...t,
        progress: (state as any)[t.id] ?? 0,
        completed: ((state as any)[t.id] ?? 0) >= t.trials,
      })),
      nextTrial: current,
      completedCount: unlocked.filter((t) => ((state as any)[t.id] ?? 0) >= t.trials).length,
    };
  },
});

export const advanceRankTrial = mutation({
  args: { trialType: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const state = { ...(((player as any).rankTrials ?? {}) as Record<string, number>) };
    const level = player.level ?? 1;
    const trial = TRIALS.find((t) => level >= t.needLevel && ((state[t.id] ?? 0) < t.trials));
    if (!trial) return { success: false, text: "No active trial. Level up to unlock the next one." };
    const type = TRIAL_TYPES.find((t) => t.id === args.trialType);
    if (!type) throw new Error("Unknown trial action");
    state[trial.id] = (state[trial.id] ?? 0) + 1;
    const done = state[trial.id] >= trial.trials;
    const patches: any = { rankTrials: state };
    if (done) {
      patches.points = (player.points ?? 0) + 500;
      patches.experience = (player.experience ?? 0) + 2500;
      await ctx.db.insert("notifications", {
        userId: player._id, type: "trial_complete",
        message: `${trial.icon} ${trial.name} COMPLETE! +500 points, +2500 XP. The next trial awaits.`,
        read: false, timestamp: Date.now(),
      });
    }
    await ctx.db.patch(player._id, patches);
    return {
      success: true, done, trialId: trial.id, trialName: trial.name, icon: trial.icon,
      progress: state[trial.id], target: trial.trials,
      text: done
        ? `${trial.icon} ${trial.name} COMPLETE! +500 points, +2500 XP`
        : `${trial.icon} ${trial.name}: ${state[trial.id]}/${trial.trials} (${type.desc.replace("{n}", String(trial.trials))})`,
    };
  },
});

/* ═══════════ 5. SUPPORT TICKETS — real backend ═══════════ */

export const createTicket = mutation({
  args: { subject: v.string(), body: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const now = Date.now();
    const ticketId = await ctx.db.insert("supportTickets", {
      userId: player._id,
      playerName: player.nickname ?? "Player",
      subject: args.subject.slice(0, 200),
      category: args.category ?? "other",
      status: "open",
      messages: [{ sender: player.nickname ?? "Player", senderRole: "player", message: args.body.slice(0, 4000), timestamp: now }],
      createdAt: now,
      updatedAt: now,
    });
    // Auto-ack from support bot
    const bot = await ctx.db.query("users")
      .filter((q: any) => q.eq(q.field("isBotPlayer"), true))
      .take(1);
    await ctx.db.insert("notifications", {
      userId: player._id, type: "support",
      message: `🎫 Ticket #${String(ticketId).slice(-6)} created: "${args.subject.slice(0, 60)}". We'll respond soon.`,
      read: false, timestamp: now,
    });
    return { success: true, ticketId };
  },
});

export const replyTicket = mutation({
  args: { ticketId: v.id("supportTickets"), message: v.string() },
  handler: async (ctx, args) => {
    const player = await getCurrentUser(ctx);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    if (ticket.userId !== player._id && player.role !== "admin") throw new Error("Not your ticket");
    const isAdmin = player.role === "admin" && ticket.userId !== player._id;
    const msgs = [...(ticket.messages ?? []), {
      sender: player.nickname ?? (isAdmin ? "Staff" : "Player"),
      senderRole: isAdmin ? "staff" : "player",
      message: args.message.slice(0, 4000),
      timestamp: Date.now(),
    }];
    await ctx.db.patch(args.ticketId, { messages: msgs, updatedAt: Date.now(), status: isAdmin ? "waiting" : "open" });
    await ctx.db.insert("notifications", {
      userId: ticket.userId, type: "support",
      message: `💬 ${isAdmin ? "Staff" : "You"} replied to ticket "${ticket.subject.slice(0, 50)}"`,
      read: false, timestamp: Date.now(),
    });
    return { success: true };
  },
});

export const getMyTickets = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const all = await ctx.db.query("supportTickets")
      .filter((q: any) => q.eq(q.field("userId"), player._id))
      .collect();
    return all.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
  },
});

export const getAllTickets = query({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    if (player.role !== "admin") throw new Error("Admin only");
    const all = await ctx.db.query("supportTickets").collect();
    return all.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
  },
});

/* ═══════════ 6. MARK NOTIFICATIONS READ ═══════════ */

export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getCurrentUser(ctx);
    const unread = await ctx.db.query("notifications")
      .withIndex("by_user", (q: any) => q.eq("userId", player._id))
      .filter((q: any) => q.eq(q.field("read"), false))
      .collect();
    for (const n of unread) await ctx.db.patch(n._id, { read: true });
    return { marked: unread.length };
  },
});

/* ═══════════ 7. MURDER NETWORK v2 — contracts & forensics ═══════════ */

export const getMurderLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users")
      .filter((q: any) => q.neq(q.field("isBanned"), true))
      .collect();
    return all
      .filter((u: any) => (u.totalKills ?? 0) > 0)
      .sort((a: any, b: any) => (b.totalKills ?? 0) - (a.totalKills ?? 0))
      .slice(0, 20)
      .map((u: any, i: number) => ({
        rank: i + 1,
        _id: u._id,
        nickname: u.nickname,
        level: u.level ?? 1,
        kills: u.totalKills ?? 0,
        isBot: !!(u as any).isBotPlayer,
        online: (u.lastActive ?? 0) > Date.now() - 120000,
        role: u.role ?? "user",
      }));
  },
});