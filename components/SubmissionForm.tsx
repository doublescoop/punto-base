"use client";

import { useState } from "react";
import { ArrowLeft, Image, Film, Music } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";

interface SubmissionFormProps {
  openCall: {
    id: string; // topic_id
    title: string;
    magazine: string | { id: string; name: string; slug: string };
    dueDate: string;
    bounty: string;
    category: string;
    magazineId?: string;
    issueId?: string;
    bountyAmount?: number;
  };
  onBack: () => void;
  onSubmitted: () => void;
}

export function SubmissionForm({ openCall, onBack, onSubmitted }: SubmissionFormProps) {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<"intro" | "auth" | "form" | "preview" | "submitted">("intro");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    artistStatement: "",
    file: null as File | null,
  });

  const handleStartSubmission = () => {
    if (!isConnected || !address) {
      setShowAuthModal(true);
    } else {
      setStep("form");
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // First, ensure user exists
      const userResponse = await fetch('/api/users/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const userData = await userResponse.json();

      if (!userData.success) {
        throw new Error('Failed to create/fetch user');
      }

      const magazineName = typeof openCall.magazine === 'string' ? openCall.magazine : openCall.magazine.name;
      const magazineId = openCall.magazineId || (typeof openCall.magazine === 'object' ? openCall.magazine.id : '');
      
      // Get topic and issue info from the open call
      // We need to fetch this from the API since we only have the topic_id
      const topicResponse = await fetch(`/api/topics/${openCall.id}`);
      const topicData = await topicResponse.json();
      
      if (!topicData.success) {
        throw new Error('Failed to fetch topic data');
      }

      console.log('Topic data:', topicData.topic);

      // Submit the submission
      const submissionPayload = {
        topicId: openCall.id,
        authorId: userData.user.id,
        magazineId: topicData.topic.issues.magazine_id,
        issueId: topicData.topic.issue_id,
        title: formData.title,
        content: formData.content,
        description: formData.artistStatement || null,
        mediaUrls: formData.file ? [URL.createObjectURL(formData.file)] : [],
        bountyAmount: openCall.bountyAmount || parseInt(openCall.bounty.replace(/\$|,/g, '')) * 100,
      };

      console.log('Submitting:', submissionPayload);

      const response = await fetch('/api/submissions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit');
      }

      console.log('Submission created:', data.submission);
      setStep("submitted");
      setTimeout(() => {
        onSubmitted();
      }, 2500);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!formData.title) return false;
    
    if (openCall.category === "shorttext") {
      const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
      return wordCount >= 200 && wordCount <= 800;
    }
    
    if (openCall.category === "longtext") {
      const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
      return wordCount >= 1000 && wordCount <= 5000;
    }
    
    if (["picture", "video", "audio"].includes(openCall.category)) {
      return formData.file !== null;
    }
    
    // For "open" format, require either content or file
    if (openCall.category === "open") {
      return formData.content.trim().length > 0 || formData.file !== null;
    }
    
    return true;
  };

  const getEditorNotes = () => {
    const notes: { [key: string]: string } = {
      "1": "We&apos;re looking for images that capture the quiet moments of transformation in urban spaces. Don&apos;t worry about technical perfection—we value authenticity and personal perspective. This collection will honor the experience we shared together.",
      "2": "Your younger self deserves honesty, not perfection. Write from the heart. We&apos;re building this together as a way to process and share what we learned at the gathering. Every voice matters.",
      "3": "Sound carries memory. Whether it&apos;s a field recording, a voice memo, or a composed piece—if it resonates with your experience, it belongs here. We&apos;ll listen to every submission with care.",
      "4": "Take your time with this. We want depth over speed. This essay collection will be a document of our collective thinking. Feel free to reference conversations from the event.",
      "5": "One minute can hold everything. Whether polished or raw, your video is a contribution to our shared narrative. We&apos;re in this together.",
      "6": "Objects tell stories. Share what changed you during our time together. A photo, a reflection—whatever feels true.",
      "7": "The archive whispers to those who listen. Capture what you heard in the silence between moments.",
    };
    return notes[openCall.id] || "Share your authentic voice. This is a collective work made with care.";
  };

  const getRequirements = () => {
    const reqs: { [key: string]: string[] } = {
      picture: [
        "High resolution (min 2000px on longest side)",
        "JPEG, PNG, or TIFF format",
        "Original work or proper attribution",
        "Optional: Artist statement (up to 200 words)",
      ],
      shorttext: [
        "200-800 words",
        "Plain text or simple formatting",
        "Title required",
        "Personal reflection encouraged",
      ],
      longtext: [
        "1,000-5,000 words",
        "Formatted in paragraphs",
        "Include title and optional subtitle",
        "Citations if referencing others&apos; work",
      ],
      video: [
        "30 seconds to 3 minutes",
        "MP4 or MOV format",
        "1080p minimum resolution",
        "Include title and brief description",
      ],
      audio: [
        "1 minute to 10 minutes",
        "MP3, WAV, or FLAC format",
        "Include title and context",
        "Field recordings welcome",
      ],
    };
    return reqs[openCall.category] || [];
  };

  if (step === "submitted") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg text-center space-y-8 border border-border p-12 bg-card">
          <div className="w-20 h-20 border-2 border-accent mx-auto rounded-full flex items-center justify-center animate-pulse">
            <div className="w-3 h-3 bg-accent rounded-full" />
          </div>
          <div className="space-y-4">
            <h2 className="font-mono text-3xl tracking-tight">✓ Submitted!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Thank you for contributing to {openCall.magazine}. Your work is now part of our collective review process. Every submission is read with care and consideration.
            </p>
          </div>
          <div className="pt-4 space-y-3 border-t border-border">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              What happens now
            </h3>
            <p className="text-sm text-muted-foreground">
              Editors will review your submission. You&apos;ll see status updates in your profile and via email.
            </p>
            <p className="text-sm text-muted-foreground">
              Most decisions within 3–7 days.
            </p>
            <p className="text-sm">
              If published, you&apos;ll receive {openCall.bounty} via USDC (0% fee).
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Redirecting to your submissions...
          </div>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-6 hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
            
            <div className="space-y-2">
              <h1 className="font-mono text-4xl tracking-tight">{openCall.title}</h1>
              <p className="text-muted-foreground">{openCall.magazine}</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          {/* Call Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-border">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Due Date
              </div>
              <div>{openCall.dueDate}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Bounty
              </div>
              <div className="text-accent">{openCall.bounty}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Format
              </div>
              <div>{openCall.category}</div>
            </div>
          </div>

          {/* Context */}
          <div className="border border-border p-6 bg-accent/5">
            <p className="text-sm leading-relaxed">
              This publication is a collaborative effort by everyone who participated in our shared experience. Your submission will be reviewed collectively by fellow participants who understand the context and meaning behind each contribution.
            </p>
          </div>

          {/* Editor&apos;s Note */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              From the Editors
            </h3>
            <div className="border-l-2 border-accent pl-6 py-2">
              <p className="leading-relaxed italic">{getEditorNotes()}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Requirements
            </h3>
            <ul className="space-y-2">
              {getRequirements().map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1 h-1 bg-foreground rounded-full mt-2 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <button
              onClick={handleStartSubmission}
              className="w-full border border-border px-6 py-4 bg-primary text-primary-foreground hover:bg-accent hover:border-accent transition-colors"
            >
              Start Your Submission
            </button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              {!isConnected && "You&apos;ll need to connect your wallet"}
            </p>
          </div>
        </div>

        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-card p-8 rounded-lg max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to submit your work and receive payments
              </p>
              <div className="mb-4">
                <ConnectWallet />
              </div>
              {isConnected && (
                <div className="mt-4">
                  <p className="text-sm text-green-600 mb-4">✅ Wallet Connected!</p>
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      setStep("form");
                    }}
                    className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Continue to Submission
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Form step
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => setStep("intro")}
            className="flex items-center gap-2 mb-6 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Details</span>
          </button>
          
          <div className="space-y-3">
            <h1 className="font-mono text-4xl tracking-tight">Submit to {openCall.title}</h1>
            <p className="text-muted-foreground">Format: {openCall.category}</p>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2 pt-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <div className="h-px flex-1 bg-border" />
              <div className="text-xs text-muted-foreground">Step 2 of 2</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Contextual reminder */}
        <div className="mb-8 border-l-2 border-accent pl-6 py-3 bg-accent/5">
          <p className="text-sm italic">
            Remember: This is your contribution to our collective experience. There&apos;s no wrong way to share what matters to you.
          </p>
        </div>

        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* Title */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-muted-foreground block">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors"
              placeholder="Give your work a title"
            />
          </div>

          {/* Format-specific fields */}
          {(openCall.category === "picture") && (
            <>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                  Image File *
                </label>
                <div className="border-2 border-dashed border-border hover:border-accent transition-colors p-12 text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer space-y-4 block">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm">
                        {formData.file ? formData.file.name : "Click to upload image"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPEG, PNG, or TIFF • Min 2000px
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                  Artist Statement (Optional)
                </label>
                <textarea
                  value={formData.artistStatement}
                  onChange={(e) => setFormData({ ...formData, artistStatement: e.target.value })}
                  rows={4}
                  maxLength={200}
                  className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Share the context or story behind this image..."
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.artistStatement.length}/200
                </div>
              </div>
            </>
          )}

          {openCall.category === "shorttext" && (
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                Your Text * (200-800 words)
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={16}
                className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors resize-none font-mono"
                placeholder="Begin writing..."
              />
              <div className="flex justify-between items-center text-xs">
                <div className={`${
                  formData.content.split(/\s+/).filter(Boolean).length < 200 
                    ? "text-muted-foreground" 
                    : formData.content.split(/\s+/).filter(Boolean).length > 800
                    ? "text-accent"
                    : "text-foreground"
                }`}>
                  {formData.content.split(/\s+/).filter(Boolean).length < 200 && 
                    `${200 - formData.content.split(/\s+/).filter(Boolean).length} words to minimum`}
                  {formData.content.split(/\s+/).filter(Boolean).length >= 200 && 
                   formData.content.split(/\s+/).filter(Boolean).length <= 800 && 
                    "Within range ✓"}
                  {formData.content.split(/\s+/).filter(Boolean).length > 800 && 
                    `${formData.content.split(/\s+/).filter(Boolean).length - 800} words over maximum`}
                </div>
                <div className="text-muted-foreground">
                  {formData.content.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
            </div>
          )}

          {openCall.category === "longtext" && (
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                Your Essay * (1,000-5,000 words)
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={24}
                className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Begin your essay..."
              />
              <div className="flex justify-between items-center text-xs">
                <div className={`${
                  formData.content.split(/\s+/).filter(Boolean).length < 1000 
                    ? "text-muted-foreground" 
                    : formData.content.split(/\s+/).filter(Boolean).length > 5000
                    ? "text-accent"
                    : "text-foreground"
                }`}>
                  {formData.content.split(/\s+/).filter(Boolean).length < 1000 && 
                    `${1000 - formData.content.split(/\s+/).filter(Boolean).length} words to minimum`}
                  {formData.content.split(/\s+/).filter(Boolean).length >= 1000 && 
                   formData.content.split(/\s+/).filter(Boolean).length <= 5000 && 
                    "Within range ✓"}
                  {formData.content.split(/\s+/).filter(Boolean).length > 5000 && 
                    `${formData.content.split(/\s+/).filter(Boolean).length - 5000} words over maximum`}
                </div>
                <div className="text-muted-foreground">
                  {formData.content.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
            </div>
          )}

          {openCall.category === "video" && (
            <>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                  Video File * (30sec - 3min)
                </label>
                <div className="border-2 border-dashed border-border hover:border-accent transition-colors p-12 text-center cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    id="video-upload"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  />
                  <label htmlFor="video-upload" className="cursor-pointer space-y-4 block">
                    <Film className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm">
                        {formData.file ? formData.file.name : "Click to upload video"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        MP4 or MOV • 1080p minimum
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                  Description
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Provide context for your video..."
                />
              </div>
            </>
          )}

          {openCall.category === "audio" && (
            <>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                  Audio File * (1-10 minutes)
                </label>
                <div className="border-2 border-dashed border-border hover:border-accent transition-colors p-12 text-center cursor-pointer">
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    id="audio-upload"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  />
                  <label htmlFor="audio-upload" className="cursor-pointer space-y-4 block">
                    <Music className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm">
                        {formData.file ? formData.file.name : "Click to upload audio"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        MP3, WAV, or FLAC
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                  Context & Description
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Where was this recorded? What does it mean to you?..."
                />
              </div>
            </>
          )}

          {openCall.category === "open" && (
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Share your thoughts, experiences, or creative work..."
              />
              <div className="text-xs text-muted-foreground">
                {formData.content.length} characters
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => {
                  // Save draft functionality
                  alert("Draft saved! You can return to complete your submission anytime before " + openCall.dueDate);
                }}
                className="flex-1 border border-border px-6 py-4 bg-background hover:bg-muted transition-colors"
              >
                Save Draft
              </button>
              
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="flex-1 border border-border px-6 py-4 bg-primary text-primary-foreground hover:bg-accent hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:border-border"
              >
                {isSubmitting ? 'Submitting...' : `Submit to ${typeof openCall.magazine === 'string' ? openCall.magazine : openCall.magazine.name}`}
              </button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Payment via USDC (0% fee) if published</p>
              <p>You&apos;ll receive an email notification about the editorial decision</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
