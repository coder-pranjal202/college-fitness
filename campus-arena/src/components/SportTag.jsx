import { getSportColor } from "../utils/constants";

export default function SportTag({ sport, size = "sm" }) {
  const colors = getSportColor(sport);
  const sizeClasses = size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";

  return (
    <span className={`inline-block rounded-full font-semibold ${sizeClasses} ${colors.bg} ${colors.text} ${colors.border} border`}>
      {sport || "General"}
    </span>
  );
}