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

// A standard deck has 25 cards of each color (plus 8 Wilds).
const CARDS_PER_COLOR = 25;

// Full class strings so Tailwind can detect them at build time.
const COLORS: {
  id: ColorId;
  card: string;
  // Readable text on top of `card`.
  ink: string;
  text: string;
  preferred: string;
}[] = [
  {
    id: "green",
    card: "bg-[#379711]",
    ink: "text-white",
    text: "text-[#379711]",
    preferred:
      "bg-[#379711]/20 text-[#379711] border-[#379711]/60 shadow-lg shadow-[#379711]/10",
  },
  {
    id: "red",
    card: "bg-[#D72600]",
    ink: "text-white",
    text: "text-[#D72600]",
    preferred:
      "bg-[#D72600]/20 text-[#D72600] border-[#D72600]/60 shadow-lg shadow-[#D72600]/10",
  },
  {
    id: "yellow",
    card: "bg-[#ECD407]",
    ink: "text-slate-900",
    text: "text-[#ECD407]",
    preferred:
      "bg-[#ECD407]/20 text-[#ECD407] border-[#ECD407]/60 shadow-lg shadow-[#ECD407]/10",
  },
  {
    id: "blue",
    card: "bg-[#0956BF]",
    ink: "text-white",
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

type Played = Record<ColorId, number>;

const NONE_PLAYED: Played = { green: 0, red: 0, yellow: 0, blue: 0 };

// Chance that a colored card in the opponent's hand is each color: the share of
// unseen cards of that color among the colors they aren't known to be out of.
// null when nothing is left to split.
function handOdds(
  opponent: Opponent,
  played: Played,
): Record<ColorId, number | null> {
  const unseen = (id: ColorId) =>
    opponent.missing.includes(id)
      ? 0
      : Math.max(0, CARDS_PER_COLOR - played[id]);
  const total = COLORS.reduce((sum, color) => sum + unseen(color.id), 0);
  const odds = (id: ColorId) => (total === 0 ? null : unseen(id) / total);

  return {
    green: odds("green"),
    red: odds("red"),
    yellow: odds("yellow"),
    blue: odds("blue"),
  };
}

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
  odds,
  layout,
  onToggleCard,
  onTogglePreference,
}: {
  opponent: Opponent;
  odds: Record<ColorId, number | null>;
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
          const chance = odds[color.id];

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
                    className={`flex items-center justify-center rounded border border-white/20 text-sm font-bold shadow-inner md:text-base ${color.ink} ${layout.inner}`}
                  >
                    {chance === null ? "–" : `${Math.round(chance * 100)}%`}
                  </div>
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

function PlayedCounter({
  played,
  onChange,
}: {
  played: Played;
  onChange: (color: ColorId, delta: number) => void;
}) {
  return (
    <div className="z-10 flex flex-col items-center gap-2">
      <span className="rounded bg-slate-800/80 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-slate-400 shadow">
        Played Cards
      </span>
      <div className="flex gap-3 rounded-xl border border-slate-700/30 bg-slate-900/40 p-2 shadow-lg backdrop-blur-sm">
        {COLORS.map((color) => {
          const count = played[color.id];

          return (
            <div key={color.id} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => onChange(color.id, 1)}
                disabled={count >= CARDS_PER_COLOR}
                aria-label={`Count a played ${color.id} card (${count} played)`}
                className={`flex h-12 w-14 flex-col items-center justify-center rounded-lg shadow-md transition-all duration-150 select-none hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 md:w-16 ${color.card} ${color.ink}`}
              >
                <span className="text-lg leading-none font-black">{count}</span>
                <span className="text-[9px] font-semibold uppercase opacity-80">
                  {CARDS_PER_COLOR - count} left
                </span>
              </button>
              <button
                type="button"
                onClick={() => onChange(color.id, -1)}
                disabled={count === 0}
                aria-label={`Undo a played ${color.id} card`}
                className="w-full rounded border border-slate-800 bg-slate-950/40 text-sm leading-5 font-bold text-slate-400 transition-all duration-150 hover:border-slate-700 hover:text-slate-300 disabled:opacity-30"
              >
                −
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
  const [played, setPlayed] = useState(NONE_PLAYED);

  const changePlayed = (color: ColorId, delta: number) => {
    setPlayed((prev) => ({
      ...prev,
      [color]: Math.min(CARDS_PER_COLOR, Math.max(0, prev[color] + delta)),
    }));
  };

  const resetGame = () => {
    setOpponents(INITIAL_STATE);
    setPlayed(NONE_PLAYED);
  };

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
      odds={handOdds(opponents[position], played)}
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
          onClick={resetGame}
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

        {/* Your seat: count every colored card played to the pile. */}
        <div className="col-span-2 justify-self-center md:absolute md:bottom-4 md:left-1/2 md:-translate-x-1/2">
          <PlayedCounter played={played} onChange={changePlayed} />
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
        <div>
          Tap a color in{" "}
          <span className="font-semibold text-amber-400">Played Cards</span>{" "}
          every time one is played (− undoes). Each opponent card shows the
          chance a card in their hand is that color.
        </div>
      </footer>
    </div>
  );
}
