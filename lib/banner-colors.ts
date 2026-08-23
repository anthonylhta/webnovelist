const BANNER_OPTIONS = [
  {
    name: "default",
    gradient: "from-yellow-900/40 via-amber-700/25 to-yellow-950/40",
  },
  {
    name: "blue",
    gradient: "from-blue-800/60 via-blue-600/40 to-indigo-900/60",
  },
  {
    name: "purple",
    gradient: "from-purple-800/60 via-violet-600/40 to-purple-900/60",
  },
  {
    name: "emerald",
    gradient: "from-emerald-800/50 via-teal-600/30 to-emerald-900/50",
  },
  {
    name: "rose",
    gradient: "from-rose-800/50 via-pink-600/30 to-rose-900/50",
  },
  {
    name: "orange",
    gradient: "from-orange-800/50 via-amber-600/30 to-orange-900/50",
  },
  {
    name: "cyan",
    gradient: "from-cyan-800/50 via-sky-600/30 to-cyan-900/50",
  },
  {
    name: "red",
    gradient: "from-red-800/50 via-red-600/30 to-red-900/50",
  },
  {
    name: "pink",
    gradient: "from-pink-800/50 via-fuchsia-600/30 to-pink-900/50",
  },
  {
    name: "slate",
    gradient: "from-slate-700/50 via-gray-600/30 to-slate-800/50",
  },
];

export { BANNER_OPTIONS };

export function getBannerGradient(color: string | null): string {
  const option = BANNER_OPTIONS.find((o) => o.name === color);
  return option?.gradient || BANNER_OPTIONS[0].gradient;
}