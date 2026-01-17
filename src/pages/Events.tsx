import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Video, ExternalLink, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_online: boolean;
  max_participants: number | null;
  created_by: string | null;
  created_at: string;
  participant_count?: number;
  is_registered?: boolean;
}

const eventTypeColors: Record<string, string> = {
  workshop: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  hackathon: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  webinar: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  meetup: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  competition: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "registered">("upcoming");
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [filter, user]);

  const fetchEvents = async () => {
    setLoading(true);
    
    let query = supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (filter === "upcoming") {
      query = query.gte('start_date', new Date().toISOString());
    }

    const { data, error } = await query;

    if (!error && data) {
      // Fetch participant counts and registration status
      const eventsWithDetails = await Promise.all(
        data.map(async (event) => {
          const { count } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          let isRegistered = false;
          if (user) {
            const { data: registration } = await supabase
              .from('event_participants')
              .select('id')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .maybeSingle();
            isRegistered = !!registration;
          }

          return {
            ...event,
            participant_count: count || 0,
            is_registered: isRegistered
          };
        })
      );

      if (filter === "registered") {
        setEvents(eventsWithDetails.filter(e => e.is_registered));
      } else {
        setEvents(eventsWithDetails);
      }
    }

    setLoading(false);
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.is_registered) {
      // Unregister
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
    } else {
      // Register
      await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: user.id });
    }

    fetchEvents();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Workshops, hackathons, and community gatherings.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Events
        </Button>
        <Button
          variant={filter === "registered" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("registered")}
        >
          My Events
        </Button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No events found.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back later or create your own event!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                  eventTypeColors[event.event_type] || eventTypeColors.workshop
                )}>
                  {event.event_type}
                </span>
                {event.is_online && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Video className="h-3 w-3" />
                    Online
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">{event.title}</h3>
              
              {event.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(event.start_date), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {event.participant_count} registered
                    {event.max_participants && ` / ${event.max_participants} spots`}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant={event.is_registered ? "outline" : "default"}
                  onClick={() => handleRegister(event.id)}
                  disabled={!user}
                >
                  {event.is_registered ? "Unregister" : "Register"}
                </Button>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
