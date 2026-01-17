import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, TrendingUp, Globe, Cpu, Brain, Server, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import UserAvatar from "@/components/Avatar";
import { Tag } from "@/components/ui/tag";

const categories = [
  { id: "all", label: "All Posts", icon: Globe },
  { id: "webdev", label: "Web Dev", icon: Globe },
  { id: "iot", label: "IoT & Hardware", icon: Cpu },
  { id: "aiml", label: "AI/ML", icon: Brain },
  { id: "devops", label: "DevOps", icon: Server },
];

const trendingTech = [
  { name: "Python", abbr: "Py", change: "+24%", color: "bg-blue-500" },
  { name: "Rust", abbr: "Rs", change: "+18%", color: "bg-orange-500" },
  { name: "React", abbr: "Re", change: "+12%", color: "bg-cyan-500" },
];

const studentsToFollow = [
  { name: "Marcus L.", field: "Machine Learning" },
  { name: "Jessica T.", field: "UX Design" },
  { name: "Raj P.", field: "Backend Dev" },
];

const posts = [
  {
    author: { name: "Sarah Jenkins", field: "Electrical Engineering" },
    timeAgo: "2h ago",
    title: "Smart Garden Monitor MVP 🌱",
    content:
      "Finally got the moisture sensor calibrated correctly on the ESP32! The data is now streaming to my local dashboard via MQTT. Next step: building the solar charging circuit. Any tips on battery management for low-power IoT?",
    tags: ["IoT", "C++", "Arduino"],
    likes: 24,
    comments: 8,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
  },
  {
    author: { name: "David Park", field: "Computer Science" },
    timeAgo: "4h ago",
    title: "Need help optimizing this sorting algo 🤔",
    content:
      "I'm trying to implement a custom quicksort for my algorithms class, but it's hitting O(n^2) on already sorted arrays. I think my pivot selection is off. Can anyone take a look?",
    tags: ["Python", "Algorithms", "HelpWanted"],
    likes: 12,
    comments: 15,
    isCodePost: true,
    code: {
      content: `def partition(arr, low, high):
    pivot = arr[high]  # Is this the issue?
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1`,
      language: "python",
      filename: "quicksort.py",
    },
  },
  {
    author: { name: "Emma Chen", field: "Software Engineering" },
    timeAgo: "6h ago",
    title: "Just deployed my first full-stack app! 🚀",
    content:
      "After 3 months of learning React and Node.js, I finally deployed my task management app. It's not perfect, but it works! Would love feedback on the code structure.",
    tags: ["React", "Node.js", "Deployment"],
    likes: 45,
    comments: 22,
  },
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workshop Feed</h1>
              <p className="text-muted-foreground">
                See what your peers are building today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                className="gap-2 whitespace-nowrap"
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard {...post} />
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="gap-2">
              Load More
            </Button>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 hidden xl:block space-y-6">
          {/* Trending Tech */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Trending Tech</h3>
              <Button variant="link" className="text-primary p-0 h-auto text-sm">
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {trendingTech.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${tech.color} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {tech.abbr}
                    </div>
                    <span className="font-medium text-foreground">{tech.name}</span>
                  </div>
                  <span className="text-sm text-success font-medium">
                    {tech.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Students to Follow */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Students to Follow</h3>
            </div>
            <div className="space-y-4">
              {studentsToFollow.map((student) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={student.name} size="sm" />
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.field}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="link" className="text-primary p-0 h-auto text-sm mt-3">
              See More Suggestions
            </Button>
          </div>

          {/* Event Banner */}
          <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-xl p-5 text-white">
            <Tag className="bg-white/20 text-white border-0 mb-3">
              UPCOMING EVENT
            </Tag>
            <h3 className="text-lg font-bold mb-2">Campus Hackathon 2024</h3>
            <p className="text-sm text-white/80 mb-4">
              Join 500+ students building the future. Register by Friday!
            </p>
            <Button
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 gap-2"
            >
              Register Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
