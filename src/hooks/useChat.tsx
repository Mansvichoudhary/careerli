import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'mentor';
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  channel_type: string;
  created_at: string;
  created_by: string | null;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  channel_id: string;
  profiles?: Profile | null;
}

export const useChat = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchChannels = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching channels:', error);
    } else if (data) {
      setChannels(data);
      if (data.length > 0 && !currentChannel) {
        setCurrentChannel(data[0]);
      }
    }
    setLoading(false);
  }, [currentChannel]);

  const fetchMessages = useCallback(async (channelId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_user_id_fkey (
          id, full_name, avatar_url, role
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
    } else if (data) {
      setMessages(data as unknown as Message[]);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    if (currentChannel) {
      fetchMessages(currentChannel.id);

      // Subscribe to realtime messages
      const channel = supabase
        .channel(`messages:${currentChannel.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${currentChannel.id}`,
          },
          async (payload) => {
            // Fetch the message with profile data
            const { data } = await supabase
              .from('messages')
              .select(`
                *,
                profiles!messages_user_id_fkey (
                  id, full_name, avatar_url, role
                )
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              setMessages(prev => [...prev, data as unknown as Message]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentChannel, fetchMessages]);

  const sendMessage = async (content: string) => {
    if (!user || !currentChannel) {
      toast({ title: 'Error', description: 'Please select a channel and log in', variant: 'destructive' });
      return null;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        channel_id: currentChannel.id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
      return null;
    }

    return data;
  };

  const createChannel = async (name: string, description?: string, isPrivate = false) => {
    if (!user) {
      toast({ title: 'Please log in', variant: 'destructive' });
      return null;
    }

    const { data, error } = await supabase
      .from('chat_channels')
      .insert({
        name,
        description,
        channel_type: isPrivate ? 'private' : 'public',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating channel', description: error.message, variant: 'destructive' });
      return null;
    }

    toast({ title: 'Channel created!' });
    await fetchChannels();
    return data;
  };

  const joinChannel = async (channelId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('channel_members')
      .insert({ channel_id: channelId, user_id: user.id });

    if (error && !error.message.includes('duplicate')) {
      toast({ title: 'Error joining channel', description: error.message, variant: 'destructive' });
      return false;
    }

    return true;
  };

  return {
    channels,
    currentChannel,
    setCurrentChannel,
    messages,
    loading,
    sendMessage,
    createChannel,
    joinChannel,
    refreshChannels: fetchChannels,
    profile,
  };
};
