import React, { useState, useRef } from "react";
import type { Locale } from "../../../lib/i18n";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  SkipForward,
  SkipBack,
  Music,
  Video,
  ListMusic,
  Trash2,
} from "lucide-react";

interface MediaPlayerAppProps {
  locale: Locale;
}

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "video" | "audio";
}

export const MediaPlayerApp: React.FC<MediaPlayerAppProps> = () => {
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentItem = currentIndex >= 0 && currentIndex < playlist.length ? playlist[currentIndex] : null;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");
      if (isVideo || isAudio) {
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          name: file.name,
          url: URL.createObjectURL(file),
          type: isVideo ? "video" : "audio",
        });
      }
    }

    if (newItems.length > 0) {
      setPlaylist((prev) => {
        const next = [...prev, ...newItems];
        if (currentIndex === -1) {
          setCurrentIndex(prev.length);
          setIsPlaying(true);
        }
        return next;
      });
    }
  };

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    setCurrentTime(mediaRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!mediaRef.current) return;
    setDuration(mediaRef.current.duration || 0);
    if (isPlaying) mediaRef.current.play();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (mediaRef.current) {
      mediaRef.current.volume = val;
    }
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    mediaRef.current.muted = next;
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = rate;
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const next = (currentIndex + 1) % playlist.length;
    setCurrentIndex(next);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prev = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prev);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const removeItem = (index: number) => {
    setPlaylist((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.url);
      const next = prev.filter((_, i) => i !== index);
      if (currentIndex === index) {
        setCurrentIndex(next.length > 0 ? 0 : -1);
      } else if (currentIndex > index) {
        setCurrentIndex(currentIndex - 1);
      }
      return next;
    });
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-[#101010]/95 text-neutral-200 select-none overflow-hidden">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,video/*"
        onChange={handleFiles}
        className="hidden"
      />

      {/* Main Player Screen Area */}
      <div className="flex-1 flex flex-col items-center justify-between bg-black/60 p-4 overflow-hidden">
        {/* Media Viewport */}
        <div className="flex-1 w-full flex items-center justify-center relative rounded-xl overflow-hidden bg-black/40 border border-white/10">
          {currentItem ? (
            currentItem.type === "video" ? (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={currentItem.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={nextTrack}
                autoPlay
                className="w-full h-full object-contain"
                onClick={togglePlay}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
                <audio
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={currentItem.url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={nextTrack}
                  autoPlay
                />
                <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10 animate-pulse">
                  <Music className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white truncate max-w-sm">{currentItem.name}</h4>
                  <span className="text-xs text-neutral-400">Local Audio Track</span>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center p-6 text-neutral-500">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                <Video className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-300">No media loaded</p>
                <p className="text-xs text-neutral-500 mt-0.5">Select local audio or video files to play</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-medium transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Open Local Media</span>
              </button>
            </div>
          )}
        </div>

        {/* Player Controls Bar */}
        <div className="w-full max-w-2xl mt-4 flex flex-col gap-2">
          {/* Progress Timeline */}
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-cyan-400 cursor-pointer h-1"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Buttons Strip */}
          <div className="flex items-center justify-between">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-[11px]">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    playbackRate === rate ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Core Play Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={prevTrack}
                disabled={playlist.length <= 1}
                className="p-2 rounded-lg hover:bg-white/10 text-neutral-300 disabled:opacity-40 cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!currentItem}
                className="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={nextTrack}
                disabled={playlist.length <= 1}
                className="p-2 rounded-lg hover:bg-white/10 text-neutral-300 disabled:opacity-40 cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-neutral-400 hover:text-white cursor-pointer">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-cyan-400 cursor-pointer h-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/10 bg-black/40 flex flex-col shrink-0">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <ListMusic className="w-4 h-4 text-cyan-400" />
            <span>Playlist ({playlist.length})</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
            title="Add media"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {playlist.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-8">Playlist is empty</p>
          ) : (
            playlist.map((item, idx) => {
              const active = idx === currentIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer group ${
                    active ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "hover:bg-white/5 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {item.type === "video" ? <Video className="w-3.5 h-3.5 shrink-0" /> : <Music className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(idx);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-neutral-400 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
