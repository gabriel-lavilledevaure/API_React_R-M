import { useEffect, useState } from "react";

// useFetch(url) envoie une requête à l'adresse url
// et renvoie { data, error, isLoading, refetch }
function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: true,
  });
  const [reloadKey, setReloadKey] = useState(0); // augmenter ce nombre relance la requête

  // useEffect : « une fois le composant affiché, envoie la requête ».
  // La requête repart quand url ou reloadKey change.
  useEffect(() => {
    const controller = new AbortController(); // permet d'annuler la requête

    async function load() {
      setState({ data: null, error: null, isLoading: true });
      try {
        const response = await fetch(url, { signal: controller.signal });
        // fetch ne signale pas les erreurs 404 ou 500 : on les détecte ici
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        const data = await response.json();
        setState({ data, error: null, isLoading: false });
      } catch (error) {
        if (error.name === "AbortError") return; // annulation voulue : pas une vraie erreur
        setState({ data: null, error, isLoading: false });
      }
    }
    load();

    return () => controller.abort(); // nettoyage : annule la requête en cours
  }, [url, reloadKey]);

  const refetch = () => setReloadKey((k) => k + 1);

  return { ...state, refetch };
}

export default useFetch;
