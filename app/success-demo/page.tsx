"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import Image from "next/image";

export default function SuccessDemoPage() {
  const router = useRouter();
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const magazineData = {
    name: "Skill 4 Skill · Luma Zine",
    slug: "skill-4-skill-luma-195595",
    founderName: "Index",
    openCallsUrl: "https://punto.app/opencalls?magazine=skill-4-skill-luma-195595",
    publishDate: "2025-11-06T19:00:00-05:00", // Event date from your data
  };

  // Countdown Timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(magazineData.publishDate).getTime();
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
  }, [magazineData.publishDate]);

  const handleDownloadQR = async () => {
    setQrDownloaded(true);
    setTimeout(() => setQrDownloaded(false), 2000);
  };

  const handleCopyEmail = async () => {
    const emailTemplate = `Subject: Join our collective zine project!

Hi everyone!

I've created open calls for our post-event zine. Each contribution will be rewarded with USDC, and we'll publish the final zine soon.

Join the project here: ${magazineData.openCallsUrl}

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
            <div>
              <h1 className="font-display text-5xl font-black text-white">
                {magazineData.founderName}&apos;s zine
              </h1>
              <h1 className="font-display text-5xl font-black text-white">
                open calls are live!
              </h1>
              <p className="font-handwriting text-2xl text-white/90 mt-4">
                {magazineData.name}
              </p>
            </div>

            {/* Countdown Timer */}
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 lg:px-12 py-12 space-y-16">
        {/* What's Next Title */}
        <div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white">
            what&apos;s next?
          </h1>
        </div>

        {/* Step 1 - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: #1 */}
          <div className="lg:col-span-3 flex flex-col justify-start">
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none mb-2">
              #1.
            </h2>
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Share with participants
            </h3>
            <p className="font-handwriting text-base sm:text-lg text-white/80 italic mt-2" style={{ fontFamily: 'Mynerve, TeenageDreams, cursive' }}>
              I made it extra easy for you (wink wink)
            </p>
          </div>

          {/* Right Columns: A and B */}
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
                  {qrDownloaded ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Download className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>

              {/* Entire QR box with darker red background */}
              <div className="bg-[#8B0000] p-8 space-y-4">
                <p className="font-display text-xl sm:text-2xl text-white leading-tight">
                  Post-event Zine &lt;3<br />Open Call
                </p>
                <p className="font-handwriting text-base text-white/80 italic" style={{ fontFamily: 'Mynerve, TeenageDreams, cursive' }}>
                  (It means you can come yap, and we pay for it when featured!)
                </p>

                {/* QR Code - actual image, no black background */}
                <div className="flex items-center justify-center py-4">
                  <Image
                    src="/qr-demo.png"
                    alt="QR Code for Open Call"
                    width={200}
                    height={200}
                    className="w-48 h-48"
                  />
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
                  {emailCopied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span className="text-sm font-mono">
                    {emailCopied ? 'copied!' : 'copy'}
                  </span>
                </button>
              </div>

              <div className="bg-[#8B0000] p-6 min-h-[400px]">
                <pre className="font-mono text-sm text-white/90 whitespace-pre-wrap">
{`Subject: Join our collective zine project!

Hi everyone!

I've created open calls for our post-event zine. Each contribution will be rewarded with USDC, and we'll publish the final zine soon.

Join the project here: ${magazineData.openCallsUrl}

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
            <p className="font-handwriting text-base sm:text-lg text-white/80 italic mt-2" style={{ fontFamily: 'Mynerve, TeenageDreams, cursive' }}>
              you can find this page in your profile - founder tab.
            </p>
          </div>

          <div className="lg:col-span-9">
            <button
              onClick={() => router.push("/profile")}
              className="px-8 py-4 bg-white text-accent font-display font-bold text-xl hover:bg-white/90 transition-colors"
            >
              Go to My Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
