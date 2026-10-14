import { useEffect, useMemo, useRef, useState } from "react";
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

export default function App() {
  const reduceMotion = useReducedMotion();
  const observerRef = useRef(null);
  const cacheRef = useRef(new Map());

  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [generation, setGeneration] = useState("");

  const [catalogue, setCatalogue] = useState([]);
  const [filters, setFilters] = useState({
    key: "|",
    typeIds: null,
    generationIds: null,
  });

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pokemon, setPokemon] = useState([]);
  const [selected, setSelected] = useState(null);
  const [speciesDetail, setSpeciesDetail] = useState(null);

  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [pokemonLoading, setPokemonLoading] = useState(false);

  const [catalogueError, setCatalogueError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [pokemonError, setPokemonError] = useState("");

  const filterKey = `${type}|${generation}`;

  // Chargement du catalogue
  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalogue() {
      setCatalogueLoading(true);
      setCatalogueError("");

      try {
        const response = await fetch(`${API}/pokemon-species?limit=2000`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Impossible de charger le Pokédex.");
        }

        const data = await response.json();

        const list = data.results
          .map((item) => ({
            id: getId(item.url),
            name: item.name,
          }))
          .filter((item) => item.id > 0)
          .sort((a, b) => a.id - b.id);

        if (!controller.signal.aborted) {
          setCatalogue(list);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setCatalogueError(error.message);
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

  // Chargement des filtres
  useEffect(() => {
    const controller = new AbortController();

    async function loadFilters() {
      setFiltersLoading(true);
      setFilterError("");

      try {
        const [typeResponse, generationResponse] = await Promise.all([
          type
            ? fetch(`${API}/type/${type}`, {
                signal: controller.signal,
              })
            : null,

          generation
            ? fetch(`${API}/generation/${generation}`, {
                signal: controller.signal,
              })
            : null,
        ]);

        if (
          (typeResponse && !typeResponse.ok) ||
          (generationResponse && !generationResponse.ok)
        ) {
          throw new Error("Impossible de charger les filtres.");
        }

        const [typeData, generationData] = await Promise.all([
          typeResponse ? typeResponse.json() : null,
          generationResponse ? generationResponse.json() : null,
        ]);

        if (controller.signal.aborted) return;

        setFilters({
          key: filterKey,
          typeIds: typeData
            ? new Set(typeData.pokemon.map((item) => getId(item.pokemon.url)))
            : null,

          generationIds: generationData
            ? new Set(
                generationData.pokemon_species.map((item) => getId(item.url)),
              )
            : null,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setFilterError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setFiltersLoading(false);
        }
      }
    }

    loadFilters();

    return () => controller.abort();
  }, [type, generation, filterKey]);

  const filtersReady = filters.key === filterKey && !filtersLoading;

  // Recherche + filtres
  const filteredCatalogue = useMemo(() => {
    if (!filtersReady || filterError) return [];

    const search = query.trim().toLowerCase();
    const numericSearch = search.replace(/^#/, "");

    return catalogue.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.includes(search) ||
        String(item.id) === numericSearch;

      const matchesType = !filters.typeIds || filters.typeIds.has(item.id);

      const matchesGeneration =
        !filters.generationIds || filters.generationIds.has(item.id);

      return matchesSearch && matchesType && matchesGeneration;
    });
  }, [catalogue, query, filters, filtersReady, filterError]);

  const visiblePokemon = useMemo(
    () => filteredCatalogue.slice(0, visibleCount),
    [filteredCatalogue, visibleCount],
  );

  const visibleIds = visiblePokemon.map((item) => item.id).join(",");

  // Chargement des Pokémon visibles
  useEffect(() => {
    if (catalogueLoading || !filtersReady || catalogueError || filterError) {
      return;
    }

    const controller = new AbortController();

    async function loadPokemon() {
      setPokemonLoading(true);
      setPokemonError("");

      try {
        const results = await Promise.all(
          visiblePokemon.map(async (item) => {
            if (cacheRef.current.has(item.id)) {
              return cacheRef.current.get(item.id);
            }

            const response = await fetch(`${API}/pokemon/${item.id}`, {
              signal: controller.signal,
            });

            if (!response.ok) {
              throw new Error("Impossible de charger les Pokémon.");
            }

            const data = await response.json();

            cacheRef.current.set(item.id, data);

            return data;
          }),
        );

        if (!controller.signal.aborted) {
          setPokemon(results);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setPokemonError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setPokemonLoading(false);
        }
      }
    }

    loadPokemon();

    return () => controller.abort();
  }, [visibleIds, catalogueLoading, filtersReady, catalogueError, filterError]);

  // Chargement automatique au scroll
  const hasMore = visibleCount < filteredCatalogue.length;

  useEffect(() => {
    if (
      !hasMore ||
      pokemonLoading ||
      catalogueLoading ||
      !filtersReady ||
      catalogueError ||
      filterError ||
      pokemonError
    ) {
      return;
    }

    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + PAGE_SIZE, filteredCatalogue.length),
          );
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    hasMore,
    pokemonLoading,
    catalogueLoading,
    filtersReady,
    filteredCatalogue.length,
    catalogueError,
    filterError,
    pokemonError,
  ]);

  // Fiche détaillée
  useEffect(() => {
    if (!selected) {
      setSpeciesDetail(null);
      return;
    }

    const controller = new AbortController();

    async function loadSpecies() {
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
        // La fiche reste accessible sans description.
      }
    }

    loadSpecies();

    return () => controller.abort();
  }, [selected]);

  // Échap pour fermer la fiche
  useEffect(() => {
    if (!selected) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelected(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  function updateFilter(setter, value) {
    setter(value);
    setVisibleCount(PAGE_SIZE);
    setPokemon([]);
  }

  function resetFilters() {
    setQuery("");
    setType("");
    setGeneration("");
    setVisibleCount(PAGE_SIZE);
    setPokemon([]);
  }

  const loading = catalogueLoading || !filtersReady;

  const error = catalogueError || filterError || pokemonError;

  const frenchName = speciesDetail?.names?.find(
    (item) => item.language.name === "fr",
  )?.name;

  const description = speciesDetail?.flavor_text_entries
    ?.find((item) => item.language.name === "fr")
    ?.flavor_text.replace(/[\n\f]/g, " ");

  const selectedType = selected?.types?.[0]?.type.name || "normal";

  const selectedBackground = TYPE_CONFIG[selectedType]?.bg || "bg-bg-normal";

  return (
    <main className="bg-page text-ink min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* RECHERCHE */}
        <section className="mb-10">
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
              className="rounded-control border-line bg-paper focus:border-poke-red border-2 px-5 py-3 text-sm font-extrabold outline-none"
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
              className="rounded-control border-line bg-paper focus:border-poke-red border-2 px-5 py-3 text-sm font-extrabold outline-none"
            >
              {GENERATIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            {(query || type || generation) && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-control text-poke-red hover:bg-poke-red-soft px-4 py-3 text-sm font-extrabold"
              >
                Effacer les filtres ×
              </button>
            )}
          </div>
        </section>

        {/* POKÉDEX */}
        <section>
          <div className="mb-8 flex items-center gap-4">
            <Pokeball className="h-11 w-11" />

            <div>
              <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                Pokédex
              </h1>

              <p className="text-muted mt-1 text-sm font-semibold">
                {loading
                  ? "Chargement du Pokédex..."
                  : `${filteredCatalogue.length} Pokémon trouvés`}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-card bg-paper shadow-card mb-8 p-8 text-center">
              <p className="font-bold">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-control bg-poke-red mt-4 px-5 py-3 text-sm font-bold text-white"
              >
                Réessayer
              </button>
            </div>
          )}

          {!error && !loading && (
            <>
              {filteredCatalogue.length === 0 ? (
                <div className="rounded-card bg-paper shadow-card p-12 text-center">
                  <h2 className="font-display text-xl font-bold">
                    Aucun Pokémon trouvé
                  </h2>

                  <p className="text-muted mt-2 text-sm">
                    Essaie une autre recherche.
                  </p>
                </div>
              ) : (
                <>
                  {/* GRILLE AVEC ANIMATION AU SCROLL */}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {pokemon.map((item) => (
                      <RandomUser
                        key={item.id}
                        user={item}
                        onSelect={setSelected}
                      />
                    ))}
                  </div>

                  {/* CHARGEMENT INFINI */}
                  {hasMore && (
                    <div
                      ref={observerRef}
                      className="flex min-h-28 items-center justify-center py-10"
                    >
                      {pokemonLoading && (
                        <div className="flex items-center gap-3">
                          <Pokeball
                            className="h-7 w-7"
                            animated={!reduceMotion}
                          />

                          <span className="text-muted text-sm font-semibold">
                            Chargement des Pokémon...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {!hasMore && !pokemonLoading && (
                    <p className="text-muted py-12 text-center text-sm font-semibold">
                      Tous les Pokémon ont été affichés.
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {loading && (
            <div className="flex justify-center py-20">
              <Pokeball className="h-12 w-12" animated={!reduceMotion} />
            </div>
          )}
        </section>
      </div>

      {/* FICHE DÉTAILLÉE */}
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
                reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
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

                  <img
                    src={getPokemonArtwork(selected)}
                    alt={formatPokemonName(selected.name)}
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
                      {selected.stats.map((item) => (
                        <div key={item.stat.name}>
                          <div className="mb-2 flex items-center justify-between text-xs font-extrabold">
                            <span>
                              {STATS[item.stat.name] ||
                                formatPokemonName(item.stat.name)}
                            </span>

                            <span>{item.base_stat}</span>
                          </div>

                          <div className="bg-soft h-2.5 overflow-hidden rounded-full">
                            <div
                              className="bg-poke-blue h-full rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (item.base_stat / 255) * 100,
                                )}%`,
                              }}
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
