import { TrendingUp } from "lucide-react";

export interface TrendingTechItem {
  name: string;
  abbr: string;
  change: string;
  postCount: number;
  color: string;
}

interface TrendingTechProps {
  items: TrendingTechItem[];
  onSelect: (tech: string) => void;
}

const TrendingTech = ({ items, onSelect }: TrendingTechProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <TrendingUp className="h-4 w-4" />
        Trending Technologies
      </h3>
      <div className="space-y-3">
        {items.map((tech) => (
          <button
            type="button"
            key={tech.name}
            className="w-full rounded-lg p-2 text-left transition-all duration-200 hover:bg-primary/5"
            onClick={() => onSelect(tech.name)}
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white ${tech.color}`}>
                  {tech.abbr}
                </div>
                <span className="text-sm font-medium text-foreground">{tech.name}</span>
              </div>
              <span className="text-xs font-medium text-emerald-500">{tech.change}</span>
            </div>
            <p className="ml-8 text-xs text-muted-foreground">{tech.postCount} posts</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingTech;
