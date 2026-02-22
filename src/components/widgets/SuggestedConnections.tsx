import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/Avatar";

interface SuggestedConnection {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  university: string | null;
  skills: string[];
}

interface SuggestedConnectionsProps {
  users: SuggestedConnection[];
  connectedIds: Set<string>;
  onConnect: (userId: string) => void;
}

const SuggestedConnections = ({ users, connectedIds, onConnect }: SuggestedConnectionsProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <Users className="h-4 w-4 text-primary" />
        Suggested Connections
      </h3>
      <div className="space-y-3">
        {users.slice(0, 5).map((user) => (
          <div key={user.id} className="rounded-lg border border-transparent p-2 transition-colors hover:bg-primary/5">
            <div className="flex items-start gap-2">
              <UserAvatar name={user.full_name || "Student"} src={user.avatar_url || undefined} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.full_name || "Student"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.university || "Careerli Member"}</p>
                <p className="truncate text-xs text-primary">{user.skills.slice(0, 2).join(" • ")}</p>
              </div>
              <Button size="sm" variant={connectedIds.has(user.id) ? "outline" : "default"} onClick={() => onConnect(user.id)}>
                {connectedIds.has(user.id) ? "Connected" : "Connect"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedConnections;
