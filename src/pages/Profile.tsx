import { useState } from "react";
import { motion } from "framer-motion";
import {
  Folder,
  Users,
  MessageSquare,
  Code2,
  Linkedin,
  Link as LinkIcon,
  Star,
  GitFork,
  ExternalLink,
  Plus,
  Calendar,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import UserAvatar from "@/components/Avatar";

const stats = [
  { label: "Projects", value: "12", icon: Folder },
  { label: "Collaborators", value: "8", icon: Users },
  { label: "Questions", value: "45", icon: MessageSquare },
];

const skills = ["React", "Python", "AWS", "Docker", "TypeScript", "Node.js"];

const projects = [
  {
    title: "Smart Home IoT Dashboard",
    dates: "Sep 2023 - Present",
    description:
      "A centralized dashboard for managing smart home devices using MQTT protocol. Features real-time energy consumption tracking and automated scheduling.",
    tags: ["React", "Node.js", "MQTT"],
    stats: { stars: 12, forks: 4 },
    isActive: true,
    latestUpdate: "Implemented OAuth2 authentication for secure device access.",
    updatedAgo: "2 days ago",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=60",
  },
  {
    title: "AlgoVisualizer",
    dates: "Jan 2023 - Jun 2023",
    description:
      "Interactive platform to visualize common sorting and pathfinding algorithms in real-time. Helped 500+ students understand complex DS concepts.",
    tags: ["D3.js", "TypeScript"],
    stats: { views: "1.2k" },
    isActive: false,
    hasDemo: true,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=60",
  },
  {
    title: "Personal Portfolio V1",
    dates: "Dec 2022",
    description:
      "Designed and deployed my first personal website using HTML/CSS and vanilla JS.",
    tags: ["HTML5", "CSS3"],
    isActive: false,
  },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Left Column - Profile Info */}
        <aside className="w-80 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 text-center"
          >
            <div className="relative inline-block mb-4">
              <UserAvatar name="Alex Chen" size="xl" />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Alex Chen</h2>
            <p className="text-muted-foreground">Computer Science @ Stanford '25</p>
            <Tag className="mt-3 bg-success-soft text-success">
              <span className="w-2 h-2 rounded-full bg-success mr-1.5" />
              Open to Work
            </Tag>

            <div className="flex gap-2 mt-4">
              <Button className="flex-1">Connect</Button>
              <Button variant="outline" className="flex-1">
                Message
              </Button>
            </div>

            <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-border">
              <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
                <Code2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">GitHub</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
                <Linkedin className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">LinkedIn</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Copy Link</span>
              </Button>
            </div>
          </motion.div>

          {/* About Me */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-3">About Me</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full-stack developer passionate about building scalable web
              applications. Currently exploring AI/ML integration in consumer apps.
              I love open source contribution and hackathons.
            </p>
          </motion.div>

          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-3">Top Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Tag key={skill} variant="default">
                  {skill}
                </Tag>
              ))}
            </div>
          </motion.div>
        </aside>

        {/* Right Column - Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <stat.icon className="h-4 w-4" />
                  <span className="text-sm">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Project Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Project Timeline
              </h3>
              <Button variant="link" className="text-primary p-0 h-auto">
                View All
              </Button>
            </div>

            <div className="space-y-6">
              {projects.map((project, index) => (
                <div key={project.title} className="relative pl-6">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 ${
                      project.isActive
                        ? "bg-primary border-primary"
                        : "bg-muted border-border"
                    }`}
                  />
                  {/* Timeline line */}
                  {index !== projects.length - 1 && (
                    <div className="absolute left-[5px] top-5 w-0.5 h-[calc(100%+12px)] bg-border" />
                  )}

                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">
                          {project.title}
                        </h4>
                        <Tag variant="default" className="text-xs">
                          {project.dates}
                        </Tag>
                      </div>

                      <div className="flex gap-4 mb-3">
                        {project.image && (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-24 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags.map((tag) => (
                          <Tag key={tag} variant="react">
                            {tag}
                          </Tag>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.stats?.stars && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {project.stats.stars} Stars
                          </span>
                        )}
                        {project.stats?.forks && (
                          <span className="flex items-center gap-1">
                            <GitFork className="h-4 w-4" />
                            {project.stats.forks} Forks
                          </span>
                        )}
                        {project.stats?.views && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {project.stats.views} Views
                          </span>
                        )}
                        {project.hasDemo && (
                          <Button
                            variant="link"
                            className="text-primary p-0 h-auto text-sm gap-1"
                          >
                            View Live Demo
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {project.latestUpdate && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-success-soft rounded-lg text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Latest Update:
                            </span>{" "}
                            {project.latestUpdate}
                          </span>
                          <span className="text-muted-foreground ml-auto">
                            {project.updatedAgo}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="link" className="text-primary gap-2 p-0 h-auto mt-4">
              <Plus className="h-4 w-4" />
              Add older project
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
