import { Award, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";

export interface WidgetProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  university?: string | null;
  role: "student" | "mentor";
  skills?: string[] | null;
}

interface FeaturedMentorsProps {
  mentors: WidgetProfile[];
  followingIds: Set<string>;
  onFollow: (userId: string) => void;
  onRequestGuidance?: (userId: string) => void;
}

const FeaturedMentors = ({ mentors, followingIds, onFollow, onRequestGuidance }: FeaturedMentorsProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-amber-500" />
        Featured Mentors
      </h3>
      <div className="space-y-3">
        {mentors.slice(0, 4).map((mentor) => {
          const isFollowing = followingIds.has(mentor.id);
          return (
            <div key={mentor.id} className="rounded-lg border border-transparent p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/5">
              <div className="flex items-start gap-3">
                <UserAvatar name={mentor.full_name || "Mentor"} src={mentor.avatar_url || undefined} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{mentor.full_name || "Mentor"}</p>
                  <p className="truncate text-xs text-muted-foreground">{mentor.university || "Guidance Expert"}</p>
                  <RoleBadge role={mentor.role} size="sm" className="mt-1" />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant={isFollowing ? "outline" : "default"} size="sm" className="flex-1 gap-1" onClick={() => onFollow(mentor.id)}>
                  <UserPlus className="h-3 w-3" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onRequestGuidance?.(mentor.id)}>
                  Request Guidance
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedMentors;
