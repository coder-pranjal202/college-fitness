export function CardSkeleton() {
  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-6 shadow-lg animate-pulse">
      <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
      <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
      <div className="h-3 bg-white/10 rounded w-full mb-2" />
      <div className="h-3 bg-white/10 rounded w-5/6 mb-4" />
      <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
      <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
      <div className="h-3 bg-white/10 rounded w-1/3 mb-4" />
      <div className="h-10 bg-white/10 rounded-xl w-full mt-4" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/10 border border-white/10 rounded-xl p-4">
          <div className="h-5 bg-white/10 rounded w-2/3 mb-3" />
          <div className="h-3 bg-white/10 rounded w-full mb-2" />
          <div className="h-3 bg-white/10 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-white/10 rounded-full" />
        <div className="space-y-2">
          <div className="h-6 bg-white/10 rounded w-40" />
          <div className="h-4 bg-white/10 rounded w-24" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-20 bg-white/10 rounded-xl" />
        <div className="h-20 bg-white/10 rounded-xl" />
        <div className="h-20 bg-white/10 rounded-xl" />
        <div className="h-20 bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}