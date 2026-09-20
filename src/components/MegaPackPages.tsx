/* eslint-disable */
// @ts-nocheck
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════
   MEGA PACK PAGES — same visual language as the rest of the game
   ═══════════════════════════════════════════════════════════════ */

const CARD: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(197,140,64,0.22)",
  background: "linear-gradient(160deg, rgba(26,15,6,0.92), rgba(12,6,2,0.97))",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,224,165,0.05)",
};
const GOLD = "#ffd700";
const AMBER = "#fbbf24";
const DIM = "rgba(255,214,140,0.55)";

const Panel = ({ title, sub, children, accent }: any) => (
  <div style={CARD} className="p-4">
    <div className="flex items-baseline justify-between gap-2 mb-3">
      <h3 className="text-sm font-black tracking-widest uppercase" style={{ color: accent ?? AMBER }}>{title}</h3>
      {sub && <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: DIM }}>{sub}</span>}
    </div>
    {children}
  </div>
);

const ActionBtn = ({ onClick, children, danger, wide }: any) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 ${wide ? "w-full" : ""}`}
    style={{
      border: `1px solid ${danger ? "rgba(239,68,68,0.5)" : "rgba(255,214,140,0.35)"}`,
      background: danger ? "linear-gradient(160deg, rgba(120,20,10,0.9), rgba(60,8,4,0.95))" : "linear-gradient(160deg, rgba(120,80,20,0.85), rgba(50,30,5,0.95))",
      color: GOLD,
      boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
    }}
  >
    {children}
  </button>
);

const Row = ({ icon, name, desc, right }: any) => (
  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ border: "1px solid rgba(197,140,64,0.14)", background: "rgba(0,0,0,0.28)" }}>
    <span className="text-xl w-8 text-center">{icon}</span>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-black" style={{ color: "#fde68a" }}>{name}</div>
      {desc && <div className="text-[10px]" style={{ color: DIM }}>{desc}</div>}
    </div>
    {right}
  </div>
);

const Stat = ({ label, value }: any) => (
  <div className="rounded-lg px-3 py-2 text-center" style={{ border: "1px solid rgba(197,140,64,0.18)", background: "rgba(0,0,0,0.3)" }}>
    <div className="text-sm font-black" style={{ color: GOLD }}>{value}</div>
    <div className="text-[9px] uppercase tracking-widest" style={{ color: DIM }}>{label}</div>
  </div>
);

const run = (m: any, args?: any) => m(args).catch((e: any) => toast.error(String(e?.message ?? e).replace("Uncaught Error: ", "")));
const show = (r: any) => r?.text && toast.success(r.text);

/* ════════════════ 1. STREET CRIMES (1,2,3,4,6) ════════════════ */
export function StreetCrimesPage() {
  const mail = useQuery(api.megaPack.getMailState);
  const demo = useQuery(api.megaPack.getDemolitionStock);
  const pickTourist = useMutation(api.megaPack.pickTourist);
  const hitVending = useMutation(api.megaPack.hitVending);
  const hijackTruck = useMutation(api.megaPack.hijackTruck);
  const stealMailKeys = useMutation(api.megaPack.stealMailKeys);
  const raidMailboxes = useMutation(api.megaPack.raidMailboxes);
  const blastAtm = useMutation(api.megaPack.blastAtm);

  return (
    <div className="space-y-4">
      <Panel title="🗡️ Street Crimes" sub="low risk · daily grind">
        <div className="space-y-2">
          <Row icon="👤" name="Pickpocket Tourists" desc="Day crowds pay triple. Night streets pay scraps."
            right={<ActionBtn onClick={() => show(run(pickTourist))}>Lift</ActionBtn>} />
          <Row icon="🥤" name="Shake Vending Machines" desc="Small coins, big volume. −3 energy."
            right={<ActionBtn onClick={() => show(run(hitVending))}>Shake</ActionBtn>} />
          <Row icon="🌮" name="Food Truck Hijack" desc="Steal the whole truck (garage) or just the till."
            right={
              <div className="flex gap-1">
                <ActionBtn danger onClick={() => run(hijackTruck, { choice: "truck" }).then(show)}>Truck</ActionBtn>
                <ActionBtn onClick={() => run(hijackTruck, { choice: "till" }).then(show)}>Till</ActionBtn>
              </div>
            } />
          {mail && !mail.hasKeys ? (
            <Row icon="🗝️" name="Steal Mail Keys" desc="$12,000 · unlocks 10 mailbox raids for 24h"
              right={<ActionBtn onClick={() => run(stealMailKeys, {}).then(show)}>Copy</ActionBtn>} />
          ) : (
            <Row icon="📬" name={`Mailbox Raid Chain · ${mail?.raidsLeft ?? 0} left`} desc="Cash, gift cards, identities. 15% bust risk."
              right={<ActionBtn onClick={() => run(raidMailboxes, {}).then(show)}>Raid</ActionBtn>} />
          )}
          <Row icon="🧨" name="ATM Explosion" desc={`Dynamite held: ${demo?.dynamite ?? 0} · without it: 55% failure, big damage`}
            right={<ActionBtn danger onClick={() => run(blastAtm, {}).then(show)}>Blast</ActionBtn>} />
        </div>
      </Panel>
    </div>
  );
}

/* ════════════════ 2. BIG HEISTS (10,13,15,56) ════════════════ */
export function BigHeistsPage() {
  const museum = useQuery(api.megaPack.getMuseumState);
  const blackout = useQuery(api.megaPack.getBlackoutState);
  const lift = useMutation(api.megaPack.liftPainting);
  const sellArt = useMutation(api.megaPack.sellPainting);
  const dive = useMutation(api.megaPack.diveSalvage);
  const loadShip = useMutation(api.megaPack.loadShip);
  const resolveShips = useMutation(api.megaPack.resolveShipLoads);
  const blackoutHeist = useMutation(api.megaPack.runBlackoutHeist);
  const [invest, setInvest] = useState(50000);

  return (
    <div className="space-y-4">
      <Panel title="🖼️ Museum Night Lift" sub="art appreciates 1%/day">
        <div className="space-y-2">
          {(museum?.targets ?? []).map((t: any, i: number) => (
            <Row key={t.name} icon="🎨" name={`${t.name} — ${t.artist}`} desc={`Street value ~$${t.base.toLocaleString()}`}
              right={<ActionBtn onClick={() => run(lift, { pieceIndex: i }).then(show)}>Lift</ActionBtn>} />
          ))}
          {(museum?.collection ?? []).length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(197,140,64,0.15)" }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: DIM }}>Your collection</div>
              <div className="space-y-2">
                {museum.collection.map((p: any) => (
                  <Row key={p._id} icon="🧳" name={p.pieceName} desc={`Paid $${p.paid.toLocaleString()} · gains value daily`}
                    right={<ActionBtn onClick={() => run(sellArt, { lootId: p._id }).then(show)}>Fence it</ActionBtn>} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Panel title="⚓ Sunken Cargo Salvage" sub="$18,000 boat rental · high variance">
        <ActionBtn wide onClick={() => run(dive, {}).then(show)}>Rent Boat & Dive</ActionBtn>
      </Panel>

      <Panel title="🚢 Ship Bottom Loading" sub="product welded into hulls · 12h to dock · 25% customs risk">
        <div className="flex gap-2 items-center mb-3">
          <input type="number" value={invest} min={25000} step={10000} onChange={(e) => setInvest(+e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <span className="text-[10px]" style={{ color: DIM }}>min $25k</span>
        </div>
        <div className="flex gap-2">
          <ActionBtn onClick={() => run(loadShip, { invested: invest }).then(show)}>Load the Hull</ActionBtn>
          <ActionBtn onClick={() => run(resolveShips, {}).then(show)}>Check the Docks</ActionBtn>
        </div>
      </Panel>

      <Panel title="💡 Blackout Heists" sub={blackout?.blackoutActive ? "🔴 GRID DOWN — GO NOW" : "grid up · wait for outage window"}>
        <ActionBtn wide danger={blackout?.blackoutActive} onClick={() => run(blackoutHeist, {}).then(show)}>
          {blackout?.blackoutActive ? "Hit a Blackout Target" : "Scout for Outages"}
        </ActionBtn>
      </Panel>
    </div>
  );
}

/* ════════════════ 3. ODD JOBS (11,12,14) ════════════════ */
export function OddJobsPage() {
  const robGrave = useMutation(api.megaPack.robGrave);
  const runHearse = useMutation(api.megaPack.runHearse);
  const rustle = useMutation(api.megaPack.rustleCattle);
  const [cargo, setCargo] = useState(50000);

  return (
    <div className="space-y-4">
      <Panel title="⚰️ Grave Robbery" sub="curiosities · artifacts · dignity optional">
        <ActionBtn wide onClick={() => run(robGrave, {}).then(show)}>Dig Tonight</ActionBtn>
      </Panel>
      <Panel title="🚐 Hearse Smuggling" sub="cops don't search coffins · usually">
        <div className="flex gap-2 items-center mb-3">
          <input type="number" value={cargo} min={10000} step={10000} onChange={(e) => setCargo(+e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <span className="text-[10px]" style={{ color: DIM }}>cargo value · 35-65% profit</span>
        </div>
        <ActionBtn wide onClick={() => run(runHearse, { cargoValue: cargo }).then(show)}>Load the Coffin</ActionBtn>
      </Panel>
      <Panel title="🐄 Cattle Rustling" desc="" sub="2-8 head per raid · sold to shady butchers">
        <ActionBtn wide onClick={() => run(rustle, {}).then(show)}>Move the Herd</ActionBtn>
      </Panel>
    </div>
  );
}

/* ════════════════ 4. SOCIAL HUB (23,24,25,26,27) ════════════════ */
export function SocialHubPage() {
  const auctions = useQuery(api.megaPack.getBountyAuctions);
  const duels = useQuery(api.megaPack.getDawnDuels);
  const raids = useQuery(api.megaPack.getPrisonRaids);
  const escorts = useQuery(api.megaPack.getEscortJobs);
  const kidnap = useQuery(api.megaPack.getKidnapState);
  const bid = useMutation(api.megaPack.bidBounty);
  const challenge = useMutation(api.megaPack.challengeDawn);
  const accept = useMutation(api.megaPack.acceptDawn);
  const startRaid = useMutation(api.megaPack.startPrisonRaid);
  const joinRaid = useMutation(api.megaPack.joinPrisonRaid);
  const postEscort = useMutation(api.megaPack.postEscortJob);
  const takeEscort = useMutation(api.megaPack.takeEscortJob);
  const kidnapM = useMutation(api.megaPack.kidnapPlayer);
  const payRansomM = useMutation(api.megaPack.payRansom);
  const interrogate = useMutation(api.megaPack.interrogateCaptive);
  const [bountyName, setBountyName] = useState("");
  const [bountyAmt, setBountyAmt] = useState(100000);
  const [bountyMethod, setBountyMethod] = useState("Public humiliation");
  const [duelStake, setDuelStake] = useState(25000);
  const [raidTarget, setRaidTarget] = useState("");
  const [escortPay, setEscortPay] = useState(75000);
  const [kidTarget, setKidTarget] = useState("");
  const [kidRansom, setKidRansom] = useState(150000);

  return (
    <div className="space-y-4">
      <Panel title="🔨 Bounty Auctions" sub="escrow your bid · method of your choice">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input placeholder="Player name" value={bountyName} onChange={(e) => setBountyName(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm font-bold col-span-2" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <input type="number" value={bountyAmt} step={50000} onChange={(e) => setBountyAmt(+e.target.value)}
            className="rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <input placeholder="Method" value={bountyMethod} onChange={(e) => setBountyMethod(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm font-bold col-span-3" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
        </div>
        <ActionBtn danger onClick={() => bid({ targetId: bountyName as any, targetName: bountyName, amount: bountyAmt, method: bountyMethod }).then(show).catch((e) => toast.error(String(e.message ?? e)))}>
          Place Escrowed Bid
        </ActionBtn>
        <div className="mt-3 space-y-1">
          {(auctions ?? []).map((a: any) => (
            <div key={a._id} className="flex justify-between text-[11px] rounded-lg px-3 py-1.5" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span style={{ color: "#fde68a" }}>🎯 {a.targetName} — ${a.amount.toLocaleString()}</span>
              <span style={{ color: DIM }}>{a.method} · by {a.bidderName}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="🌅 Duels at Dawn" sub="escrowed stakes · fastest gun wins">
        <div className="flex gap-2 mb-3">
          <input type="number" value={duelStake} step={10000} onChange={(e) => setDuelStake(+e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <ActionBtn onClick={() => run(challenge, { stake: duelStake }).then(show)}>Post Challenge</ActionBtn>
        </div>
        <div className="space-y-2">
          {(duels ?? []).filter((d: any) => d.status === "open").map((d: any) => (
            <Row key={d._id} icon="🤠" name={`${d.challengerName} — $${d.stake.toLocaleString()}`} desc="open challenge · escrowed"
              right={<ActionBtn danger onClick={() => run(accept, { duelId: d._id }).then(show)}>Accept</ActionBtn>} />
          ))}
          {(duels ?? []).length === 0 && <div className="text-[11px] italic" style={{ color: DIM }}>No open challenges. The streets are quiet… for now.</div>}
        </div>
      </Panel>

      <Panel title="🚔 Prison Bust Raids" sub="$150k to plan · 3+ raiders to roll the van">
        <div className="flex gap-2 mb-3">
          <input placeholder="Prisoner name" value={raidTarget} onChange={(e) => setRaidTarget(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <ActionBtn danger onClick={() => run(startRaid, { targetId: raidTarget as any, targetName: raidTarget }).then(show)}>Plan Raid</ActionBtn>
        </div>
        <div className="space-y-2">
          {(raids ?? []).map((r: any) => (
            <Row key={r._id} icon="🪖" name={`Free ${r.targetName}`} desc={`planned by ${r.raiderName} · ${r.helpers.length}/3 raiders`}
              right={<ActionBtn onClick={() => run(joinRaid, { raidId: r._id }).then(show)}>Join</ActionBtn>} />
          ))}
        </div>
      </Panel>

      <Panel title="🛻 Caravan Escort" sub="escrow the pay · bodyguards take the job">
        <div className="flex gap-2 mb-3">
          <input type="number" value={escortPay} step={25000} onChange={(e) => setEscortPay(+e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <ActionBtn onClick={() => run(postEscort, { pay: escortPay }).then(show)}>Post Job</ActionBtn>
        </div>
        <div className="space-y-2">
          {(escorts ?? []).filter((j: any) => j.guardName === "(open)").map((j: any) => (
            <Row key={j._id} icon="💼" name={`Escort for ${j.clientName}`} desc={`$${j.pay.toLocaleString()} escrowed`}
              right={<ActionBtn onClick={() => run(takeEscort, { jobId: j._id }).then(show)}>Take Job</ActionBtn>} />
          ))}
        </div>
      </Panel>

      <Panel title="🚐 Interrogation Room" sub="kidnap · ransom · or make them talk">
        {(kidnap?.victimOf ?? []).filter((k: any) => k.status === "holding").length > 0 && (
          <div className="mb-3 rounded-xl p-3" style={{ border: "1px solid rgba(239,68,68,0.4)", background: "rgba(120,10,10,0.2)" }}>
            <div className="text-xs font-black text-red-300 mb-2">🚨 YOU ARE BEING HELD</div>
            {kidnap.victimOf.filter((k: any) => k.status === "holding").map((k: any) => (
              <ActionBtn key={k._id} danger wide onClick={() => run(payRansomM, { kidnapId: k._id }).then(show)}>
                Pay Ransom — ${k.ransom.toLocaleString()}
              </ActionBtn>
            ))}
          </div>
        )}
        {(kidnap?.mine ?? []).filter((k: any) => k.status === "holding").map((k: any) => (
          <Row key={k._id} icon="😤" name={`${k.victimName} in the safehouse`} desc={`ransom $${k.ransom.toLocaleString()} · ends ${new Date(k.endsAt).toLocaleTimeString()}`}
            right={<ActionBtn onClick={() => run(interrogate, { kidnapId: k._id }).then(show)}>Interrogate</ActionBtn>} />
        ))}
        <div className="flex gap-2 mt-3">
          <input placeholder="Target name" value={kidTarget} onChange={(e) => setKidTarget(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <input type="number" value={kidRansom} step={50000} onChange={(e) => setKidRansom(+e.target.value)}
            className="w-28 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <ActionBtn danger onClick={() => run(kidnapM, { targetId: kidTarget as any, targetName: kidTarget, ransom: kidRansom }).then(show)}>Grab</ActionBtn>
        </div>
      </Panel>
    </div>
  );
}

/* ════════════════ 5. STREET FRONTS (28-33,35-37,39) ════════════════ */
export function FrontsHubPage() {
  const shine = useQuery(api.megaPack.getShoeShineState);
  const medallion = useQuery(api.megaPack.getMedallionState);
  const fuel = useQuery(api.megaPack.getFuelMarket);
  const funeral = useQuery(api.megaPack.getFuneralState);
  const buyShine = useMutation(api.megaPack.buyShoeShineStand);
  const collectShine = useMutation(api.megaPack.collectShoeShine);
  const openCinema = useMutation(api.megaPack.openCinema);
  const collectCinema = useMutation(api.megaPack.collectCinema);
  const buyFuneral = useMutation(api.megaPack.buyFuneralHome);
  const disposeHeat = useMutation(api.megaPack.disposeHeat);
  const castNets = useMutation(api.megaPack.castNets);
  const buyMedallion = useMutation(api.megaPack.buyMedallion);
  const collectMedallion = useMutation(api.megaPack.collectMedallion);
  const buyLaundromat = useMutation(api.megaPack.buyLaundromat);
  const collectLaundry = useMutation(api.megaPack.collectLaundromat);
  const buyFuel = useMutation(api.megaPack.buyFuel);
  const sellFuel = useMutation(api.megaPack.sellFuel);
  const tapGrid = useMutation(api.megaPack.tapPowerGrid);
  const bribeUnion = useMutation(api.megaPack.bribeUnion);
  const runCigs = useMutation(api.megaPack.runCigarettes);
  const buySpot = useMutation(api.megaPack.buyVendingSpot);
  const restock = useMutation(api.megaPack.restockVending);
  const [gallons, setGallons] = useState(1000);
  const [district, setDistrict] = useState("Docklands");

  return (
    <div className="space-y-4">
      <Panel title="👞 Shoe Shine Stand" sub={shine?.hasStand ? `Lv.${shine.level} stand · $${shine.pending.toLocaleString()} pending` : "the humblest front in the city"}>
        {shine?.hasStand ? (
          <ActionBtn wide onClick={() => run(collectShine, {}).then(show)}>Collect Tips & Rumors</ActionBtn>
        ) : (
          <ActionBtn wide onClick={() => run(buyShine, {}).then(show)}>Buy Stand — $35,000</ActionBtn>
        )}
        {shine?.rumor && <div className="mt-2 text-[11px] italic" style={{ color: AMBER }}>👂 "{shine.rumor}"</div>}
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="🎬 Cinema Backroom" sub="$2,800/hr · bootleg screenings">
          <ActionBtn wide onClick={() => run(openCinema, {}).then(show)}>Open Backroom — $120,000</ActionBtn>
          <div className="mt-2"><ActionBtn wide onClick={() => run(collectCinema, {}).then(show)}>Collect Ticket Tin</ActionBtn></div>
        </Panel>
        <Panel title="⚰️ Funeral Home" sub={funeral?.owned ? "parlor open · heat scrubbing" : "$400,000 · legit disposal"}>
          {funeral?.owned ? (
            <ActionBtn wide onClick={() => run(disposeHeat, {}).then(show)}>Scrub My Record</ActionBtn>
          ) : (
            <ActionBtn wide onClick={() => run(buyFuneral, {}).then(show)}>Buy Parlor — $400,000</ActionBtn>
          )}
          <div className="mt-2 text-[10px]" style={{ color: DIM }}>Current wanted level: {funeral?.wanted ?? 0}</div>
        </Panel>
        <Panel title="🐟 Fish Market Stall" sub="morning auction · 22% suspicious crate">
          <ActionBtn wide onClick={() => run(castNets, {}).then(show)}>Cast the Nets</ActionBtn>
        </Panel>
        <Panel title="🚕 Taxi Medallions" sub={medallion?.owned ? `${medallion.count}/5 held · $${medallion.pending.toLocaleString()} pending` : "$250,000 each · lease to cabbies"}>
          <ActionBtn wide onClick={() => run(buyMedallion, {}).then(show)}>Buy Medallion — $250,000</ActionBtn>
          {medallion?.owned && <div className="mt-2"><ActionBtn wide onClick={() => run(collectMedallion, {}).then(show)}>Collect Lease Fees</ActionBtn></div>}
        </Panel>
        <Panel title="🧺 Laundromat Chain" sub="$1,400/hr per location · max 5">
          <ActionBtn wide onClick={() => run(buyLaundromat, {}).then(show)}>Open Location — $180,000</ActionBtn>
          <div className="mt-2"><ActionBtn wide onClick={() => run(collectLaundry, {}).then(show)}>Count the Quarters</ActionBtn></div>
        </Panel>
        <Panel title="⛽ Fuel Speculation" sub={`${fuel?.pricePerGallon ?? 2.5}$/gal right now · oscillates hourly`}>
          <div className="flex gap-2 mb-2">
            <input type="number" value={gallons} step={500} onChange={(e) => setGallons(+e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
            <ActionBtn onClick={() => run(buyFuel, { gallons }).then(show)}>Buy</ActionBtn>
            <ActionBtn onClick={() => run(sellFuel, {}).then(show)}>Sell</ActionBtn>
          </div>
          {fuel?.holding && <div className="text-[10px]" style={{ color: AMBER }}>Holding {fuel.holding.gallons.toLocaleString()} gal @ ${fuel.holding.boughtAtPrice}/gal</div>}
        </Panel>
        <Panel title="🔌 Power Grid Tap" sub="15-40% utility discount · blackout risk">
          <div className="flex gap-2">
            <input placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
            <ActionBtn danger onClick={() => run(tapGrid, { district }).then(show)}>Splice</ActionBtn>
          </div>
        </Panel>
        <Panel title="🪪 Union Desk" sub="dock actions cheaper & faster">
          <div className="grid grid-cols-3 gap-1">
            <ActionBtn onClick={() => run(bribeUnion, { tier: "steward" }).then(show)}>Steward $45k</ActionBtn>
            <ActionBtn onClick={() => run(bribeUnion, { tier: "business_agent" }).then(show)}>Agent $110k</ActionBtn>
            <ActionBtn onClick={() => run(bribeUnion, { tier: "president" }).then(show)}>Prez $260k</ActionBtn>
          </div>
        </Panel>
        <Panel title="🚬 Cigarette Runs" sub="tax-free cartons · three routes">
          <div className="grid grid-cols-3 gap-1">
            <ActionBtn onClick={() => run(runCigs, { distance: "county" }).then(show)}>County</ActionBtn>
            <ActionBtn onClick={() => run(runCigs, { distance: "state" }).then(show)}>State</ActionBtn>
            <ActionBtn danger onClick={() => run(runCigs, { distance: "coast" }).then(show)}>Coast</ActionBtn>
          </div>
        </Panel>
        <Panel title="🥤 Vending Route" sub="$650/hr per machine · max 6 spots">
          <ActionBtn wide onClick={() => run(buySpot, {}).then(show)}>Place Machine — $45,000</ActionBtn>
          <div className="mt-2"><ActionBtn wide onClick={() => run(restock, {}).then(show)}>Restock & Empty Coins</ActionBtn></div>
        </Panel>
      </div>
    </div>
  );
}

/* ════════════════ 6. VICE DEN (38,40,46-52) ════════════════ */
export function ViceDenPage() {
  const forge = useMutation(api.megaPack.forgePainting);
  const sellForged = useMutation(api.megaPack.sellForged);
  const postBail = useMutation(api.megaPack.postBail);
  const collectBail = useMutation(api.megaPack.collectBailDebt);
  const prisoners = useQuery(api.megaPack.getPrisoners);
  const betCoffin = useMutation(api.megaPack.betCoffin);
  const doubleOrNothing = useMutation(api.megaPack.doubleOrNothing);
  const fileFraud = useMutation(api.megaPack.fileFraudClaim);
  const offerPonzi = useMutation(api.megaPack.offerPonzi);
  const whaleTable = useMutation(api.megaPack.whaleTable);
  const fixFight = useMutation(api.megaPack.fixFight);
  const openSyn = useMutation(api.megaPack.openSyndicate);
  const [wager, setWager] = useState(25000);
  const [yieldPct, setYieldPct] = useState(20);
  const [tickets, setTickets] = useState(5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="🖌️ Art Forging Studio" sub="canvas · oils · an aging oven">
          <div className="grid grid-cols-3 gap-1 mb-2">
            <ActionBtn onClick={() => run(forge, { targetIndex: 0 }).then(show)}>Harbor $60k</ActionBtn>
            <ActionBtn onClick={() => run(forge, { targetIndex: 1 }).then(show)}>Blue $120k</ActionBtn>
            <ActionBtn onClick={() => run(forge, { targetIndex: 2 }).then(show)}>Winter $220k</ActionBtn>
          </div>
          <ActionBtn wide onClick={() => run(sellForged, {}).then(show)}>Place Forgeries with Fence</ActionBtn>
        </Panel>
        <Panel title="⚖️ Bail Bondsman" sub="bail = $25k × level · they owe 125%">
          <div className="space-y-1 mb-2 max-h-40 overflow-y-auto">
            {(prisoners ?? []).map((p: any) => (
              <Row key={p.id} icon="🔒" name={p.name} desc={`Lv.${p.level} · bail $${(25000 * p.level).toLocaleString()}`}
                right={<ActionBtn onClick={() => run(postBail, { defendantId: p.id, defendantName: p.name }).then(show)}>Post Bail</ActionBtn>} />
            ))}
            {(prisoners ?? []).length === 0 && <div className="text-[11px] italic" style={{ color: DIM }}>Nobody's inside right now.</div>}
          </div>
          <ActionBtn wide onClick={() => run(collectBail, {}).then(show)}>Collect Debts (+25%)</ActionBtn>
        </Panel>
        <Panel title="⚰️ Coffin Shop Roulette" sub="bet on which crew's shipment gets seized · 4.5× payout · 1/wk">
          <div className="grid grid-cols-3 gap-1 mb-2">
            {["The Kirin Boys", "Westgate Syndicate", "Red Hook Clique"].map((c) => (
              <ActionBtn key={c} danger onClick={() => run(betCoffin, { crew: c, wager }).then(show)}>{c.split(" ")[0]}</ActionBtn>
            ))}
          </div>
          <input type="number" value={wager} step={5000} onChange={(e) => setWager(+e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
        </Panel>
        <Panel title="🪙 Double-or-Nothing" sub="exit your money with style · 47%">
          <div className="flex gap-2">
            <input type="number" value={wager} step={5000} onChange={(e) => setWager(+e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
            <ActionBtn danger onClick={() => run(doubleOrNothing, { stake: wager }).then(show)}>Flip</ActionBtn>
          </div>
        </Panel>
        <Panel title="📄 Insurance Fraud" sub="arrange a fire · 30% investigation risk">
          <ActionBtn wide danger onClick={() => run(fileFraud, {}).then(show)}>File the Claim — $30,000</ActionBtn>
        </Panel>
        <Panel title="💼 Ponzi Desk" sub="promise the moon · decide who pays">
          <div className="flex gap-2">
            <input type="number" value={yieldPct} min={5} max={50} onChange={(e) => setYieldPct(+e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
            <ActionBtn onClick={() => run(offerPonzi, { yieldPct }).then(show)}>Open Desk</ActionBtn>
          </div>
          <div className="mt-2 text-[10px]" style={{ color: DIM }}>Investors arrive via the Rackets wire. Honoring pays reputation; collapsing costs it.</div>
        </Panel>
        <Panel title="🐋 Whale Table" sub="buy-in = 5% net worth · min $100k net">
          <ActionBtn wide danger onClick={() => run(whaleTable, {}).then(show)}>Sit with the Shark</ActionBtn>
        </Panel>
        <Panel title="🥊 Fight Fixing" sub="$70k to the boxer · 1.9× on your wager · 20% he runs">
          <div className="flex gap-2">
            <input type="number" value={wager} step={5000} onChange={(e) => setWager(+e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
            <ActionBtn danger onClick={() => run(fixFight, { wager }).then(show)}>Fix It</ActionBtn>
          </div>
        </Panel>
        <Panel title="🎰 Lotto Syndicate" sub="$50k/ticket · wins split by share">
          <div className="flex gap-2">
            <input type="number" value={tickets} min={1} max={20} onChange={(e) => setTickets(+e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
            <ActionBtn onClick={() => run(openSyn, { tickets }).then(show)}>Open Syndicate</ActionBtn>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ════════════════ 7. CITY DESK (57-60,69-73,78-80) ════════════════ */
export function CityDeskPage() {
  const weather = useQuery(api.megaPack.getWeatherState);
  const oaths = useQuery(api.megaPack.getOaths);
  const tales = useQuery(api.megaPack.getTales);
  const names = useQuery(api.megaPack.getStreetNames);
  const banner = useQuery(api.megaPack.getBanner);
  const deadSwitch = useQuery(api.megaPack.getDeadSwitch);
  const cartel = useQuery(api.megaPack.getCartelState);
  const witnesses = useQuery(api.megaPack.getWitnessThreats);
  const repair = useMutation(api.megaPack.repairDamage);
  const rollWeather = useMutation(api.megaPack.rollWeather);
  const stash = useMutation(api.megaPack.stashCache);
  const hunt = useMutation(api.megaPack.huntCaches);
  const takeOath = useMutation(api.megaPack.takeOath);
  const earnName = useMutation(api.megaPack.earnStreetName);
  const forgeBanner = useMutation(api.megaPack.forgeBanner);
  const eliminate = useMutation(api.megaPack.eliminateWitness);
  const armSwitch = useMutation(api.megaPack.armDeadSwitch);
  const signCartel = useMutation(api.megaPack.signCartelContract);
  const collectCartel = useMutation(api.megaPack.collectCartelPayout);
  const [stashVal, setStashVal] = useState(50000);
  const [stashLabel, setStashLabel] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [milestone, setMilestone] = useState("");
  const [emblem, setEmblem] = useState("🐺");
  const [motto, setMotto] = useState("");
  const [switchTarget, setSwitchTarget] = useState("");

  return (
    <div className="space-y-4">
      <Panel title="⛈️ Weather Desk" sub={`forecast: ${weather?.forecast ?? "…"} · $${(weather?.totalCost ?? 0).toLocaleString()} in repairs`}>
        <ActionBtn wide onClick={() => run(rollWeather, {}).then(show)}>Check Today's Storm Cell</ActionBtn>
        <div className="mt-2 space-y-1">
          {(weather?.outstanding ?? []).map((d: any) => (
            <Row key={d._id} icon="🔧" name={d.asset} desc={`repair $${d.repairCost.toLocaleString()}`}
              right={<ActionBtn onClick={() => run(repair, { damageId: d._id }).then(show)}>Repair</ActionBtn>} />
          ))}
        </div>
      </Panel>

      <Panel title="🐀 Sewer Cache Network" sub="stash money in the tunnels · others can find it">
        <div className="flex gap-2 mb-2">
          <input type="number" value={stashVal} step={10000} onChange={(e) => setStashVal(+e.target.value)}
            className="w-32 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <input placeholder="Cache label" value={stashLabel} onChange={(e) => setStashLabel(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <ActionBtn onClick={() => run(stash, { contentsValue: stashVal, label: stashLabel }).then(show)}>Stash</ActionBtn>
        </div>
        <ActionBtn wide onClick={() => run(hunt, {}).then(show)}>Hunt for Caches — $25,000</ActionBtn>
      </Panel>

      <Panel title="🩸 Blood Oath Ranks" sub="permanent sacrifice · permanent power">
        <div className="grid grid-cols-2 gap-2">
          {(oaths?.oaths ?? []).map((o: any, i: number) => {
            const taken = (oaths?.taken ?? []).includes(o.title);
            return (
              <div key={o.oath} className="rounded-xl p-3" style={{ border: `1px solid ${taken ? "rgba(220,38,38,0.5)" : "rgba(197,140,64,0.2)"}`, background: taken ? "rgba(120,10,10,0.15)" : "rgba(0,0,0,0.3)" }}>
                <div className="text-xs font-black mb-1" style={{ color: taken ? "#f87171" : AMBER }}>{o.oath}</div>
                <div className="text-[10px] mb-2" style={{ color: DIM }}>"{o.title}" — sacrifice {o.sacrifice === "money" ? `$${o.cost.toLocaleString()}` : o.cost + " " + o.sacrifice}, gain {o.grants}</div>
                {taken ? <div className="text-[10px] font-black text-red-400">✦ SWORN</div> :
                  <ActionBtn danger onClick={() => run(takeOath, { oathIndex: i }).then(show)}>Swear It</ActionBtn>}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="📖 Old-Timer's Tales" sub={`${tales?.unlockedCount ?? 0}/4 stories unlocked`}>
        <div className="space-y-2">
          {(tales?.all ?? []).map((t: any) => (
            <div key={t.tale} className="rounded-xl p-3" style={{ border: "1px solid rgba(197,140,64,0.15)", background: "rgba(0,0,0,0.3)", opacity: t.unlocked ? 1 : 0.45 }}>
              <div className="text-xs font-black" style={{ color: t.unlocked ? GOLD : DIM }}>{t.unlocked ? "📜" : "🔒"} {t.tale}</div>
              {t.unlocked && <div className="text-[11px] italic mt-1" style={{ color: DIM }}>"{t.text}"</div>}
              {!t.unlocked && <div className="text-[10px] mt-1" style={{ color: DIM }}>Unlocks: {t.trigger.replace(/_/g, " ")}</div>}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="💍 Heirlooms" sub="claim 2 · engrave milestones">
          <HeirloomBlock />
        </Panel>
        <Panel title="🕶️ Street Name" sub={names?.active ? `known as "${names.active}"` : "reach Lv.10 · the streets will say it"}>
          <div className="flex gap-2 mb-2">
            <input placeholder='e.g. "Two-Tone Tony"' value={nameInput} onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
            <input placeholder="Why" value={milestone} onChange={(e) => setMilestone(e.target.value)}
              className="w-32 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          </div>
          <ActionBtn wide onClick={() => run(earnName, { name: nameInput, milestone }).then(show)}>Make It Stick</ActionBtn>
        </Panel>
      </div>

      <Panel title="🏴 Crew Banner Forge" sub={banner?.banner ? `flying: ${banner.banner.emblem} "${banner.banner.motto}"` : "$100,000 · emblem, colors, motto"}>
        <div className="flex gap-2 mb-2">
          <input placeholder="🐺" value={emblem} maxLength={4} onChange={(e) => setEmblem(e.target.value)}
            className="w-16 rounded-lg px-3 py-2 text-lg text-center" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <input placeholder="Motto" value={motto} onChange={(e) => setMotto(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <ActionBtn onClick={() => run(forgeBanner, { emblem, colorPrimary: "#8b0000", colorSecondary: "#ffd700", motto }).then(show)}>Forge</ActionBtn>
        </div>
      </Panel>

      <Panel title="🤫 Witness Elimination" sub={`wanted: ${witnesses?.wanted ?? 0} · loose ends: ${(witnesses?.witnesses ?? []).length}`}>
        <div className="space-y-2">
          {(witnesses?.witnesses ?? []).map((w: any) => (
            <Row key={w.name} icon="👁️" name={`A ${w.name} saw too much`} desc={`cleaner's fee $${w.cost.toLocaleString()} · −2 wanted on success`}
              right={<ActionBtn danger onClick={() => run(eliminate, { witnessName: w.name, cost: w.cost }).then(show)}>Silence</ActionBtn>} />
          ))}
          {(witnesses?.witnesses ?? []).length === 0 && <div className="text-[11px] italic" style={{ color: DIM }}>No loose ends. The streets stayed quiet.</div>}
        </div>
      </Panel>

      <Panel title="💣 Dead Man's Switch" sub={deadSwitch?.switch?.armed ? `ARMED on ${deadSwitch.switch.targetName}` : "$200,000 · insurance against prison"}>
        <div className="flex gap-2">
          <input placeholder="Who leaks if you go inside?" value={switchTarget} onChange={(e) => setSwitchTarget(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <ActionBtn danger onClick={() => run(armSwitch, { targetName: switchTarget }).then(show)}>Arm Switch</ActionBtn>
        </div>
      </Panel>

      <Panel title="🐍 Cartel Introduction" sub={cartel?.eligible ? "level 50+ · you're on the list" : "level 50+ required · max 2 routes"}>
        <div className="space-y-2">
          {(cartel?.routes ?? []).map((r: any, i: number) => (
            <Row key={r.route} icon="📦" name={r.route} desc={`$${r.invested.toLocaleString()} in · $${r.monthly.toLocaleString()}/mo × ${r.months}mo`}
              right={<ActionBtn disabled={!cartel?.eligible} onClick={() => run(signCartel, { routeIndex: i }).then(show)}>Sign</ActionBtn>} />
          ))}
          {(cartel?.contracts ?? []).filter((c: any) => c.active).map((c: any) => (
            <Row key={c._id} icon="💵" name={`${c.route} — month ${c.collectedMonths}/${c.months}`} desc={`$${c.monthlyReturn.toLocaleString()}/mo pending`}
              right={<ActionBtn onClick={() => run(collectCartel, { contractId: c._id }).then(show)}>Collect</ActionBtn>} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* Heirloom block (uses its own queries — kept separate to avoid hook-order issues in maps) */
function HeirloomBlock() {
  const claim = useMutation(api.megaPack.claimHeirloom);
  const engrave = useMutation(api.megaPack.engraveHeirloom);
  // Simple fetch via list query not defined; use claim+toast only, plus engrave by id from a local claim tracker
  const [lastId, setLastId] = useState<string | null>(null);
  const [line, setLine] = useState("");
  return (
    <div className="space-y-2">
      <ActionBtn wide onClick={async () => { const r = await claim({}).catch((e) => toast.error(String(e.message ?? e))); if (r?.text) { toast.success(r.text); setLastId("latest"); } }}>
        Claim Heirloom
      </ActionBtn>
      {lastId && (
        <div className="flex gap-2">
          <input placeholder="Engrave a line…" value={line} onChange={(e) => setLine(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(197,140,64,0.3)", color: GOLD }} />
          <ActionBtn onClick={async () => { try { const r = await engrave({ heirloomId: lastId as any, line }); if (r?.text) toast.success(r.text); } catch (e: any) { toast.error(String(e.message ?? e).replace("Uncaught Error: ", "")); } }}>
            Engrave
          </ActionBtn>
        </div>
      )}
      <div className="text-[10px]" style={{ color: DIM }}>Heirlooms grow with your story. Engrave every milestone.</div>
    </div>
  );
}
