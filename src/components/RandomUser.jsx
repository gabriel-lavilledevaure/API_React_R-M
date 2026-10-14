import { motion, useReducedMotion } from "motion/react";

export const TYPE_CONFIG = {
  normal: {
    label: "Normal",
    bg: "bg-bg-normal",
    badge: "bg-type-normal",
  },
  fire: {
    label: "Feu",
    bg: "bg-bg-fire",
    badge: "bg-type-fire",
  },
  water: {
    label: "Eau",
    bg: "bg-bg-water",
    badge: "bg-type-water",
  },
  electric: {
    label: "Électrik",
    bg: "bg-bg-electric",
    badge: "bg-type-electric",
  },
  grass: {
    label: "Plante",
    bg: "bg-bg-grass",
    badge: "bg-type-grass",
  },
  ice: {
    label: "Glace",
    bg: "bg-bg-ice",
    badge: "bg-type-ice",
  },
  fighting: {
    label: "Combat",
    bg: "bg-bg-fighting",
    badge: "bg-type-fighting",
  },
  poison: {
    label: "Poison",
    bg: "bg-bg-poison",
    badge: "bg-type-poison",
  },
  ground: {
    label: "Sol",
    bg: "bg-bg-ground",
    badge: "bg-type-ground",
  },
  flying: {
    label: "Vol",
    bg: "bg-bg-flying",
    badge: "bg-type-flying",
  },
  psychic: {
    label: "Psy",
    bg: "bg-bg-psychic",
    badge: "bg-type-psychic",
  },
  bug: {
    label: "Insecte",
    bg: "bg-bg-bug",
    badge: "bg-type-bug",
  },
  rock: {
    label: "Roche",
    bg: "bg-bg-rock",
    badge: "bg-type-rock",
  },
  ghost: {
    label: "Spectre",
    bg: "bg-bg-ghost",
    badge: "bg-type-ghost",
  },
  dragon: {
    label: "Dragon",
    bg: "bg-bg-dragon",
    badge: "bg-type-dragon",
  },
  dark: {
    label: "Ténèbres",
    bg: "bg-bg-dark",
    badge: "bg-type-dark",
  },
  steel: {
    label: "Acier",
    bg: "bg-bg-steel",
    badge: "bg-type-steel",
  },
  fairy: {
    label: "Fée",
    bg: "bg-bg-fairy",
    badge: "bg-type-fairy",
  },
};

export function formatPokemonName(name = "") {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${config.badge}`}
    >
      {config.label}
    </span>
  );
}

export default function RandomUser({ user, onSelect, index = 0 }) {
  const reduceMotion = useReducedMotion();

  const primaryType = user.types?.[0]?.type.name || "normal";

  const config = TYPE_CONFIG[primaryType] || TYPE_CONFIG.normal;

  const artwork = getPokemonArtwork(user);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(user)}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 20,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.3),
        ease: "easeOut",
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -6,
              transition: {
                duration: 0.2,
              },
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className="group bg-paper shadow-card hover:shadow-card-hover focus-visible:outline-poke-red w-full overflow-hidden rounded-3xl text-left transition-shadow duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {/* Zone visuelle */}
      <div
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden ${config.bg}`}
      >
        {/* Numéro */}
        <span className="font-display text-ink/40 absolute top-5 left-5 z-10 text-sm font-bold">
          #{String(user.id).padStart(4, "0")}
        </span>

        {/* Cercle décoratif */}
        <div className="pointer-events-none absolute h-48 w-48 rounded-full border-[28px] border-white/25 sm:h-52 sm:w-52" />

        {/* Illustration */}
        <motion.img
          src={artwork}
          alt={formatPokemonName(user.name)}
          loading="lazy"
          className="relative z-10 h-[78%] w-[78%] object-contain drop-shadow-lg"
          whileHover={
            reduceMotion
              ? undefined
              : {
                  scale: 1.08,
                  rotate: 3,
                }
          }
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 18,
          }}
        />
      </div>

      {/* Informations */}
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <h2 className="font-display truncate text-xl font-bold tracking-tight">
            {formatPokemonName(user.name)}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {user.types.map((item) => (
              <PokemonType key={item.type.name} type={item.type.name} />
            ))}
          </div>
        </div>

        {/* Flèche */}
        <motion.span
          aria-hidden="true"
          className="bg-page text-ink group-hover:bg-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-colors duration-200 group-hover:text-white"
        >
          ↗
        </motion.span>
      </div>
    </motion.button>
  );
}
