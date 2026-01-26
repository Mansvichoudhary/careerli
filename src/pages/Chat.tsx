import { useState, useEffect, useRef } from "react";
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
  Mic,
  MicOff,
  Headphones,
  VolumeX,
  PhoneOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserAvatar from "@/components/Avatar";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const {
    channels,
    currentChannel,
    setCurrentChannel,
    messages: chatMessages,
    loading,
    sendMessage,
    createChannel,
  } = useChat();

  const {
    isConnected: isVoiceConnected,
    isMuted,
    isDeafened,
    participants: voiceParticipants,
    currentVoiceChannel,
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
  } = useVoiceChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    await sendMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast({ title: 'Please enter a channel name', variant: 'destructive' });
      return;
    }

    const result = await createChannel(newChannelName.trim(), newChannelDescription.trim());
    if (result) {
      setIsCreateChannelOpen(false);
      setNewChannelName("");
      setNewChannelDescription("");
    }
  };

  const handleJoinVoice = async () => {
    if (currentChannel) {
      await joinVoiceChannel(currentChannel.id);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6 -mt-6">
      {/* Channels Sidebar */}
      <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="font-bold text-sidebar-foreground">Channels</h2>
        </div>

        <ScrollArea className="flex-1 p-2">
          {/* Text Channels */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Text Channels
              </span>
              <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Plus className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="channelName">Channel Name</Label>
                      <Input
                        id="channelName"
                        placeholder="e.g., python-help"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channelDesc">Description (optional)</Label>
                      <Textarea
                        id="channelDesc"
                        placeholder="What is this channel about?"
                        value={newChannelDescription}
                        onChange={(e) => setNewChannelDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateChannel} className="w-full">
                      Create Channel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {channels.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-4">No channels yet. Create one!</p>
            ) : (
              channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setCurrentChannel(channel)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                    currentChannel?.id === channel.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Hash className="h-4 w-4" />
                  {channel.name}
                </button>
              ))
            )}
          </div>

          {/* Voice Channels */}
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Voice Channels
              </span>
            </div>
            
            <button
              onClick={isVoiceConnected ? leaveVoiceChannel : handleJoinVoice}
              disabled={!currentChannel}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                isVoiceConnected
                  ? "bg-success/20 text-success"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Volume2 className="h-4 w-4" />
              General Voice
              {isVoiceConnected && (
                <span className="ml-auto text-xs">{voiceParticipants.length + 1} connected</span>
              )}
            </button>

            {/* Voice Participants */}
            {isVoiceConnected && (
              <div className="pl-4 space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-sm">
                  <UserAvatar 
                    name={profile?.full_name || "You"} 
                    src={profile?.avatar_url || undefined}
                    size="sm" 
                  />
                  <span className="text-foreground truncate">{profile?.full_name || "You"}</span>
                  {isMuted && <MicOff className="h-3 w-3 text-muted-foreground" />}
                </div>
                {voiceParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-2 py-1 text-sm">
                    <UserAvatar name={p.name} src={p.avatar} size="sm" />
                    <span className="text-foreground truncate">{p.name}</span>
                    {p.isMuted && <MicOff className="h-3 w-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Voice Controls (when connected) */}
        {isVoiceConnected && (
          <div className="p-3 border-t border-sidebar-border bg-sidebar-accent">
            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="h-8 w-8"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant={isDeafened ? "destructive" : "secondary"}
                size="icon"
                className="h-8 w-8"
                onClick={toggleDeafen}
              >
                {isDeafened ? <VolumeX className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8 ml-auto"
                onClick={leaveVoiceChannel}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* User Footer */}
        <div className="p-3 border-t border-sidebar-border flex items-center gap-2">
          <UserAvatar 
            name={profile?.full_name || "User"} 
            src={profile?.avatar_url || undefined}
            size="sm" 
            showOnline 
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.role === 'mentor' ? 'Mentor' : 'Student'}
            </p>
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
              <h3 className="font-semibold text-foreground">
                {currentChannel?.name || "Select a channel"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {currentChannel?.description || "No description"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {!currentChannel ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Hash className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Welcome to Chat
              </h3>
              <p className="text-muted-foreground max-w-md">
                Select a channel from the sidebar to start chatting, or create a new one!
              </p>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Hash className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Welcome to #{currentChannel.name}
              </h3>
              <p className="text-muted-foreground max-w-md">
                This is the beginning of the #{currentChannel.name} channel. Send a message to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg, index) => {
                const isMe = msg.user_id === profile?.user_id;
                const showAvatar = index === 0 || 
                  chatMessages[index - 1].user_id !== msg.user_id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3", isMe && "flex-row-reverse")}
                  >
                    {showAvatar ? (
                      <UserAvatar 
                        name={msg.profiles?.full_name || "User"} 
                        src={msg.profiles?.avatar_url || undefined}
                        size="md" 
                      />
                    ) : (
                      <div className="w-10" />
                    )}
                    <div className={cn("max-w-lg", isMe && "flex flex-col items-end")}>
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1">
                          {!isMe && (
                            <span className="font-semibold text-sm text-foreground">
                              {msg.profiles?.full_name || "User"}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTime(msg.created_at)}
                          </span>
                          {isMe && (
                            <span className="font-semibold text-sm text-foreground">
                              You
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2.5",
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content.split("`").map((part, i) =>
                            i % 2 === 1 ? (
                              <code
                                key={i}
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-xs font-mono",
                                  isMe
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
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        {currentChannel && (
          <div className="p-4 border-t border-border bg-card">
            <div className="relative">
              <Input
                placeholder={`Message #${currentChannel.name}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
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
                <Button size="sm" className="ml-2" onClick={handleSendMessage}>
                  Send <Send className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-medium">Tip:</span> You can use backticks for inline code.
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Channel Info */}
      {currentChannel && (
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
                {currentChannel.description || "No description provided."}
              </p>
            </div>

            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created {getTimeAgo(currentChannel.created_at)}
            </div>
          </div>

          {/* Voice Chat Info */}
          {isVoiceConnected && (
            <div className="mt-6 p-3 bg-success/10 rounded-lg border border-success/20">
              <h5 className="font-medium text-sm text-success mb-2 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Voice Connected
              </h5>
              <p className="text-xs text-muted-foreground">
                {voiceParticipants.length + 1} participant(s) in voice chat
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>{profile?.full_name || "You"}</span>
                  {isMuted && <MicOff className="h-3 w-3" />}
                </div>
                {voiceParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span>{p.name}</span>
                    {p.isMuted && <MicOff className="h-3 w-3" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;