
export default function Loading() {
  return (
    <div className="p-4">
      <div className="mb-4 h-8 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 h-32 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
