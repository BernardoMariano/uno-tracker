"use client";

import { useState } from "react";

type ColorId = "green" | "red" | "yellow" | "blue";
type Position = "left" | "top" | "right";

type Opponent = {
  name: string;
  // Colors the opponent is known to be out of (they drew on that color).
  missing: ColorId[];
  // Color they last declared with a Wild; at most one per opponent.
  preferred: ColorId | null;
};

// Full class strings so Tailwind can detect them at build time.
const COLORS: {
  id: ColorId;
  card: string;
  text: string;
  preferred: string;
}[] = [
  {
    id: "green",
    card: "bg-[#379711]",
    text: "text-[#379711]",
    preferred:
      "bg-[#379711]/20 text-[#379711] border-[#379711]/60 shadow-lg shadow-[#379711]/10",
  },
  {
    id: "red",
    card: "bg-[#D72600]",
    text: "text-[#D72600]",
    preferred:
      "bg-[#D72600]/20 text-[#D72600] border-[#D72600]/60 shadow-lg shadow-[#D72600]/10",
  },
  {
    id: "yellow",
    card: "bg-[#ECD407]",
    text: "text-[#ECD407]",
    preferred:
      "bg-[#ECD407]/20 text-[#ECD407] border-[#ECD407]/60 shadow-lg shadow-[#ECD407]/10",
  },
  {
    id: "blue",
    card: "bg-[#0956BF]",
    text: "text-[#0956BF]",
    preferred:
      "bg-[#0956BF]/20 text-[#0956BF] border-[#0956BF]/60 shadow-lg shadow-[#0956BF]/10",
  },
];

const NOT_PREFERRED =
  "bg-slate-950/40 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400";

const INITIAL_STATE: Record<Position, Opponent> = {
  left: { name: "Opponent (Left)", missing: [], preferred: null },
  top: { name: "Opponent (Top)", missing: [], preferred: null },
  right: { name: "Opponent (Right)", missing: [], preferred: null },
};

const UPRIGHT = {
  set: "flex-row",
  item: "flex-col items-center",
  card: "h-20 w-14 md:h-24 md:w-16",
  inner: "h-16 w-10 md:h-20 md:w-12",
  fav: "w-full py-0.5",
};

// Below md the side hands lie sideways (left turned 90°, right -90°) as columns
// of landscape cards, so labels and marks stay upright; md+ shows every hand upright.
const SIDEWAYS = {
  card: "h-14 w-20 md:h-24 md:w-16",
  inner: "h-10 w-16 md:h-20 md:w-12",
  fav: "self-stretch px-1 md:self-auto md:w-full md:py-0.5",
};

const LAYOUTS: Record<Position, typeof UPRIGHT> = {
  top: UPRIGHT,
  left: {
    ...SIDEWAYS,
    set: "flex-col md:flex-row",
    item: "flex-row-reverse items-stretch md:flex-col md:items-center",
  },
  right: {
    ...SIDEWAYS,
    set: "flex-col-reverse md:flex-row",
    item: "flex-row items-stretch md:flex-col md:items-center",
  },
};

function CardSet({
  opponent,
  layout,
  onToggleCard,
  onTogglePreference,
}: {
  opponent: Opponent;
  layout: typeof UPRIGHT;
  onToggleCard: (color: ColorId) => void;
  onTogglePreference: (color: ColorId) => void;
}) {
  return (
    <div className="z-10 flex flex-col items-center gap-2">
      <span className="rounded bg-slate-800/80 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-slate-400 shadow">
        {opponent.name}
      </span>
      <div
        className={`flex gap-3 rounded-xl border border-slate-700/30 bg-slate-900/40 p-2 shadow-lg backdrop-blur-sm ${layout.set}`}
      >
        {COLORS.map((color) => {
          const active = !opponent.missing.includes(color.id);
          const preferred = opponent.preferred === color.id;

          return (
            <div key={color.id} className={`flex gap-2 ${layout.item}`}>
              <button
                type="button"
                onClick={() => onToggleCard(color.id)}
                aria-pressed={!active}
                aria-label={
                  active ? `Mark ${color.id} as missing` : `Restore ${color.id}`
                }
                title={
                  active ? `Mark ${color.id} as missing` : `Restore ${color.id}`
                }
                className={`relative flex items-center justify-center rounded-lg text-2xl font-black transition-all duration-300 select-none ${layout.card} ${
                  active
                    ? `${color.card} text-white shadow-md hover:-translate-y-1 hover:shadow-xl active:scale-95`
                    : "border-2 border-dashed border-slate-500 bg-slate-800 shadow-inner"
                }`}
              >
                {active ? (
                  <div
                    className={`rounded border border-white/20 shadow-inner ${layout.inner}`}
                  />
                ) : (
                  <span
                    className={`${color.text} animate-scale-in text-3xl font-bold`}
                  >
                    ✕
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onTogglePreference(color.id)}
                aria-pressed={preferred}
                aria-label={`${color.id} Wild preference`}
                title={
                  preferred
                    ? "Opponent selected this with a Wild (AVOID!)"
                    : `Mark ${color.id} as Wild preference`
                }
                className={`flex items-center justify-center gap-1 rounded border px-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 ${layout.fav} ${
                  preferred ? color.preferred : NOT_PREFERRED
                }`}
              >
                <span>★</span>
                <span className="hidden md:inline">Fav</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UnoTracker() {
  const [opponents, setOpponents] = useState(INITIAL_STATE);

  const updateOpponent = (
    position: Position,
    update: (opponent: Opponent) => Opponent,
  ) => {
    setOpponents((prev) => ({ ...prev, [position]: update(prev[position]) }));
  };

  const toggleCard = (position: Position, color: ColorId) => {
    updateOpponent(position, (opponent) => ({
      ...opponent,
      missing: opponent.missing.includes(color)
        ? opponent.missing.filter((id) => id !== color)
        : [...opponent.missing, color],
    }));
  };

  const togglePreference = (position: Position, color: ColorId) => {
    updateOpponent(position, (opponent) => ({
      ...opponent,
      preferred: opponent.preferred === color ? null : color,
    }));
  };

  const cardSet = (position: Position) => (
    <CardSet
      opponent={opponents[position]}
      layout={LAYOUTS[position]}
      onToggleCard={(color) => toggleCard(position, color)}
      onTogglePreference={(color) => togglePreference(position, color)}
    />
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-between bg-slate-950 p-4 font-sans text-slate-100 select-none">
      <header className="flex w-full max-w-4xl items-center justify-between border-b border-slate-800 py-2">
        <h1 className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 bg-clip-text text-lg font-bold text-transparent md:text-xl">
          UNO CARD TRACKER
        </h1>
        <button
          type="button"
          onClick={() => setOpponents(INITIAL_STATE)}
          className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-medium text-white shadow-md transition-all duration-150 hover:bg-rose-500 active:bg-rose-700 md:text-sm"
        >
          Reset Game
        </button>
      </header>

      {/* Phones put the top hand first with the sideways side hands below it at
          the screen edges; wider screens seat everyone around the table. */}
      <main className="my-auto grid w-full max-w-4xl grid-cols-2 gap-x-2 gap-y-6 py-6 md:relative md:flex md:aspect-[4/3] md:max-h-[70vh] md:items-center md:justify-center md:py-0">
        <div className="absolute hidden h-2/5 w-3/5 items-center justify-center rounded-[50%] border-4 border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-2xl md:flex">
          <div className="text-center text-sm font-semibold uppercase tracking-widest opacity-25">
            Game Table
          </div>
        </div>

        <div className="col-span-2 justify-self-center md:absolute md:top-4 md:left-1/2 md:-translate-x-1/2">
          {cardSet("top")}
        </div>

        <div className="justify-self-start md:absolute md:top-1/2 md:left-4 md:-translate-y-1/2">
          {cardSet("left")}
        </div>

        <div className="justify-self-end md:absolute md:top-1/2 md:right-4 md:-translate-y-1/2">
          {cardSet("right")}
        </div>

        <div className="col-span-2 justify-self-center opacity-40 md:absolute md:bottom-4 md:left-1/2 md:-translate-x-1/2">
          <span className="rounded-full border border-slate-800 bg-slate-900/50 px-4 py-1 text-xs font-bold uppercase tracking-widest text-slate-500">
            Your View
          </span>
        </div>
      </main>

      <footer className="flex max-w-md flex-col gap-1 rounded-lg border border-slate-900 bg-slate-900/20 px-4 py-2 text-center text-xs text-slate-500">
        <div>
          Click a color block when an opponent is forced to{" "}
          <span className="font-semibold text-amber-400">draw</span> (marks as
          missing <span className="font-semibold text-rose-400">✕</span>).
        </div>
        <div>
          Toggle the <span className="font-semibold text-amber-400">★ Fav</span>{" "}
          button next to a card to mark their declared Wild preference (only one
          active per opponent).
        </div>
      </footer>
    </div>
  );
}
