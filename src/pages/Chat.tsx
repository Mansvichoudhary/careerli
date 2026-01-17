import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Settings,
  Hash,
  Volume2,
  Users,
  Send,
  Smile,
  AtSign,
  Code2,
  Copy,
  Info,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserAvatar from "@/components/Avatar";
import { cn } from "@/lib/utils";

const channels = [
  { id: "web-dev", name: "web-dev", type: "text" },
  { id: "python-help", name: "python-help", type: "text", active: true },
  { id: "showcase", name: "showcase", type: "text" },
  { id: "internships", name: "internships", type: "text" },
  { id: "random", name: "random", type: "text" },
];

const directMessages = [
  { name: "Sarah Jones", online: true },
  { name: "David Kim", online: false },
];

const pinnedItems = [
  { title: "Python Style Guide", description: "PEP 8 standards", icon: "📄" },
  { title: "Common Pitfalls", description: "Read before posting", icon: "⚠️" },
];

const onlineMembers = [
  { name: "James Wilson", role: "Mod" },
  { name: "Sarah Jones" },
  { name: "Michael Chen" },
  { name: "Emily Davis" },
];

const messages = [
  {
    id: 1,
    author: "Sarah Jones",
    time: "10:46 AM",
    content: "Make sure you `import heapq` first, that's usually the tricky part with the default libs.",
    isMe: false,
    hasCode: true,
  },
  {
    id: 2,
    author: "Alex Chen",
    time: "10:48 AM",
    content: "Ah right! I was passing just the node object without the cost tuple. Thanks Sarah! 🙏",
    isMe: true,
    reactions: [{ emoji: "🔥", count: 1 }],
  },
];

const codeSnippet = `import heapq

def dijkstra(graph, start):
    # Priority queue to store (distance, node)
    queue = [(0, start)]
    distances = {node: float('inf') for node in graph}
    distances[start] = 0

    while queue:
        current_distance, current_node = heapq.heappop(queue)

        if current_distance > distances[current_node]:
            continue

        # ... neighbor exploration logic`;

const Chat = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6 -mt-6">
      {/* Channels Sidebar */}
      <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="font-bold text-sidebar-foreground">Channels</h2>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Channels
              </span>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {channels.map((channel) => (
              <button
                key={channel.id}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                  channel.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Hash className="h-4 w-4" />
                {channel.name}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Direct Messages
              </span>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {directMessages.map((dm) => (
              <button
                key={dm.name}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <UserAvatar name={dm.name} size="sm" showOnline={dm.online} />
                <span className="truncate">{dm.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* User Footer */}
        <div className="p-3 border-t border-sidebar-border flex items-center gap-2">
          <UserAvatar name="Alex Chen" size="sm" showOnline />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              Alex Chen
            </p>
            <p className="text-xs text-muted-foreground truncate">CS Student</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Channel Header */}
        <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">python-help</h3>
              <p className="text-xs text-muted-foreground">
                Community-driven help for Python projects
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {onlineMembers.slice(0, 3).map((m) => (
                <UserAvatar key={m.name} name={m.name} size="sm" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">+42</span>
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {/* Context Message */}
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              objects without a comparison method. You should store tuples like
              `(cost, node)`. Here is a quick snippet:
            </p>
          </div>

          {/* Code Block */}
          <div className="mb-4 rounded-lg overflow-hidden border border-border bg-code">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-sm text-gray-400">dijkstra.py</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-gray-400 hover:text-gray-200"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="p-4 text-sm font-mono text-code-foreground overflow-x-auto">
              {codeSnippet}
            </pre>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.isMe && "flex-row-reverse")}
              >
                <UserAvatar name={msg.author} size="md" />
                <div
                  className={cn(
                    "max-w-lg",
                    msg.isMe && "flex flex-col items-end"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.isMe && (
                      <span className="font-semibold text-sm text-foreground">
                        {msg.author}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {msg.time}
                    </span>
                    {msg.isMe && (
                      <span className="font-semibold text-sm text-foreground">
                        {msg.author}
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2.5",
                      msg.isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm">
                      {msg.content.split("`").map((part, i) =>
                        i % 2 === 1 ? (
                          <code
                            key={i}
                            className={cn(
                              "px-1.5 py-0.5 rounded text-xs font-mono",
                              msg.isMe
                                ? "bg-white/20"
                                : "bg-background text-primary"
                            )}
                          >
                            {part}
                          </code>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  </div>
                  {msg.reactions && (
                    <div className="flex gap-1 mt-1">
                      {msg.reactions.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-muted rounded-full text-xs"
                        >
                          {r.emoji} {r.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="relative">
            <Input
              placeholder="Message #python-help..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-32"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Code2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Smile className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <AtSign className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button size="sm" className="ml-2">
                Send <Send className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <span className="font-medium">Tip:</span> You can use Markdown for
            styles and code blocks.
          </p>
        </div>
      </div>

      {/* Right Sidebar - Channel Info */}
      <div className="w-72 bg-card border-l border-border p-4 hidden 2xl:block">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Info className="h-4 w-4" />
          About Channel
        </h4>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <h5 className="font-medium text-sm text-foreground mb-1 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Description
            </h5>
            <p className="text-xs text-muted-foreground">
              A place to ask questions about Python syntax, libraries (Pandas,
              NumPy), and debugging scripts.
            </p>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created Aug 12, 2023
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            1,240 Members
          </div>
        </div>

        {/* Pinned */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-foreground">Pinned</h5>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              3
            </span>
          </div>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Online Members */}
        <div className="mt-6">
          <h5 className="font-semibold text-foreground mb-3">
            Online - {onlineMembers.length}
          </h5>
          <div className="space-y-2">
            {onlineMembers.map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar name={member.name} size="sm" showOnline />
                  <span className="text-sm text-foreground">{member.name}</span>
                </div>
                {member.role && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                    {member.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
