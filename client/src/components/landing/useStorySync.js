import { useState, useEffect } from 'react';

const PHRASES = [
  "Code Together.",
  "Build Faster.",
  "Collaborate Live.",
  "Import Any Repository.",
  "Run Projects Instantly.",
  "Preview Changes Live.",
  "Ship Better Software.",
  "Built for Developers.",
  "Built for Teams.",
  "Built for Startups.",
  "Built for Open Source.",
  "Built for Hackathons."
];

export function useStorySync() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    const currentPhrase = PHRASES[phraseIndex];

    const type = () => {
      if (isDeleting) {
        setText(prev => prev.substring(0, prev.length - 1));
        
        if (text === "") {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
          timeoutId = setTimeout(type, 500); // slight pause before typing next
          return;
        }
        
        const deleteSpeed = Math.random() * 10 + 20; // 20-30ms
        timeoutId = setTimeout(type, deleteSpeed);
      } else {
        setText(currentPhrase.substring(0, text.length + 1));
        
        if (text === currentPhrase) {
          // Pause before deleting
          timeoutId = setTimeout(() => {
            setIsDeleting(true);
            type();
          }, 1800);
          return;
        }
        
        const typeSpeed = Math.random() * 15 + 45; // 45-60ms
        timeoutId = setTimeout(type, typeSpeed);
      }
    };

    timeoutId = setTimeout(type, 50);

    return () => clearTimeout(timeoutId);
  }, [text, isDeleting, phraseIndex]);

  return { text, phraseIndex, isDeleting, currentPhrase: PHRASES[phraseIndex] };
}

export const STORY_PHRASES = PHRASES;
