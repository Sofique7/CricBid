import React, { useState, useEffect, useRef } from 'react';
import voiceAuctioneer from '../utils/voiceAuctioneer';

interface VoiceControlPanelProps {
  onVoiceCommand: (command: any) => void;
  isHost: boolean;
}

export const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  onVoiceCommand,
  isHost
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Voice system offline');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [speechActive, setSpeechActive] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        setStatusMessage('Speech recognition not supported in this browser');
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Set language to Indian English

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage('Active listening... Speak command');
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setStatusMessage('Microphone access denied');
            setIsListening(false);
          } else {
            console.warn('Speech recognition error:', event.error);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (statusMessage === 'Active listening... Speak command') {
            setStatusMessage('Listening paused');
          }
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          setTranscript(currentText);

          if (currentText) {
            setSpeechActive(true);
            // Throttle voice active meter shutdown
            const timer = setTimeout(() => setSpeechActive(false), 800);
            
            // Check for matched commands
            const parsedCommand = matchVoiceCommand(currentText);
            if (parsedCommand && finalTranscript) {
              setLastCommand(currentText);
              setStatusMessage(`Command Recognized: ${parsedCommand.type}`);
              onVoiceCommand(parsedCommand);
              // Clear transcript after brief delay
              setTimeout(() => setTranscript(''), 1500);
            }
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onVoiceCommand]);

  const toggleListen = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setStatusMessage('Voice recognition disabled');
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Handle unexpected restarts
        console.warn('Failed to start recognition:', e);
      }
    }
  };

  const mapTeam = (input: string): string | null => {
    const s = input.toLowerCase();
    if (s.includes('chennai') || s.includes('csk') || s.includes('super kings') || s.includes('yellow')) return 'team_csk';
    if (s.includes('mumbai') || s.includes('mi') || s.includes('indians') || s.includes('blue')) return 'team_mi';
    if (s.includes('royal challengers') || s.includes('rcb') || s.includes('bengaluru') || s.includes('bangalore') || s.includes('red')) return 'team_rcb';
    if (s.includes('kolkata') || s.includes('kkr') || s.includes('knight riders') || s.includes('purple')) return 'team_kkr';
    if (s.includes('delhi') || s.includes('dc') || s.includes('capitals')) return 'team_dc';
    if (s.includes('rajasthan') || s.includes('rr') || s.includes('royals') || s.includes('pink')) return 'team_rr';
    if (s.includes('sunrisers') || s.includes('srh') || s.includes('hyderabad') || s.includes('orange')) return 'team_srh';
    if (s.includes('punjab') || s.includes('pbks') || s.includes('kings')) return 'team_pbks';
    if (s.includes('gujarat') || s.includes('gt') || s.includes('titans') || s.includes('navy')) return 'team_gt';
    if (s.includes('lucknow') || s.includes('lsg') || s.includes('super giants')) return 'team_lsg';
    return null;
  };

  const matchVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    // 1. Pause Draft
    if (text.includes('pause auction') || text.includes('stop auction') || text.includes('pause timer') || text === 'pause' || text === 'stop') {
      return { type: 'PAUSE' };
    }

    // 2. Resume Draft
    if (text.includes('resume auction') || text.includes('resume timer') || text.includes('start auction') || text === 'resume' || text === 'start' || text === 'continue') {
      return { type: 'RESUME' };
    }

    // 3. Mark Unsold
    if (text.includes('player unsold') || text.includes('unsold') || text.includes('no bids') || text.includes('no bid') || text === 'unsold' || text === 'pass') {
      return { type: 'UNSOLD' };
    }

    // 4. Next Player
    if (text === 'next player' || text === 'next') {
      return { type: 'NEXT_PLAYER' };
    }

    // 5. Next Player Custom Override
    // E.g., "next player Virat Kohli base price 2 crore"
    const nextPlayerRegex = /(?:next player|bring out|introduce)\s+([a-zA-Z\s]+?)(?:\s+base(?:\s+price)?\s+(\d+(?:\.\d+)?)(?:\s*crore)?)?$/i;
    const nextMatch = text.match(nextPlayerRegex);
    if (nextMatch) {
      const name = nextMatch[1].trim();
      const basePrice = nextMatch[2] ? parseFloat(nextMatch[2]) : undefined;
      // Filter out commands mistaken as names
      const invalidNames = ['unsold', 'once', 'twice', 'pause', 'resume', 'stop', 'start', 'next', 'sold'];
      if (name && !invalidNames.includes(name)) {
        return { type: 'NEXT_PLAYER_OVERRIDE', name, basePrice };
      }
    }

    // 6. Sell Player to Team at Price
    // E.g., "sell player to Chennai at 14.5 crore"
    // E.g., "sell to CSK for 15"
    const sellRegex = /(?:sell player to|sell to|sold to)\s+([a-zA-Z\s]+?)\s+(?:at|for)\s+(\d+(?:\.\d+)?)(?:\s*crore)?$/i;
    const sellMatch = text.match(sellRegex);
    if (sellMatch) {
      const teamInput = sellMatch[1].trim();
      const price = parseFloat(sellMatch[2]);
      const matchedTeam = mapTeam(teamInput);
      if (matchedTeam && !isNaN(price)) {
        return { type: 'SELL_PLAYER', team: matchedTeam, price };
      }
    }

    return null;
  };

  return (
    <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md mb-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
      {/* Sleek luxury gold/blue accent halo in control panel background */}
      <div 
        className={`absolute -left-10 -bottom-10 w-44 h-44 rounded-full blur-[60px] opacity-15 pointer-events-none transition-colors duration-500 ${isListening ? 'bg-amber-500' : 'bg-zinc-700'}`} 
      />

      <div className="flex items-center gap-4 z-10 w-full md:w-auto">
        {/* Glowing Bouncing Microphone Indicator Button */}
        <button
          onClick={toggleListen}
          disabled={!isSupported || !isHost}
          className={`relative flex items-center justify-center w-14 h-14 rounded-full border transition-all duration-300 ${
            !isSupported || !isHost 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : isListening 
                ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
          }`}
          title={!isHost ? 'Only the Host/Auctioneer can use voice control' : 'Toggle voice controls'}
        >
          {isListening ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          )}

          {isListening && (
            <span className="absolute -inset-1 rounded-full border border-amber-500/40 animate-ping pointer-events-none" />
          )}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
              AI Host Voice Panel
            </h4>
            {isHost && (
              <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
                AUCTIONEER ACTIVE
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 font-medium ${isListening ? 'text-amber-400/80 font-mono' : 'text-zinc-500'}`}>
            {statusMessage}
          </p>
        </div>
      </div>

      {/* Floating real-time transcript displaying parsed text & highlighting recognized commands */}
      <div className="flex-1 w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 backdrop-blur-sm shadow-inner z-10">
        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest font-mono mb-1">
          Live Audio Transcript
        </div>
        <div className="h-10 overflow-y-auto flex items-center">
          {transcript ? (
            <p className="text-zinc-300 text-xs italic font-medium">
              "{transcript}"
              {speechActive && (
                <span className="inline-block w-1.5 h-3 bg-amber-400 ml-1 animate-[pulse_0.4s_infinite]" />
              )}
            </p>
          ) : lastCommand ? (
            <p className="text-emerald-400 text-xs font-bold font-mono">
              ✔ Last Command: "{lastCommand}"
            </p>
          ) : (
            <p className="text-zinc-600 text-xs italic">
              {isListening ? 'Waiting for voice instructions...' : 'Enable mic to start spoken room actions'}
            </p>
          )}
        </div>
      </div>

      {/* Glowing Audio Waveform Visualizer */}
      <div className="flex items-center gap-1.5 h-10 w-24 justify-center md:justify-end z-10">
        {Array.from({ length: 6 }).map((_, i) => {
          let scaleAnim = 'none';
          let heightVal = '8px';
          let colorTheme = 'bg-zinc-800';

          if (isListening) {
            colorTheme = 'bg-amber-500';
            scaleAnim = `pulseWave ${0.5 + i * 0.1}s ease-in-out infinite`;
            heightVal = '16px';
            if (speechActive) {
              colorTheme = 'bg-yellow-400';
              scaleAnim = `pulseWave ${0.3 + i * 0.08}s ease-in-out infinite`;
              heightVal = '32px';
            }
          }

          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${colorTheme}`}
              style={{
                height: heightVal,
                animation: scaleAnim
              }}
            />
          );
        })}
      </div>

      {/* Help Command Tooltip Indicator (Floating menu helper) */}
      <div className="absolute right-4 top-2 group z-20">
        <div className="text-zinc-600 hover:text-zinc-400 cursor-help transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-[11px] text-zinc-400 leading-relaxed shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform scale-95 origin-bottom-right">
          <div className="font-bold text-white mb-1.5 uppercase font-mono tracking-wider">Available Host Commands:</div>
          <ul className="list-disc pl-3.5 space-y-1.5 font-mono">
            <li><span className="text-amber-400">"Pause auction"</span> - Hold countdown</li>
            <li><span className="text-amber-400">"Resume auction"</span> - Resume countdown</li>
            <li><span className="text-amber-400">"Player unsold"</span> - Skip/unsold player</li>
            <li><span className="text-amber-400">"Next player"</span> - Bring next player</li>
            <li><span className="text-amber-400">"Next player [Name] base [Price]"</span> - Reorder & load player</li>
            <li><span className="text-amber-400">"Sell player to [Team] at [Price] crore"</span> - Force immediate purchase</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseWave {
          0%, 100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1.4);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceControlPanel;
