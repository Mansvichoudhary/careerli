import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  showOnline?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const onlineDotSizes = {
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const UserAvatar = ({
  src,
  name,
  size = "md",
  showOnline = false,
  className,
}: AvatarProps) => {
  return (
    <div className={cn("relative inline-flex", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-full object-cover",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-medium text-white",
            sizeClasses[size],
            getColorFromName(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {showOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-green-500 border-background",
            onlineDotSizes[size]
          )}
        />
      )}
    </div>
  );
};

export default UserAvatar;
