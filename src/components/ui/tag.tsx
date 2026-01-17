import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "python" | "react" | "nodejs" | "rust" | "iot" | "ai";
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantStyles = {
  default: "bg-primary-soft text-primary",
  python: "bg-blue-100 text-blue-700",
  react: "bg-cyan-100 text-cyan-700",
  nodejs: "bg-green-100 text-green-700",
  rust: "bg-orange-100 text-orange-700",
  iot: "bg-violet-100 text-violet-700",
  ai: "bg-pink-100 text-pink-700",
};

export const Tag = ({
  children,
  variant = "default",
  removable = false,
  onRemove,
  className,
}: TagProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

export const getTagVariant = (tag: string): TagProps["variant"] => {
  const tagLower = tag.toLowerCase();
  if (tagLower.includes("python")) return "python";
  if (tagLower.includes("react") || tagLower.includes("javascript") || tagLower.includes("node")) return "nodejs";
  if (tagLower.includes("rust")) return "rust";
  if (tagLower.includes("iot") || tagLower.includes("arduino") || tagLower.includes("hardware")) return "iot";
  if (tagLower.includes("ai") || tagLower.includes("ml") || tagLower.includes("machine")) return "ai";
  return "default";
};
