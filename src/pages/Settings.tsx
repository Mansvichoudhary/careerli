import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  User,
  Shield,
  Eye,
  Bell,
  Link as LinkIcon,
  Code2,
  Linkedin,
  Globe,
  Upload,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

const settingsNav = [
  { to: "/settings", icon: User, label: "My Profile", exact: true },
  { to: "/settings/security", icon: Shield, label: "Account Security" },
  { to: "/settings/privacy", icon: Eye, label: "Privacy & Visibility" },
  { to: "/settings/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings/integrations", icon: LinkIcon, label: "Integrations" },
];

const Settings = () => {
  const location = useLocation();
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Chen");
  const [headline, setHeadline] = useState("Computer Science");
  const [university, setUniversity] = useState("Stanford University");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("https://github.com/username");
  const [linkedin, setLinkedin] = useState("https://linkedin.com/in/username");
  const [website, setWebsite] = useState("https://www.yourportfolio.com");

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-6">
        {/* Settings Navigation */}
        <aside className="w-64 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <h2 className="font-bold text-lg text-foreground mb-1">Settings</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your account preferences
            </p>

            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </motion.div>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h3 className="text-xl font-semibold text-foreground mb-1">
              My Profile
            </h3>
            <p className="text-muted-foreground mb-6">
              Manage your personal information and portfolio details visible to
              recruiters and peers.
            </p>

            {/* Avatar Section */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
              <UserAvatar name="Alex Chen" size="xl" />
              <div>
                <h4 className="font-semibold text-foreground">Alex Chen</h4>
                <p className="text-sm text-muted-foreground">
                  Computer Science, Junior Year
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload New Photo
                  </Button>
                  <Button size="sm" variant="outline">
                    Remove Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <h4 className="font-semibold text-foreground">
                Personal Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline / Major</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      🎓
                    </span>
                    <Input
                      id="university"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your projects and interests..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/300 characters
                </p>
              </div>
            </div>
          </motion.div>

          {/* Portfolio & Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h4 className="font-semibold text-foreground mb-4">
              Portfolio & Links
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile</Label>
                <div className="relative">
                  <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="github"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-destructive/30 p-6"
          >
            <h4 className="font-semibold text-destructive mb-2">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
