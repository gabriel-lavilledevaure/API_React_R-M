function RandomUser({ user }) {
  return (
    <article className="w-full overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="h-24 bg-gray-900"></div>

      <div className="flex flex-col items-center px-6 pb-8">
        <img
          className="-mt-12 h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
          src={user.picture.large}
          alt={`${user.name.first} ${user.name.last}`}
        />

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {user.name.first} {user.name.last}
        </h1>

        <p className="mt-1 text-sm text-gray-500">{user.location.country}</p>

        <ul className="mt-6 w-full space-y-3">
          <li className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <span className="text-xl">✉️</span>

            <p className="min-w-0 text-sm break-all text-gray-700">
              {user.email}
            </p>
          </li>

          <li className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <span className="text-xl">📞</span>

            <p className="text-sm text-gray-700">{user.phone}</p>
          </li>

          <li className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <span className="text-xl">📍</span>

            <p className="text-sm text-gray-700">{user.location.city}</p>
          </li>
        </ul>
      </div>
    </article>
  );
}

export default RandomUser;
