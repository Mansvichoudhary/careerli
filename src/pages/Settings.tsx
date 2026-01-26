import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  LogOut,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import UserAvatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const settingsNav = [
  { to: "/settings", icon: User, label: "My Profile", exact: true },
  { to: "/settings/security", icon: Shield, label: "Account Security" },
  { to: "/settings/privacy", icon: Eye, label: "Privacy & Visibility" },
  { to: "/settings/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings/integrations", icon: LinkIcon, label: "Integrations" },
];

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [location_, setLocation_] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  
  // Privacy settings
  const [showEmail, setShowEmail] = useState(false);
  const [showRole, setShowRole] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  
  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [mentionNotifs, setMentionNotifs] = useState(true);
  const [followNotifs, setFollowNotifs] = useState(true);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setUniversity(profile.university || "");
      setLocation_(profile.location || "");
      setGithub(profile.github_url || "");
      setLinkedin(profile.linkedin_url || "");
      setWebsite(profile.portfolio_url || "");
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          bio: bio,
          university: university,
          location: location_,
          github_url: github,
          linkedin_url: linkedin,
          portfolio_url: website,
          skills: skills,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast({ title: "Profile saved!", description: "Your changes have been saved successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const activeSection = location.pathname.split('/settings/')[1] || 'profile';

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

            {/* Logout Button */}
            <div className="mt-6 pt-6 border-t border-border">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </motion.div>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Profile Section */}
          {(activeSection === 'profile' || location.pathname === '/settings') && (
            <>
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
                  <UserAvatar name={fullName || "User"} src={profile?.avatar_url || undefined} size="xl" />
                  <div>
                    <h4 className="font-semibold text-foreground">{fullName || "Your Name"}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">{university || "Add your university"}</p>
                      {profile?.role && <RoleBadge role={profile.role} size="sm" />}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="gap-2" variant="outline">
                        <Upload className="h-4 w-4" />
                        Upload New Photo
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
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University / Company</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          🎓
                        </span>
                        <Input
                          id="university"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="pl-10"
                          placeholder="Your institution"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location_}
                        onChange={(e) => setLocation_(e.target.value)}
                        placeholder="City, Country"
                      />
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

                  {/* Skills */}
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-soft text-primary text-sm rounded-full"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Type a skill and press Enter"
                    />
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
                        placeholder="https://github.com/username"
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
                        placeholder="https://linkedin.com/in/username"
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
                        placeholder="https://yoursite.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                  <Button variant="outline" onClick={() => refreshProfile()}>Cancel</Button>
                  <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </motion.div>
            </>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-1">Privacy & Visibility</h3>
              <p className="text-muted-foreground mb-6">Control who can see your information.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Public Profile</p>
                    <p className="text-sm text-muted-foreground">Allow anyone to view your profile</p>
                  </div>
                  <Switch checked={profilePublic} onCheckedChange={setProfilePublic} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Show Role Badge</p>
                    <p className="text-sm text-muted-foreground">Display Student/Mentor badge on your profile</p>
                  </div>
                  <Switch checked={showRole} onCheckedChange={setShowRole} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Show Email</p>
                    <p className="text-sm text-muted-foreground">Make your email visible to others</p>
                  </div>
                  <Switch checked={showEmail} onCheckedChange={setShowEmail} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-1">Notifications</h3>
              <p className="text-muted-foreground mb-6">Choose what notifications you receive.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified in your browser</p>
                  </div>
                  <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Mentions</p>
                    <p className="text-sm text-muted-foreground">Notify when someone mentions you</p>
                  </div>
                  <Switch checked={mentionNotifs} onCheckedChange={setMentionNotifs} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">New Followers</p>
                    <p className="text-sm text-muted-foreground">Notify when someone follows you</p>
                  </div>
                  <Switch checked={followNotifs} onCheckedChange={setFollowNotifs} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-1">Account Security</h3>
              <p className="text-muted-foreground mb-6">Manage your account security settings.</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
              </div>
            </motion.div>
          )}

          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-1">Integrations</h3>
              <p className="text-muted-foreground mb-6">Connect external services.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Code2 className="h-6 w-6" />
                    <div>
                      <p className="font-medium text-foreground">GitHub</p>
                      <p className="text-sm text-muted-foreground">Connect to import projects</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-6 w-6" />
                    <div>
                      <p className="font-medium text-foreground">LinkedIn</p>
                      <p className="text-sm text-muted-foreground">Import work experience</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Danger Zone - Always visible */}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
