import { useState } from "react";
import useFetch from "./hook/useFetch";
import RandomUser from "./components/RandomUser";

function App() {
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [page, setPage] = useState(1);

  const url = `https://randomuser.me/api/?results=6&page=${page}&seed=react&gender=${gender}&nat=${nationality}`;

  const { data, error, isLoading } = useFetch(url);

  const users = data?.results || [];

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Random Users</h1>

          <p className="mt-3 text-gray-500">
            Découvrez des profils générés aléatoirement.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-800 shadow-sm outline-none"
          >
            <option value="">Tous les genres</option>
            <option value="male">Hommes</option>
            <option value="female">Femmes</option>
          </select>

          <select
            value={nationality}
            onChange={(e) => {
              setNationality(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-800 shadow-sm outline-none"
          >
            <option value="">Toutes les nationalités</option>
            <option value="fr">France</option>
            <option value="us">États-Unis</option>
            <option value="gb">Royaume-Uni</option>
            <option value="es">Espagne</option>
            <option value="de">Allemagne</option>
            <option value="br">Brésil</option>
          </select>
        </div>

        {isLoading && (
          <p className="py-12 text-center text-gray-500">
            Chargement des utilisateurs...
          </p>
        )}

        {error && (
          <p className="py-12 text-center text-red-500">
            Erreur : {error.message}
          </p>
        )}

        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <RandomUser key={user.login.uuid} user={user} />
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:opacity-30"
              >
                Précédent
              </button>

              <span className="font-semibold text-gray-700">Page {page}</span>

              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-700"
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default App;
