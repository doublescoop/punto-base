import { useState, useRef, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Footnote {
  number: number;
  text: string;
}

interface ArticleDetailProps {
  category: string;
  authors: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageCaption?: string;
  content: string;
  magazineName: string;
  season: string;
  year: string;
  volume: string;
  number: string;
  coverImageUrl?: string;
  location?: string;
  weather?: string;
  footnotes?: Footnote[];
  onBack: () => void;
}

export function ArticleDetail({
  category,
  authors,
  title,
  subtitle,
  imageUrl,
  imageCaption,
  content,
  magazineName,
  season,
  year,
  volume,
  number,
  coverImageUrl,
  location = "LOS ANGELES",
  weather = "70° CLEAR SKY",
  footnotes = [],
  onBack,
}: ArticleDetailProps) {
  const [showFootnotes, setShowFootnotes] = useState(false);
  const footnotesRef = useRef<HTMLDivElement>(null);

  // Observe when footnotes come into view
  useEffect(() => {
    if (!footnotesRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setShowFootnotes(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(footnotesRef.current);

    return () => observer.disconnect();
  }, []);

  // Distribute footnotes across columns intelligently
  const distributeFootnotes = (numColumns: number) => {
    if (footnotes.length === 0) return Array(numColumns).fill([]);
    
    const columns: Footnote[][] = Array(numColumns).fill(null).map(() => []);
    const columnHeights = Array(numColumns).fill(0);

    footnotes.forEach((footnote) => {
      // Find column with minimum height
      const minIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columns[minIndex].push(footnote);
      // Estimate height based on text length
      columnHeights[minIndex] += footnote.text.length;
    });

    return columns;
  };

  const desktopColumns = distributeFootnotes(4);
  const mobileColumns = distributeFootnotes(2);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar - NO BORDER */}
      <header className="px-6 py-3.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-6">
            <h1 className="text-base italic tracking-tight">{magazineName}</h1>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 text-sm" style={{ color: '#6B8E23' }}>
              <a href="#" className="hover:opacity-70 transition-opacity">Journal</a>
              <span>,</span>
              <a href="#" className="hover:opacity-70 transition-opacity">Online</a>
              <span>,</span>
              <a href="#" className="hover:opacity-70 transition-opacity">Events</a>
              <span>,</span>
              <a href="#" className="hover:opacity-70 transition-opacity">Subscribe</a>
              <span>,</span>
              <a href="#" className="hover:opacity-70 transition-opacity">About</a>
              <span>,</span>
              <a href="#" className="hover:opacity-70 transition-opacity">Support</a>
              <span>,</span>
              <a href="#" className="hover:opacity-70 transition-opacity">More ↓</a>
            </nav>
          </div>

          {/* Right: Location and Actions */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="uppercase tracking-wider">{location} {weather}</span>
            <a href="#" className="hover:opacity-70 transition-opacity">Follow Us</a>
            <span>,</span>
            <a href="#" className="hover:opacity-70 transition-opacity">Search</a>
          </div>

          {/* Mobile Back Button */}
          <button
            onClick={onBack}
            className="md:hidden text-sm hover:opacity-70 transition-opacity"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto">
        {/* Desktop Layout with Sidebar */}
        <div className="hidden md:block">
          <div className={`grid transition-all duration-300 ${showFootnotes ? 'grid-cols-1' : 'grid-cols-[180px_1fr]'}`}>
            {/* Left Sidebar - Magazine Cover (hidden when footnotes visible) */}
            {!showFootnotes && (
              <div className="px-6 pt-16 pb-12 flex flex-col items-center">
                <div className="w-full space-y-6 sticky top-8">
                  {/* Cover Image */}
                  <div className="w-[120px] mx-auto aspect-[3/4] bg-muted/20 relative overflow-hidden">
                    {coverImageUrl ? (
                      <ImageWithFallback
                        src={coverImageUrl}
                        alt={`${magazineName} ${season} ${year} Cover`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px]">
                        Cover
                      </div>
                    )}
                  </div>

                  {/* Issue Info */}
                  <div className="text-center space-y-0.5">
                    <div className="text-xs italic">{magazineName}</div>
                    <div className="text-[10px]">{season} {year}</div>
                    <div className="text-[9px] text-muted-foreground">
                      Volume {volume} Number {number}
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <div className="flex justify-center">
                    <button className="px-4 py-1 border border-foreground hover:bg-foreground hover:text-background transition-all text-[9px] tracking-wider uppercase">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Article Content */}
            <div className={`${showFootnotes ? 'px-32 max-w-[1400px] mx-auto' : 'pr-24 pl-12'} pt-16 pb-12`}>
              {/* Article Header - Centered */}
              <div className="max-w-[600px] mx-auto mb-12 text-center">
                <div className="text-[10px] uppercase tracking-widest mb-3" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
                  {category}
                </div>
                <div className="text-sm mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  {authors}
                </div>
                <h1 className="text-4xl mb-4" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.2' }}>
                  {title}
                </h1>
                <div className="text-xs uppercase tracking-wide mb-6" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
                  SHARE: FACEBOOK, TWITTER
                </div>
              </div>

              {/* Featured Image */}
              {imageUrl && (
                <div className="max-w-[700px] mx-auto mb-8">
                  <div className="w-full aspect-[16/9] bg-muted/20 overflow-hidden mb-2">
                    <ImageWithFallback
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {imageCaption && (
                    <p className="text-[11px] text-center italic" style={{ fontFamily: 'Georgia, serif' }}>
                      {imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Article Body */}
              <div className="max-w-[600px] mx-auto mb-16">
                <div className="space-y-5" style={{ fontFamily: 'Georgia, serif' }}>
                  {content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-[15px] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Footnotes Section */}
              {footnotes.length > 0 && (
                <div ref={footnotesRef} className="border-t border-border pt-12 mt-16">
                  <h2 className="text-center text-base mb-10" style={{ fontFamily: 'Georgia, serif' }}>
                    Footnotes
                  </h2>
                  
                  <div className="grid grid-cols-4 gap-8">
                    {desktopColumns.map((column, colIndex) => (
                      <div key={colIndex} className="space-y-4">
                        {column.map((footnote) => (
                          <div key={footnote.number} className="text-[10px] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                            <span className="inline-block mr-1">{footnote.number}.</span>
                            <span>{footnote.text}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Article Content */}
          <div className="px-6 pt-8 pb-12">
            {/* Article Header - Centered */}
            <div className="mb-10 text-center">
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
                {category}
              </div>
              <div className="text-sm mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                {authors}
              </div>
              <h1 className="text-2xl mb-4" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.2' }}>
                {title}
              </h1>
              <div className="text-[10px] uppercase tracking-wide mb-4" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
                SHARE: FACEBOOK, TWITTER
              </div>
            </div>

            {/* Featured Image */}
            {imageUrl && (
              <div className="mb-8">
                <div className="w-full aspect-[16/9] bg-muted/20 overflow-hidden mb-2">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {imageCaption && (
                  <p className="text-[10px] text-center italic" style={{ fontFamily: 'Georgia, serif' }}>
                    {imageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Article Body */}
            <div className="mb-12">
              <div className="space-y-4" style={{ fontFamily: 'Georgia, serif' }}>
                {content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Footnotes Section */}
            {footnotes.length > 0 && (
              <div className="border-t border-border pt-10 mb-12">
                <h2 className="text-center text-base mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                  Footnotes
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  {mobileColumns.map((column, colIndex) => (
                    <div key={colIndex} className="space-y-3">
                      {column.map((footnote) => (
                        <div key={footnote.number} className="text-[9px] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                          <span className="inline-block mr-1">{footnote.number}.</span>
                          <span>{footnote.text}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issue Info - Stacks at bottom on mobile */}
            <div className="border-t border-border pt-10 text-center space-y-6">
              {/* Cover Image */}
              <div className="w-[100px] mx-auto aspect-[3/4] bg-muted/20 relative overflow-hidden">
                {coverImageUrl ? (
                  <ImageWithFallback
                    src={coverImageUrl}
                    alt={`${magazineName} ${season} ${year} Cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px]">
                    Cover
                  </div>
                )}
              </div>

              {/* Issue Info */}
              <div className="space-y-0.5">
                <div className="text-xs italic">{magazineName}</div>
                <div className="text-[10px]">{season} {year}</div>
                <div className="text-[9px] text-muted-foreground">
                  Volume {volume} Number {number}
                </div>
              </div>

              {/* Subscribe Button */}
              <button className="px-4 py-1 border border-foreground hover:bg-foreground hover:text-background transition-all text-[9px] tracking-wider uppercase">
                Subscribe
              </button>

              {/* Back Button */}
              <button
                onClick={onBack}
                className="text-xs text-muted-foreground hover:opacity-70 transition-opacity block mt-8"
              >
                ← Back to Table of Contents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
