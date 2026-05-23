class VoiceAuctioneer {
  private isEnabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;
  private lastSpokenText: string = '';

  constructor() {
    this.initVoice();
  }

  private initVoice() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // 1. Premium Indian English Female (Google, Microsoft Heera/Raveena, custom voices)
      let selected = voices.find(v => 
        v.lang.toLowerCase().replace('_', '-').includes('en-in') && 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('heera') || 
         v.name.toLowerCase().includes('raveena') || 
         v.name.toLowerCase().includes('google'))
      );

      // 2. Any Indian English voice
      if (!selected) {
        selected = voices.find(v => v.lang.toLowerCase().replace('_', '-').includes('en-in'));
      }

      // 3. Premium UK Female English voice (Hazel, Susan, etc.)
      if (!selected) {
        selected = voices.find(v => 
          v.lang.toLowerCase().replace('_', '-').includes('en-gb') && 
          (v.name.toLowerCase().includes('female') || 
           v.name.toLowerCase().includes('hazel') || 
           v.name.toLowerCase().includes('susan') || 
           v.name.toLowerCase().includes('google'))
        );
      }

      // 4. Premium US Female English voice (Zira, Samantha, etc.)
      if (!selected) {
        selected = voices.find(v => 
          v.lang.toLowerCase().replace('_', '-').includes('en-us') && 
          (v.name.toLowerCase().includes('female') || 
           v.name.toLowerCase().includes('zira') || 
           v.name.toLowerCase().includes('samantha') || 
           v.name.toLowerCase().includes('google'))
        );
      }

      // 5. Any English voice
      if (!selected) {
        selected = voices.find(v => v.lang.toLowerCase().startsWith('en'));
      }

      // 6. First available voice
      if (!selected) {
        selected = voices[0] || null;
      }

      this.voice = selected;
    };

    findVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findVoice;
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.cancel();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public cancel() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Speaks the provided text with dynamic pacing depending on intensity level.
   * Intensity level mapping:
   * 0 - Calm Intro (Next player, base price)
   * 1 - Moderate (Standard bidding action)
   * 2 - Frantic (High speed bidding action)
   * 3 - Countdown / Suspense (Going once, going twice, any further bids?)
   * 4 - Energetic Sold/Unsold announcements
   */
  public speak(text: string, intensity: number = 0) {
    if (!this.isEnabled) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Avoid speaking the exact same phrase consecutively in short bursts
    if (text === this.lastSpokenText && intensity === 1) return;
    this.lastSpokenText = text;

    try {
      // Immediate cutoff of previous spoken announcement for realistic real-time reaction
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (!this.voice) {
        this.initVoice();
      }
      if (this.voice) {
        utterance.voice = this.voice;
      }

      // Set energetic rate and pitch values depending on the live bid status
      switch (intensity) {
        case 0: // Calm & Professional
          utterance.rate = 1.0;
          utterance.pitch = 1.03;
          break;
        case 1: // Prompt & Exciting
          utterance.rate = 1.12;
          utterance.pitch = 1.05;
          break;
        case 2: // Rapid fire bidding escalation
          utterance.rate = 1.25;
          utterance.pitch = 1.08;
          break;
        case 3: // Slow, clear suspenseful pacing
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          break;
        case 4: // Triumphant/Definitive SOLD celebration
          utterance.rate = 1.05;
          utterance.pitch = 1.05;
          break;
        default:
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
      }

      // Handle speech errors gracefully
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') {
          console.warn('Speech synthesis error:', e);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed to execute:', e);
    }
  }

  // Pre-compiled verbal templates for auctioneer to sound completely human
  public speakNextPlayer(name: string, priceStr: string) {
    const templates = [
      `Next player up, ${name}. Base price, ${priceStr}.`,
      `Moving on to ${name}. Starting bid is ${priceStr}.`,
      `Let's bring out ${name}. Valued at a base of ${priceStr}.`
    ];
    const speechText = templates[Math.floor(Math.random() * templates.length)];
    this.speak(speechText, 0);
  }

  public speakBidPlaced(teamName: string, amountStr: string, bidderCount: number) {
    // Escalate excitement as more bids are placed on the same player
    const intensity = bidderCount > 6 ? 2 : 1;
    const templates = [
      `${teamName} enters at ${amountStr}.`,
      `${teamName} takes it to ${amountStr}.`,
      `We have ${amountStr} from ${teamName}.`,
      `New bid from ${teamName}, now at ${amountStr}.`
    ];
    const speechText = templates[Math.floor(Math.random() * templates.length)];
    this.speak(speechText, intensity);
  }

  public speakCountdown(countText: string) {
    // "Going once...", "Going twice...", "Any further bids?"
    this.speak(countText, 3);
  }

  public speakSold(name: string, teamName: string, amountStr: string) {
    const templates = [
      `Sold! ${name} is sold to ${teamName} for a fantastic price of ${amountStr}!`,
      `Sold! Congratulations to ${teamName}! They secure ${name} for ${amountStr}!`,
      `Done! ${name} goes to ${teamName} at ${amountStr}!`
    ];
    const speechText = templates[Math.floor(Math.random() * templates.length)];
    this.speak(speechText, 4);
  }

  public speakUnsold(name: string) {
    const templates = [
      `No further bids. ${name} remains unsold.`,
      `Player unsold. ${name} will pass back into the pool.`,
      `Unsold. No takers for ${name} at this time.`
    ];
    const speechText = templates[Math.floor(Math.random() * templates.length)];
    this.speak(speechText, 4);
  }
}

export const voiceAuctioneer = new VoiceAuctioneer();
export default voiceAuctioneer;
