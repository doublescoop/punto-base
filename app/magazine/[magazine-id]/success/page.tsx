"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, Check } from "lucide-react";

// Mock data - in real app this would come from API
const mockMagazineData = {
  id: "magazine-123",
  name: "NoirCon 3: For Privacy Developers",
  founderName: "Alex Chen",
  openCalls: [
    {
      id: "1",
      title: "I'm going to remember this quote forever:",
      format: "short",
      slotsNeeded: 5,
      bountyAmount: 1,
      dueDate: "2025-01-15",
      submissionsCount: 2
    },
    {
      id: "2", 
      title: "This photo from the event deserves to be seen!",
      format: "image",
      slotsNeeded: 5,
      bountyAmount: 1,
      dueDate: "2025-01-15",
      submissionsCount: 1
    },
    {
      id: "3",
      title: "Your thoughts on....'___'?",
      format: "long",
      slotsNeeded: 3,
      bountyAmount: 5,
      dueDate: "2025-01-15",
      submissionsCount: 0
    }
  ],
  publishDate: "2025-01-18T18:00:00Z"
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="text-center space-y-2">
      {/* <p className="font-handwriting text-xl text-white/90">Final zine publishes in:</p> */}
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="font-display text-6xl font-black text-white">{timeLeft.days}</div>
          <div className="font-mono text-sm uppercase tracking-wider text-white/70">days</div>
        </div>
        <div className="font-display text-4xl text-white/50">:</div>
        <div className="text-center">
          <div className="font-display text-6xl font-black text-white">{timeLeft.hours}</div>
          <div className="font-mono text-sm uppercase tracking-wider text-white/70">hours</div>
        </div>
        <div className="font-display text-4xl text-white/50">:</div>
        <div className="text-center">
          <div className="font-display text-6xl font-black text-white">{timeLeft.minutes}</div>
          <div className="font-mono text-sm uppercase tracking-wider text-white/70">minutes</div>
        </div>
        <div className="font-display text-4xl text-white/50">:</div>
        <div className="text-center">
          <div className="font-display text-6xl font-black text-white">{timeLeft.seconds}</div>
          <div className="font-mono text-sm uppercase tracking-wider text-white/70">seconds</div>
        </div>
        <p className="font-display text-6xl font-black text-white/90">TO PUBLISH</p>
      </div>
        {/* <p className="font-handwriting text-xl text-white/90">Final zine publishes in:</p> */}

    </div>
  );
};

// Main What's Next Section
const WhatsNextSection = ({ magazineId }: { magazineId: string }) => {
  const openCallsUrl = `${window.location.origin}/opencalls?magazine=${magazineId}`;
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  
  const handleDownloadQR = async () => {
    try {
      // TODO: Implement actual QR code generation and download
      // For now, simulate download
      setQrDownloaded(true);
      setTimeout(() => setQrDownloaded(false), 2000);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  const handleCopyEmail = async () => {
    const emailTemplate = `Subject: Join our collective zine project!

Hi everyone!

I've created open calls for our post-event zine. Each contribution will be rewarded with USDC, and we'll publish the final zine soon.

Join the project here: ${openCallsUrl}

Let's turn our shared experience into something lasting!

Best regards`;

    try {
      await navigator.clipboard.writeText(emailTemplate);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <div className="space-y-16">
      {/* What's Next Title */}
      <div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white">
          what&apos;s next?
        </h1>
      </div>
      
      {/* Step 1 - 3 Column Layout: #1 on left, A and B on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: #1 and description */}
        <div className="lg:col-span-3 flex flex-col justify-start">
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none mb-2">
            #1.
          </h2>
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Share with participants
          </h3>
          <p className="font-handwriting text-base sm:text-lg text-white/80 italic mt-2">
            I made it extra easy for you (wink wink)
          </p>
        </div>

        {/* Right Columns: A and B side by side */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Section A: Download QR */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Ⓐ Download this print/shareable QR
              </h4>
              <button
                onClick={handleDownloadQR}
                className="flex-shrink-0 p-2 hover:bg-white/20 transition-colors mt-2"
              >
                {qrDownloaded ? <Check className="w-6 h-6 text-white" /> : <Download className="w-6 h-6 text-white" />}
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="font-display text-xl sm:text-2xl text-white leading-tight">
                Post-event Zine &lt;3<br />Open Call
              </p>
              <p className="font-handwriting text-base text-white/80 italic">
                (It means you can come yap, and we pay for it when featured!)
              </p>
              
              {/* QR Code */}
              <div className="bg-black p-8 flex items-center justify-center">
                <div className="w-40 h-40 bg-white flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold">QR</p>
                    <p className="font-display text-2xl font-bold">Here</p>
                  </div>
                </div>
              </div>
              
              <p className="font-mono text-sm text-white/90">
                What did you learn, feel, think today?<br />
                Let&apos;s make it into a zine together!
              </p>
            </div>
          </div>

          {/* Section B: Copy Email */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Ⓑ Copy-paste email the participants
              </h4>
              <button
                onClick={handleCopyEmail}
                className="flex-shrink-0 px-4 py-2 bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center gap-2 mt-2"
              >
                {emailCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span className="text-sm font-mono">{emailCopied ? 'copied!' : 'copy'}</span>
              </button>
            </div>
            
            <div className="bg-[#8B0000] p-6 min-h-[400px]">
              <pre className="font-mono text-sm text-white/90 whitespace-pre-wrap">
{`Subject: Join our collective zine project!

Hi everyone!

I've created open calls for our post-event zine. Each contribution will be rewarded with USDC, and we'll publish the final zine soon.

Join the project here: ${openCallsUrl}

Let's turn our shared experience into something lasting!

Best regards`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-3 flex flex-col justify-start">
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none mb-2">
            #2.
          </h2>
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Check Your Open Call Submissions and Curate!
          </h3>
          <p className="font-handwriting text-base sm:text-lg text-white/80 italic mt-2">
            you can find this page in your profile - founder tab.
          </p>
        </div>
      </div>
    </div>
  );
};


// Open Call Card Component
const OpenCallCard = ({ openCall }: { openCall: {
  id: string;
  title: string;
  format: string;
  slotsNeeded: number;
  bountyAmount: number;
  dueDate: string;
  submissionsCount: number;
} }) => {
  const formatLabels = {
    short: "Short text (≤100 words)",
    long: "Long text (100+ words)", 
    image: "Image with caption",
    open: "Open format"
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-display text-xl font-bold text-white mb-2">{openCall.title}</h4>
          <div className="flex items-center gap-4 text-white/80">
            <span className="font-mono text-sm">{formatLabels[openCall.format as keyof typeof formatLabels]}</span>
            <span className="font-mono text-sm">{openCall.slotsNeeded} slots</span>
            <span className="font-mono text-sm">{openCall.bountyAmount} USDC each</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold text-white">{openCall.submissionsCount}</div>
          <div className="font-mono text-xs text-white/70 uppercase tracking-wider">submissions</div>
        </div>
      </div>
      
      <div className="w-full bg-white/20 h-2">
        <div 
          className="bg-white h-2 transition-all duration-300"
          style={{ width: `${(openCall.submissionsCount / openCall.slotsNeeded) * 100}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-white/70">
        <span className="font-mono text-sm">Due: {new Date(openCall.dueDate).toLocaleDateString()}</span>
        <span className="font-mono text-sm">{openCall.slotsNeeded - openCall.submissionsCount} slots remaining</span>
      </div>
    </div>
  );
};

export default function MagazineSuccessPage() {
  const _params = useParams();
  const router = useRouter();
  const [magazineData, setMagazineData] = useState(mockMagazineData);

  // Load magazine data from localStorage (set by the wizard)
  useEffect(() => {
    const storedData = localStorage.getItem('magazineData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setMagazineData({
          ...mockMagazineData,
          id: parsedData.id,
          name: parsedData.eventData?.title || mockMagazineData.name,
          founderName: parsedData.eventData?.organization?.name || mockMagazineData.founderName,
          publishDate: parsedData.publishDate,
          openCalls: parsedData.topics?.filter((topic: { isOpenCall: boolean }) => topic.isOpenCall)?.map((topic: { id: string; title: string; format: string; slotsNeeded: number; bountyAmount: number; dueDate: string }) => ({
            id: topic.id,
            title: topic.title,
            format: topic.format,
            slotsNeeded: topic.slotsNeeded,
            bountyAmount: topic.bountyAmount,
            dueDate: topic.dueDate,
            submissionsCount: 0 // Will be updated from API in real app
          })) || mockMagazineData.openCalls
        });
      } catch (error) {
        console.error('Failed to parse magazine data:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-accent">
      {/* Header */}
      <div className="border-b border-white/20">
        <div className="w-full px-6 lg:px-12 py-8">
          <button
            onClick={() => router.push("/profile")}
            className="text-white/80 hover:text-white transition-colors mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>

          <div className="text-center space-y-6">
            <div className="">
              <h1 className="font-display text-5xl font-black text-white">
                {magazineData.founderName}&apos;s zine
              </h1>
              <h1 className="font-display text-5xl font-black text-white">
                 open calls are live!
              </h1>
              <p className="font-handwriting text-2xl text-white/90">
                {magazineData.name}
              </p>
            </div>

            <CountdownTimer targetDate={magazineData.publishDate} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 lg:px-12 py-12 space-y-12">
        {/* What's Next Section */}
        <WhatsNextSection magazineId={magazineData.id} />

        {/* Open Calls List */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Your Open Calls</h2>
            <p className="font-handwriting text-xl text-white/80">Live submissions from event participants</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {magazineData.openCalls.map((openCall) => (
              <OpenCallCard key={openCall.id} openCall={openCall} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
