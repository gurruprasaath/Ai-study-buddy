import React, { useEffect, useState } from 'react';
import { Brain, Coffee } from 'lucide-react';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getModeIcon = (mode: string) => {
  if (mode === 'work') return <Brain className="h-5 w-5 mr-1" />;
  return <Coffee className="h-5 w-5 mr-1" />;
};

const GlobalPomodoroTimer: React.FC = () => {
  // Draggable position state
  const defaultPosition = { x: window.innerWidth - 320, y: window.innerHeight - 180 };
  const [position, setPosition] = useState(() => {
    const saved = sessionStorage.getItem('pomodoro_timer_position');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultPosition;
      }
    }
    return defaultPosition;
  });
  // Drag logic
  const draggingRef = React.useRef(false);
  const offsetRef = React.useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    document.body.style.userSelect = 'none';
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (draggingRef.current) {
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      setPosition({ x: newX, y: newY });
  sessionStorage.setItem('pomodoro_timer_position', JSON.stringify({ x: newX, y: newY }));
    }
  };
  const handleMouseUp = () => {
    draggingRef.current = false;
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  // Sync position across tabs
  useEffect(() => {
    const syncPosition = (e: StorageEvent) => {
      if (e.key === 'pomodoro_timer_position' && e.newValue) {
        try {
          setPosition(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', syncPosition);
    return () => window.removeEventListener('storage', syncPosition);
  }, []);
  // Color sync logic (same as PomodoroTimer)
  const getModeColor = () => {
    if (mode === 'work') return 'bg-gradient-to-br from-red-500 to-orange-400';
    if (mode === 'shortBreak') return 'bg-gradient-to-br from-green-500 to-teal-400';
    if (mode === 'longBreak') return 'bg-gradient-to-br from-blue-500 to-purple-400';
    return 'bg-gradient-to-br from-gray-400 to-gray-300';
  };
  // Track last mode to detect mode changes
  const [lastMode, setLastMode] = useState<string>(sessionStorage.getItem('pomodoro_mode') || 'work');
  const [mode, setMode] = useState<string>(sessionStorage.getItem('pomodoro_mode') || 'work');
  const [timeLeft, setTimeLeft] = useState<number>(Number(sessionStorage.getItem('pomodoro_timeLeft')) || 25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(sessionStorage.getItem('pomodoro_isRunning') === 'true');
  const [currentTask, setCurrentTask] = useState<string>(sessionStorage.getItem('pomodoro_currentTask') || '');

  // Music player state
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string>("https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b7c7.mp3");
  const [isPlaying, setIsPlaying] = useState<boolean>(() => sessionStorage.getItem('pomodoro_isPlaying') === 'true');
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Only sync state from localStorage, never run own timer
  useEffect(() => {
    const syncState = () => {
      setMode(sessionStorage.getItem('pomodoro_mode') || 'work');
      setIsRunning(sessionStorage.getItem('pomodoro_isRunning') === 'true');
      setTimeLeft(Number(sessionStorage.getItem('pomodoro_timeLeft')) || 0);
      setCurrentTask(sessionStorage.getItem('pomodoro_currentTask') || '');
      setIsPlaying(sessionStorage.getItem('pomodoro_isPlaying') === 'true');
    };
    // Fast polling for perfect sync
    const interval = setInterval(syncState, 300);
    window.addEventListener('storage', syncState);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  // Music file upload and URL
  useEffect(() => {
    if (musicFile) {
      const url = URL.createObjectURL(musicFile);
      setMusicUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMusicUrl("https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b7c7.mp3");
    }
  }, [musicFile]);

  // Play/pause logic and persist state
  useEffect(() => {
    if ((mode === 'shortBreak' || mode === 'longBreak') && isPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  sessionStorage.setItem('pomodoro_isPlaying', isPlaying ? 'true' : 'false');
  }, [mode, isPlaying]);

  if (!isRunning) return null;

  return (
    <div
      className={`fixed rounded-2xl shadow-2xl min-w-[240px] font-semibold text-white cursor-move ${getModeColor()}`}
      style={{
        padding: '1rem 1.5rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        position: 'fixed',
        userSelect: 'none',
        transition: draggingRef.current ? 'none' : 'box-shadow 0.2s',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center mb-1">
        {getModeIcon(mode)}
        <span className="text-2xl mr-3">{formatTime(timeLeft)}</span>
        {currentTask && <span className="text-base opacity-85">({currentTask})</span>}
      </div>
      {/* Music Player for Break Time */}
      {(mode === 'shortBreak' || mode === 'longBreak') && (
        <div className="mt-2 bg-white/10 rounded-xl p-3">
          <label className="block text-base font-medium mb-2 text-white">Relaxing Music (Break)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setMusicFile(e.target.files[0]);
              }
            }}
            disabled={!(mode === 'shortBreak' || mode === 'longBreak')}
            className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 mb-2"
          />
          <audio
            ref={audioRef}
            src={musicUrl}
            controls
            className="w-full rounded-md border border-white/30 mb-2 bg-white/20"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            autoPlay={isPlaying}
          />
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.play();
                setIsPlaying(true);
              }}
              disabled={!(mode === 'shortBreak' || mode === 'longBreak')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md font-semibold"
            >Play</button>
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setIsPlaying(false);
              }}
              disabled={!(mode === 'shortBreak' || mode === 'longBreak')}
              className="bg-white/80 text-gray-700 border border-gray-300 px-4 py-1 rounded-md font-semibold"
            >Pause</button>
          </div>
          <div className="text-xs text-yellow-200 text-center pt-1">If no file is uploaded, default relaxing music will play.</div>
        </div>
      )}
    </div>
  );
};

export default GlobalPomodoroTimer;
