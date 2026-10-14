import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import RandomUser, {
  TYPE_CONFIG,
  PokemonType,
  formatPokemonName,
  getPokemonArtwork,
} from "./components/RandomUser";

const API = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 12;

const GENERATIONS = [
  { value: "", label: "Toutes les générations" },
  { value: "1", label: "Génération I · Kanto" },
  { value: "2", label: "Génération II · Johto" },
  { value: "3", label: "Génération III · Hoenn" },
  { value: "4", label: "Génération IV · Sinnoh" },
  { value: "5", label: "Génération V · Unys" },
  { value: "6", label: "Génération VI · Kalos" },
  { value: "7", label: "Génération VII · Alola" },
  { value: "8", label: "Génération VIII · Galar" },
  { value: "9", label: "Génération IX · Paldea" },
];

const STATS = {
  hp: "PV",
  attack: "Attaque",
  defense: "Défense",
  "special-attack": "Att. Spé.",
  "special-defense": "Déf. Spé.",
  speed: "Vitesse",
};

function getId(url) {
  return Number(url.match(/\/(\d+)\/?$/)?.[1] || 0);
}

function Pokeball({ className = "", animated = false }) {
  return (
    <span
      aria-hidden="true"
      className={`border-ink bg-paper relative inline-block shrink-0 overflow-hidden rounded-full border-[3px] ${
        animated ? "animate-pokeball" : ""
      } ${className}`}
    >
      <span className="bg-poke-red absolute inset-x-0 top-0 h-1/2" />
      <span className="bg-ink absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2" />
      <span className="border-ink bg-paper absolute top-1/2 left-1/2 h-[35%] w-[35%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px]" />
    </span>
  );
}

function App() {
  const reduceMotion = useReducedMotion();

  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [generation, setGeneration] = useState("");
  const [page, setPage] = useState(1);

  const [catalogue, setCatalogue] = useState([]);
  const [typeIds, setTypeIds] = useState(null);
  const [generationIds, setGenerationIds] = useState(null);

  const [pokemon, setPokemon] = useState([]);
  const [selected, setSelected] = useState(null);
  const [speciesDetail, setSpeciesDetail] = useState(null);

  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [pokemonLoading, setPokemonLoading] = useState(false);
  const [error, setError] = useState("");

  const [capturing, setCapturing] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalogue() {
      setCatalogueLoading(true);

      try {
        const response = await fetch(`${API}/pokemon-species?limit=2000`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Le Pokédex est indisponible.");
        }

        const data = await response.json();

        const list = data.results
          .map((item) => ({
            id: getId(item.url),
            name: item.name,
          }))
          .filter((item) => item.id > 0)
          .sort((a, b) => a.id - b.id);

        setCatalogue(list);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCatalogueLoading(false);
        }
      }
    }

    loadCatalogue();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFilters() {
      setFiltersLoading(true);

      try {
        const [typeResponse, generationResponse] = await Promise.all([
          type
            ? fetch(`${API}/type/${type}`, {
                signal: controller.signal,
              })
            : Promise.resolve(null),
          generation
            ? fetch(`${API}/generation/${generation}`, {
                signal: controller.signal,
              })
            : Promise.resolve(null),
        ]);

        if (typeResponse && !typeResponse.ok) {
          throw new Error("Impossible de charger les types.");
        }

        if (generationResponse && !generationResponse.ok) {
          throw new Error("Impossible de charger la génération.");
        }

        const typeData = typeResponse ? await typeResponse.json() : null;

        const generationData = generationResponse
          ? await generationResponse.json()
          : null;

        if (controller.signal.aborted) return;

        setTypeIds(
          typeData
            ? new Set(typeData.pokemon.map((item) => getId(item.pokemon.url)))
            : null,
        );

        setGenerationIds(
          generationData
            ? new Set(
                generationData.pokemon_species.map((item) => getId(item.url)),
              )
            : null,
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setFiltersLoading(false);
        }
      }
    }

    loadFilters();

    return () => controller.abort();
  }, [type, generation]);

  const filteredCatalogue = useMemo(() => {
    const search = query.trim().toLowerCase();
    const numericSearch = search.replace(/^#/, "");

    return catalogue.filter((item) => {
      const matchesName =
        !search ||
        item.name.includes(search) ||
        String(item.id) === numericSearch;

      const matchesType = !typeIds || typeIds.has(item.id);

      const matchesGeneration = !generationIds || generationIds.has(item.id);

      return matchesName && matchesType && matchesGeneration;
    });
  }, [catalogue, query, typeIds, generationIds]);

  const totalPages = Math.ceil(filteredCatalogue.length / PAGE_SIZE);

  const visiblePokemon = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredCatalogue.slice(start, start + PAGE_SIZE);
  }, [filteredCatalogue, page]);

  const visibleIds = visiblePokemon.map((item) => item.id).join(",");

  useEffect(() => {
    if (catalogueLoading || filtersLoading) return;

    const controller = new AbortController();

    async function loadPokemon() {
      setPokemonLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          visiblePokemon.map(async (item) => {
            const response = await fetch(`${API}/pokemon/${item.id}`, {
              signal: controller.signal,
            });

            if (!response.ok) {
              throw new Error("Impossible de charger les Pokémon.");
            }

            return response.json();
          }),
        );

        if (!controller.signal.aborted) {
          setPokemon(results);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setPokemon([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setPokemonLoading(false);
        }
      }
    }

    loadPokemon();

    return () => controller.abort();
  }, [visibleIds, catalogueLoading, filtersLoading]);

  useEffect(() => {
    if (!selected) {
      setSpeciesDetail(null);
      return;
    }

    const controller = new AbortController();

    async function loadSpeciesDetail() {
      setSpeciesDetail(null);

      try {
        const response = await fetch(selected.species.url, {
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!controller.signal.aborted) {
          setSpeciesDetail(data);
        }
      } catch {
        // La fiche reste accessible.
      }
    }

    loadSpeciesDetail();

    return () => controller.abort();
  }, [selected]);

  useEffect(() => {
    if (!selected) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [selected]);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setType("");
    setGeneration("");
    setPage(1);
  }

  function changePage(nextPage) {
    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openPokemon(item) {
    if (capturing) return;

    if (reduceMotion) {
      setSelected(item);
      return;
    }

    setCapturing(item);
  }

  function finishCapture() {
    if (!capturing) return;

    setSelected(capturing);
    setCapturing(null);
  }

  const loading = catalogueLoading || filtersLoading || pokemonLoading;

  const frenchName = speciesDetail?.names?.find(
    (item) => item.language.name === "fr",
  )?.name;

  const description = speciesDetail?.flavor_text_entries
    ?.find((item) => item.language.name === "fr")
    ?.flavor_text.replace(/[\n\f]/g, " ");

  const selectedType = selected?.types?.[0]?.type.name || "normal";

  const selectedBackground = TYPE_CONFIG[selectedType]?.bg || "bg-bg-normal";

  return (
    <main className="bg-page text-ink min-h-screen px-4 py-7 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* RECHERCHE */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-muted pointer-events-none absolute top-1/2 left-5 h-6 w-6 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="search"
              value={query}
              onChange={(event) => updateFilter(setQuery, event.target.value)}
              placeholder="Rechercher un Pokémon ou son numéro..."
              aria-label="Rechercher un Pokémon"
              className="rounded-card border-line bg-paper shadow-card placeholder:text-muted focus:border-poke-red focus:ring-poke-red/10 w-full border-2 py-5 pr-6 pl-14 text-base font-bold transition outline-none placeholder:font-medium focus:ring-4 sm:text-lg"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              value={type}
              onChange={(event) => updateFilter(setType, event.target.value)}
              aria-label="Filtrer par type"
              className="rounded-control border-line bg-paper focus:border-poke-red border-2 px-5 py-3 text-sm font-extrabold transition outline-none"
            >
              <option value="">Tous les types</option>

              {Object.entries(TYPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>

            <select
              value={generation}
              onChange={(event) =>
                updateFilter(setGeneration, event.target.value)
              }
              aria-label="Filtrer par génération"
              className="rounded-control border-line bg-paper focus:border-poke-red border-2 px-5 py-3 text-sm font-extrabold transition outline-none"
            >
              {GENERATIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <AnimatePresence>
              {(query || type || generation) && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={resetFilters}
                  className="rounded-control text-poke-red hover:bg-poke-red-soft px-4 py-3 text-sm font-extrabold transition"
                >
                  Effacer les filtres ×
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* RÉSULTATS */}
        <section>
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={reduceMotion ? {} : { rotate: 25, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Pokeball className="h-11 w-11" />
              </motion.div>

              <div>
                <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                  Pokédex
                </h1>

                <p className="text-muted mt-1 text-sm font-semibold">
                  {catalogueLoading || filtersLoading
                    ? "Chargement du Pokédex..."
                    : `${filteredCatalogue.length} Pokémon trouvés`}
                </p>
              </div>
            </div>

            {!catalogueLoading && totalPages > 0 && (
              <span className="bg-paper text-muted shadow-card rounded-full px-4 py-2 text-xs font-extrabold">
                PAGE {page} / {totalPages}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24"
              >
                <Pokeball className="mb-6 h-16 w-16" animated={!reduceMotion} />

                <p className="font-display text-lg font-bold">
                  Recherche des Pokémon...
                </p>

                <p className="text-muted mt-2 text-sm">
                  Le Professeur Chen prépare les fiches.
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-card border-line bg-paper shadow-card border p-12 text-center"
              >
                <h2 className="font-display text-2xl font-bold">
                  Oups, une erreur est survenue.
                </h2>

                <p className="text-muted mt-3 text-sm">{error}</p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-control bg-poke-red mt-6 px-6 py-3 font-extrabold text-white"
                >
                  Réinitialiser
                </button>
              </motion.div>
            ) : pokemon.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-card border-line bg-paper shadow-card border p-12 text-center"
              >
                <div className="mb-5 text-5xl">?</div>

                <h2 className="font-display text-2xl font-bold">
                  Aucun Pokémon trouvé.
                </h2>

                <p className="text-muted mt-3 text-sm">
                  Même le Professeur Chen ne trouve rien.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-control bg-poke-red mt-6 px-6 py-3 font-extrabold text-white"
                >
                  Effacer les filtres
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${page}-${type}-${generation}-${query}`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pokemon.map((item, index) => (
                    <RandomUser
                      key={item.id}
                      user={item}
                      index={index}
                      onSelect={openPokemon}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                    <motion.button
                      type="button"
                      whileTap={reduceMotion ? {} : { scale: 0.95 }}
                      onClick={() => changePage(page - 1)}
                      disabled={page === 1}
                      className="rounded-control border-line bg-paper hover:border-poke-red border-2 px-6 py-3 text-sm font-extrabold transition disabled:opacity-30"
                    >
                      ← Précédent
                    </motion.button>

                    <span className="font-display text-sm font-black">
                      {page} / {totalPages}
                    </span>

                    <motion.button
                      type="button"
                      whileTap={reduceMotion ? {} : { scale: 0.95 }}
                      onClick={() => changePage(page + 1)}
                      disabled={page >= totalPages}
                      className="rounded-control bg-poke-red hover:bg-poke-red-dark px-6 py-3 text-sm font-extrabold text-white transition disabled:opacity-30"
                    >
                      Suivant →
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* ANIMATION DE CAPTURE */}
      <AnimatePresence>
        {capturing && (
          <motion.div
            key="capture"
            className="bg-overlay fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{
                scale: [0.4, 1.2, 1, 1],
                opacity: 1,
              }}
              transition={{
                duration: 0.65,
                times: [0, 0.4, 0.65, 1],
                ease: "easeOut",
              }}
              onAnimationComplete={finishCapture}
            >
              <motion.div
                animate={{
                  rotate: [0, -18, 18, -10, 10, 0],
                }}
                transition={{
                  duration: 0.65,
                  ease: "easeInOut",
                }}
              >
                <Pokeball className="shadow-card-hover h-28 w-28 border-[6px]" />
              </motion.div>

              <p className="font-display text-lg font-black text-white">
                {formatPokemonName(capturing.name)}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="pokemon-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="bg-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Fiche de ${selected.name}`}
              initial={
                reduceMotion ? false : { opacity: 0, scale: 0.85, y: 30 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92, y: 15 }
              }
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 27,
              }}
              className="rounded-card bg-paper shadow-card-hover relative my-auto w-full max-w-4xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Fermer"
                className="bg-paper shadow-card hover:bg-poke-red absolute top-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full text-2xl font-black transition hover:text-white"
              >
                ×
              </button>

              <div className="grid md:grid-cols-2">
                <div
                  className={`relative flex min-h-80 flex-col items-center justify-center overflow-hidden p-8 ${selectedBackground}`}
                >
                  <div className="border-paper/40 pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full border-[36px]" />

                  <span className="bg-paper/85 font-display absolute top-7 left-7 rounded-full px-4 py-2 text-sm font-black">
                    #{String(selected.id).padStart(4, "0")}
                  </span>

                  <motion.img
                    src={getPokemonArtwork(selected)}
                    alt={selected.name}
                    initial={
                      reduceMotion
                        ? false
                        : { scale: 0.45, opacity: 0, rotate: -12 }
                    }
                    animate={{
                      scale: 1,
                      opacity: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 210,
                      damping: 16,
                      delay: 0.08,
                    }}
                    className="relative z-10 h-64 w-64 object-contain drop-shadow-xl sm:h-80 sm:w-80"
                  />

                  <div className="relative z-10 mt-5 flex flex-wrap justify-center gap-2">
                    {selected.types.map((item) => (
                      <PokemonType key={item.type.name} type={item.type.name} />
                    ))}
                  </div>
                </div>

                <div className="max-h-[75vh] overflow-y-auto p-7 sm:p-9">
                  <p className="text-poke-red text-xs font-extrabold tracking-widest uppercase">
                    Pokédex national
                  </p>

                  <h2 className="font-display mt-2 text-3xl font-black tracking-tight">
                    {frenchName || formatPokemonName(selected.name)}
                  </h2>

                  {frenchName && (
                    <p className="text-muted mt-1 text-sm font-semibold">
                      {formatPokemonName(selected.name)}
                    </p>
                  )}

                  {description && (
                    <p className="text-muted mt-5 text-sm leading-7">
                      {description}
                    </p>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-control bg-page p-4">
                      <p className="text-muted text-xs font-bold">Taille</p>
                      <p className="font-display mt-1 text-xl font-black">
                        {(selected.height / 10).toLocaleString("fr-FR")} m
                      </p>
                    </div>

                    <div className="rounded-control bg-page p-4">
                      <p className="text-muted text-xs font-bold">Poids</p>
                      <p className="font-display mt-1 text-xl font-black">
                        {(selected.weight / 10).toLocaleString("fr-FR")} kg
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-display text-lg font-black">Talents</h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.abilities.map((item) => (
                        <span
                          key={item.ability.name}
                          className="bg-poke-red-soft text-poke-red-dark rounded-full px-4 py-2 text-xs font-extrabold"
                        >
                          {formatPokemonName(item.ability.name)}
                          {item.is_hidden ? " · Caché" : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-7">
                    <h3 className="font-display text-lg font-black">
                      Statistiques
                    </h3>

                    <div className="mt-4 space-y-4">
                      {selected.stats.map((item, index) => (
                        <div key={item.stat.name}>
                          <div className="mb-2 flex items-center justify-between text-xs font-extrabold">
                            <span>
                              {STATS[item.stat.name] ||
                                formatPokemonName(item.stat.name)}
                            </span>

                            <span>{item.base_stat}</span>
                          </div>

                          <div className="bg-soft h-2.5 overflow-hidden rounded-full">
                            <motion.div
                              initial={reduceMotion ? false : { width: 0 }}
                              animate={{
                                width: `${Math.min(
                                  100,
                                  (item.base_stat / 255) * 100,
                                )}%`,
                              }}
                              transition={{
                                duration: reduceMotion ? 0 : 0.65,
                                delay: reduceMotion ? 0 : 0.18 + index * 0.08,
                                ease: "easeOut",
                              }}
                              className="bg-poke-blue h-full rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
