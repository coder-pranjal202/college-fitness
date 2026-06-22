import { Search, Filter, X } from "lucide-react";

export default function EventSearch({ searchTerm, setSearchTerm, sportFilter, setSportFilter, dateFilter, setDateFilter, sports, showFilters, setShowFilters }) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search events by title, sport, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/10 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-3 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition border ${
            showFilters
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-white/10 text-gray-300 border-gray-600 hover:bg-white/20"
          }`}
        >
          <Filter size={16} />
          Filters
        </button>

        {showFilters && (
          <div className="flex flex-wrap gap-3 items-center">
            {/* Sport Filter */}
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="bg-white/10 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
            >
              <option value="" className="bg-slate-900">All Sports</option>
              {sports.map((sport) => (
                <option key={sport} value={sport} className="bg-slate-900">{sport}</option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white/10 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
            />

            {/* Clear Filters */}
            {(sportFilter || dateFilter) && (
              <button
                onClick={() => { setSportFilter(""); setDateFilter(""); }}
                className="text-red-400 hover:text-red-300 text-sm font-semibold transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}