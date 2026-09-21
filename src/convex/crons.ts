import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

// Top the bot roster back up to 1500 every hour (populateBots inserts max 60
// per call, so this heals the population gradually without a huge write burst).
crons.hourly("bot-population", { minuteUTC: 7 }, api.empireFeatures.populateBots, {});

// Every minute: refresh the presence of bots that are about to go offline so
// roughly 2/3 of them always look online. Also trickle XP/money so the fake
// population visibly "plays" around the clock.
crons.cron("bot-presence-tick", "* * * * *", internal.empireFeatures.tickBots, {});

// Every 5 minutes: a random bot DMs a random real player. Replying within
// 25 minutes (claimBotReplyReward) pays out a random reward.
crons.cron("bot-street-chatter", "*/5 * * * *", internal.empireFeatures.botSendRandomMessage, {});

export default crons;
