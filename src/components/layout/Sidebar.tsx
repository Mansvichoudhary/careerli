import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  Folder,
  Bookmark,
  Users,
  Plus,
  MessageSquare,
  User,
  Settings,
  Code2,
} from "lucide-react";
import Logo from "@/components/Logo";
import UserAvatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <NavLink
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const mainNav = [
    { to: "/home", icon: <Home className="h-5 w-5" />, label: "Home Feed" },
    { to: "/explore", icon: <Compass className="h-5 w-5" />, label: "Explore" },
    { to: "/snippets", icon: <Code2 className="h-5 w-5" />, label: "Code Snippets" },
    { to: "/connections", icon: <Users className="h-5 w-5" />, label: "Connections" },
    { to: "/events", icon: <Folder className="h-5 w-5" />, label: "Events" },
    { to: "/notifications", icon: <Bookmark className="h-5 w-5" />, label: "Notifications" },
  ];

  const groups = [
    { name: "Python Enthusiasts", color: "bg-blue-500" },
    { name: "Web Dev Club", color: "bg-green-500" },
  ];

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Logo />
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <UserAvatar name="Alex Chen" showOnline size="md" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-sidebar-foreground truncate">
              Alex Chen
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              Comp Sci. Student
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {mainNav.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            isActive={currentPath === item.to}
          />
        ))}

        {/* Groups Section */}
        <div className="pt-4 mt-4 border-t border-sidebar-border">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            My Groups
          </h3>
          {groups.map((group) => (
            <NavLink
              key={group.name}
              to={`/groups/${group.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${group.color}`} />
              <span className="truncate">{group.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Create Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button className="w-full gap-2" asChild>
          <NavLink to="/create">
            <Plus className="h-4 w-4" />
            New Post
          </NavLink>
        </Button>
      </div>

      {/* Bottom Nav */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavItem
          to="/chat"
          icon={<MessageSquare className="h-5 w-5" />}
          label="Chat"
          isActive={currentPath === "/chat"}
        />
        <NavItem
          to="/profile"
          icon={<User className="h-5 w-5" />}
          label="Profile"
          isActive={currentPath === "/profile"}
        />
        <NavItem
          to="/settings"
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          isActive={currentPath === "/settings"}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
