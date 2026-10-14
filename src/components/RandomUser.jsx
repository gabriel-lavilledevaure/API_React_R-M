import { useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

export const TYPE_CONFIG = {
  normal: { label: "Normal", bg: "bg-bg-normal", badge: "bg-type-normal" },
  fire: { label: "Feu", bg: "bg-bg-fire", badge: "bg-type-fire" },
  water: { label: "Eau", bg: "bg-bg-water", badge: "bg-type-water" },
  electric: {
    label: "Électrik",
    bg: "bg-bg-electric",
    badge: "bg-type-electric",
  },
  grass: { label: "Plante", bg: "bg-bg-grass", badge: "bg-type-grass" },
  ice: { label: "Glace", bg: "bg-bg-ice", badge: "bg-type-ice" },
  fighting: {
    label: "Combat",
    bg: "bg-bg-fighting",
    badge: "bg-type-fighting",
  },
  poison: { label: "Poison", bg: "bg-bg-poison", badge: "bg-type-poison" },
  ground: { label: "Sol", bg: "bg-bg-ground", badge: "bg-type-ground" },
  flying: { label: "Vol", bg: "bg-bg-flying", badge: "bg-type-flying" },
  psychic: { label: "Psy", bg: "bg-bg-psychic", badge: "bg-type-psychic" },
  bug: { label: "Insecte", bg: "bg-bg-bug", badge: "bg-type-bug" },
  rock: { label: "Roche", bg: "bg-bg-rock", badge: "bg-type-rock" },
  ghost: { label: "Spectre", bg: "bg-bg-ghost", badge: "bg-type-ghost" },
  dragon: { label: "Dragon", bg: "bg-bg-dragon", badge: "bg-type-dragon" },
  dark: { label: "Ténèbres", bg: "bg-bg-dark", badge: "bg-type-dark" },
  steel: { label: "Acier", bg: "bg-bg-steel", badge: "bg-type-steel" },
  fairy: { label: "Fée", bg: "bg-bg-fairy", badge: "bg-type-fairy" },
};

const ENERGY = {
  normal: "◉",
  fire: "♨",
  water: "💧",
  electric: "ϟ",
  grass: "✿",
  ice: "❄",
  fighting: "✊",
  poison: "☣",
  ground: "◆",
  flying: "◈",
  psychic: "◉",
  bug: "✳",
  rock: "◆",
  ghost: "☾",
  dragon: "✦",
  dark: "☽",
  steel: "⬡",
  fairy: "✧",
};

export function formatPokemonName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getPokemonArtwork(pokemon) {
  return (
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.other?.home?.front_default ||
    pokemon.sprites?.front_default ||
    ""
  );
}

export function PokemonType({ type }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.normal;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-extrabold text-white ${config.badge}`}
    >
      {config.label}
    </span>
  );
}

function RandomUser({ user, onSelect, index = 0 }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(x, {
    stiffness: 180,
    damping: 22,
  });

  const rotateY = useSpring(y, {
    stiffness: 180,
    damping: 22,
  });

  const primaryType = user.types[0]?.type.name || "normal";
  const config = TYPE_CONFIG[primaryType] || TYPE_CONFIG.normal;

  const artwork = getPokemonArtwork(user);

  const hp = user.stats.find((item) => item.stat.name === "hp")?.base_stat || 0;

  const attacks = user.moves.slice(0, 2).map((item, attackIndex) => ({
    name: formatPokemonName(item.move.name),
    damage: attackIndex === 0 ? 30 : 60,
  }));

  function handleMouseMove(event) {
    if (reduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;

    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    x.set(relativeY * -12);
    y.set(relativeX * 12);
  }

  function handleMouseLeave() {
    setHovered(false);
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(user)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.04, 0.4),
      }}
      whileTap={reduceMotion ? {} : { scale: 0.97 }}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 900,
      }}
      className="group border-poke-yellow bg-poke-yellow shadow-card hover:shadow-card-hover relative block w-full cursor-pointer rounded-[22px] border-[7px] p-1 text-left transition-shadow duration-300"
    >
      {/* FOND DE LA CARTE */}
      <div
        className={`border-ink/15 relative flex h-full flex-col overflow-hidden rounded-xl border-2 ${config.bg}`}
      >
        {/* EFFET HOLOGRAPHIQUE */}
        <motion.div
          aria-hidden="true"
          animate={{
            opacity: hovered && !reduceMotion ? 0.45 : 0,
          }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(115deg,transparent_20%,var(--ds-holo-blue)_40%,var(--ds-holo-pink)_55%,var(--ds-holo-yellow)_70%,transparent_90%)] mix-blend-screen"
        />

        {/* EN-TÊTE DE CARTE */}
        <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-4 pb-2">
          <div className="min-w-0">
            <p className="text-ink/60 text-[9px] font-black tracking-wider uppercase">
              Pokémon de base
            </p>

            <h2 className="font-display truncate text-xl font-black tracking-tight">
              {formatPokemonName(user.name)}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <span className="font-display text-poke-red text-xl font-black">
              {hp}
            </span>

            <span className="text-poke-red text-[10px] font-black">PV</span>

            <span
              className={`ml-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black text-white ${config.badge}`}
            >
              {ENERGY[primaryType]}
            </span>
          </div>
        </div>

        {/* ILLUSTRATION */}
        <div className="border-poke-yellow bg-paper/40 relative mx-3 overflow-hidden border-[4px] shadow-inner">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--ds-holo-white),transparent_70%)]" />

          <motion.img
            src={artwork}
            alt={formatPokemonName(user.name)}
            loading="lazy"
            animate={
              hovered && !reduceMotion
                ? { y: -7, scale: 1.06 }
                : { y: 0, scale: 1 }
            }
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 18,
            }}
            className="relative z-10 aspect-[1.25/1] w-full object-contain p-5 drop-shadow-xl"
          />
        </div>

        {/* DESCRIPTION SOUS IMAGE */}
        <div className="border-ink/15 bg-poke-yellow/70 text-ink/80 mx-3 mt-1 border px-2 py-1 text-center text-[10px] font-extrabold italic">
          N° {String(user.id).padStart(4, "0")}
          {" · "}
          {TYPE_CONFIG[primaryType]?.label}
          {" · "}
          {(user.height / 10).toLocaleString("fr-FR")} m{" · "}
          {(user.weight / 10).toLocaleString("fr-FR")} kg
        </div>

        {/* ATTAQUES */}
        <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-5">
          {attacks.map((attack, attackIndex) => (
            <div
              key={`${attack.name}-${attackIndex}`}
              className="border-ink/15 flex items-center gap-3 border-b py-3 last:border-0"
            >
              <div className="flex shrink-0 gap-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white ${config.badge}`}
                >
                  {ENERGY[primaryType]}
                </span>

                {attackIndex > 0 && (
                  <span className="bg-ink/70 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white">
                    ◉
                  </span>
                )}
              </div>

              <span className="font-display min-w-0 flex-1 truncate text-sm font-black">
                {attack.name}
              </span>

              <span className="font-display text-lg font-black">
                {attack.damage}
              </span>
            </div>
          ))}
        </div>

        {/* BAS DE CARTE */}
        <div className="border-ink/20 mt-auto border-t-2 px-4 pt-3 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-ink/60 text-[9px] font-black tracking-wide uppercase">
                Faiblesse
              </p>

              <span className="text-xs font-extrabold">
                {user.types.length > 1
                  ? TYPE_CONFIG[user.types[1].type.name]?.label
                  : "—"}
              </span>
            </div>

            <div className="text-right">
              <p className="text-ink/60 text-[9px] font-black tracking-wide uppercase">
                Retraite
              </p>

              <span className="text-xs font-extrabold">◉ ◉</span>
            </div>
          </div>

          <div className="border-ink/15 mt-3 flex items-center justify-between border-t pt-2">
            <span className="text-ink/50 text-[9px] font-black tracking-widest uppercase">
              Pokédex Collection
            </span>

            <span className="text-xs font-black">
              #{String(user.id).padStart(4, "0")} ✦
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default RandomUser;
