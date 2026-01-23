import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VoiceParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isSpeaking: boolean;
}

export const useVoiceChat = (channelId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [currentVoiceChannel, setCurrentVoiceChannel] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const joinVoiceChannel = useCallback(async (voiceChannelId: string) => {
    if (!user || !profile) {
      toast({ title: 'Please log in', variant: 'destructive' });
      return false;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      
      // Set up audio analysis for voice activity detection
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      
      // Mute by default
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });

      setCurrentVoiceChannel(voiceChannelId);
      setIsConnected(true);
      setIsMuted(true);
      
      // Track presence in the channel
      const channel = supabase.channel(`voice:${voiceChannelId}`);
      
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const users: VoiceParticipant[] = [];
          
          Object.keys(state).forEach(key => {
            const presences = state[key] as any[];
            presences.forEach(presence => {
              if (presence.user_id !== user.id) {
                users.push({
                  id: presence.user_id,
                  name: presence.name,
                  avatar: presence.avatar,
                  isMuted: presence.isMuted ?? true,
                  isSpeaking: false,
                });
              }
            });
          });
          
          setParticipants(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          const presence = newPresences[0] as any;
          if (presence.user_id !== user.id) {
            setParticipants(prev => [...prev, {
              id: presence.user_id,
              name: presence.name,
              avatar: presence.avatar,
              isMuted: presence.isMuted ?? true,
              isSpeaking: false,
            }]);
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          const presence = leftPresences[0] as any;
          setParticipants(prev => prev.filter(p => p.id !== presence.user_id));
        })
        .on('broadcast', { event: 'mute_status' }, ({ payload }) => {
          setParticipants(prev => 
            prev.map(p => p.id === payload.user_id ? { ...p, isMuted: payload.isMuted } : p)
          );
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              name: profile.full_name || 'User',
              avatar: profile.avatar_url,
              isMuted: true,
              online_at: new Date().toISOString(),
            });
          }
        });

      toast({ title: 'Connected to voice channel' });
      return true;
    } catch (error: any) {
      console.error('Error joining voice channel:', error);
      toast({ 
        title: 'Microphone access denied', 
        description: 'Please allow microphone access to use voice chat',
        variant: 'destructive' 
      });
      return false;
    }
  }, [user, profile, toast]);

  const leaveVoiceChannel = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (currentVoiceChannel) {
      const channel = supabase.channel(`voice:${currentVoiceChannel}`);
      channel.untrack();
      supabase.removeChannel(channel);
    }

    setIsConnected(false);
    setCurrentVoiceChannel(null);
    setParticipants([]);
    setIsMuted(true);
    setIsDeafened(false);

    toast({ title: 'Left voice channel' });
  }, [currentVoiceChannel, toast]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const newMuteState = !isMuted;
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMuteState;
      });
      setIsMuted(newMuteState);

      // Broadcast mute status
      if (currentVoiceChannel && user) {
        const channel = supabase.channel(`voice:${currentVoiceChannel}`);
        channel.send({
          type: 'broadcast',
          event: 'mute_status',
          payload: { user_id: user.id, isMuted: newMuteState },
        });
      }
    }
  }, [isMuted, currentVoiceChannel, user]);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(prev => !prev);
    // When deafened, also mute
    if (!isDeafened && !isMuted) {
      toggleMute();
    }
  }, [isDeafened, isMuted, toggleMute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isMuted,
    isDeafened,
    participants,
    currentVoiceChannel,
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
  };
};
