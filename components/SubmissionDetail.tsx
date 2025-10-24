import { ArrowLeft, ThumbsUp, ThumbsDown, Meh, Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { AuthModal } from "./AuthModal";

interface Submission {
  id: string;
  content: string;
  type: string;
  author: string;
}

interface SubmissionDetailProps {
  openCall: {
    id: string;
    title: string;
    magazine: string;
    dueDate: string;
    bounty: string;
    category: string;
  };
  submissions: Submission[];
  onBack: () => void;
  onSubmitMine: () => void;
}

export function SubmissionDetail({ openCall, submissions, onBack, onSubmitMine }: SubmissionDetailProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<{ [key: string]: string }>({});
  const [voteCount, setVoteCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const currentSubmission = submissions[currentIndex];

  const handleVote = useCallback((vote: "up" | "down" | "hmm") => {
    const newVotes = { ...votes, [currentSubmission.id]: vote };
    setVotes(newVotes);
    
    const newVoteCount = voteCount + 1;
    setVoteCount(newVoteCount);
    
    // Show sign up modal after 2 votes
    if (newVoteCount === 2) {
      setTimeout(() => {
        setShowAuthModal(true);
      }, 300);
    }
    
    // Move to next submission after voting
    if (currentIndex < submissions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    }
  }, [votes, currentSubmission, voteCount, currentIndex, submissions.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        handleVote("up");
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleVote("down");
      } else if (e.key === " " || e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleVote("hmm");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleVote]);

  return (
    <div className="min-h-screen bg-background">
      {showAuthModal && (
        <AuthModal
          magazineName={openCall.magazine}
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={() => setShowAuthModal(false)}
          context="voting"
        />
      )}
      
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Open Calls</span>
            </button>
            
            <button
              onClick={onSubmitMine}
              className="border border-accent px-4 py-2 flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span className="text-sm">Submit Mine</span>
            </button>
          </div>
          
          <div className="space-y-2">
            <h1 className="font-mono text-4xl tracking-tight">{openCall.title}</h1>
            <p className="text-muted-foreground">{openCall.magazine}</p>
          </div>
        </div>
      </div>

      {/* Submission Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Submission {currentIndex + 1} of {submissions.length}
          </div>
          <div className="text-xs text-muted-foreground">
            {Object.keys(votes).length} voted
          </div>
        </div>

        <div className="border border-border bg-card relative overflow-hidden">
          {/* Preview content at 30% */}
          <div className="p-12">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-6">
              by {currentSubmission.author}
            </div>
            
            <div className="relative">
              <div className="prose max-w-none">
                {currentSubmission.type === "picture" && (
                  <div className="aspect-[4/3] bg-muted border border-border flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Image Preview</span>
                  </div>
                )}
                
                {(currentSubmission.type === "shorttext" || currentSubmission.type === "longtext") && (
                  <div className="space-y-4">
                    <p className="leading-relaxed">{currentSubmission.content}</p>
                  </div>
                )}
                
                {currentSubmission.type === "video" && (
                  <div className="aspect-video bg-muted border border-border flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Video Preview</span>
                  </div>
                )}
                
                {currentSubmission.type === "audio" && (
                  <div className="h-32 bg-muted border border-border flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Audio Preview</span>
                  </div>
                )}
              </div>
              
              {/* 30% opacity overlay to simulate preview */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" style={{ top: '30%' }} />
            </div>
          </div>
          
          {/* Blur overlay for bottom 70% */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 backdrop-blur-sm bg-background/60 border-t border-border flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Vote to view full submission</p>
            </div>
          </div>
        </div>

        {/* Voting Buttons */}
        <div className="mt-12 space-y-6">
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleVote("down")}
              className={`w-16 h-16 rounded-full border-2 transition-all flex items-center justify-center ${
                votes[currentSubmission.id] === "down"
                  ? "border-accent bg-accent text-white"
                  : "border-border hover:border-accent hover:bg-accent/10"
              }`}
              aria-label="Vote down"
              title="Vote down (↓ or S)"
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleVote("hmm")}
              className={`w-16 h-16 rounded-full border-2 transition-all flex items-center justify-center ${
                votes[currentSubmission.id] === "hmm"
                  ? "border-accent bg-accent text-white"
                  : "border-border hover:border-accent hover:bg-accent/10"
              }`}
              aria-label="Vote neutral"
              title="Vote neutral (Space or D)"
            >
              <Meh className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleVote("up")}
              className={`w-16 h-16 rounded-full border-2 transition-all flex items-center justify-center ${
                votes[currentSubmission.id] === "up"
                  ? "border-accent bg-accent text-white"
                  : "border-border hover:border-accent hover:bg-accent/10"
              }`}
              aria-label="Vote up"
              title="Vote up (↑ or W)"
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Use keyboard: ↑/W (up) • Space/D (neutral) • ↓/S (down)
          </p>
        </div>
      </div>
    </div>
  );
}
