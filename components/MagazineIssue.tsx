import { useState } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Article {
  id: string;
  category: string;
  authors: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

interface MagazineIssueProps {
  magazineName: string;
  season: string;
  year: string;
  volume: string;
  number: string;
  coverImageUrl?: string;
  articles: Article[];
  location?: string;
  weather?: string;
  onBack: () => void;
  onArticleClick: (article: Article) => void;
}

export function MagazineIssue({
  magazineName,
  season,
  year,
  volume,
  number,
  coverImageUrl,
  articles,
  location = "LOS ANGELES",
  weather = "70° CLEAR SKY",
  onBack,
  onArticleClick,
}: MagazineIssueProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar - NO BORDER */}
      <header className="px-6 py-3.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="md:hidden hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <h1 className="text-base italic tracking-tight">{magazineName}</h1>
            
            {/* Desktop Navigation - Green/Olive color */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-3 text-sm">
            <a href="#" className="hover:opacity-70 transition-opacity">Journal</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Online</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Events</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Subscribe</a>
            <a href="#" className="hover:opacity-70 transition-opacity">About</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Support</a>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[280px_1fr]">
          {/* Left Sidebar - Issue Metadata */}
          <div className="px-8 pt-16 pb-12 flex flex-col items-center">
            <div className="w-full space-y-8">
              {/* Issue Info */}
              <div className="text-center space-y-0.5">
                <div className="text-sm">{season} {year}</div>
                <div className="text-xs text-muted-foreground">
                  Volume {volume} Number {number}
                </div>
              </div>

              {/* Cover Image - Smaller */}
              <div className="w-[180px] mx-auto aspect-[3/4] bg-muted/20 relative overflow-hidden">
                {coverImageUrl ? (
                  <ImageWithFallback
                    src={coverImageUrl}
                    alt={`${magazineName} ${season} ${year} Cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Cover
                  </div>
                )}
              </div>

              {/* Subscribe Button */}
              <div className="flex justify-center">
                <button className="px-6 py-1.5 border border-foreground hover:bg-foreground hover:text-background transition-all text-xs tracking-wider uppercase">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Table of Contents */}
          <div className="px-16 pt-16 pb-12">
            <h2 className="text-base mb-12 text-center">Table of Contents</h2>
            
            <div className="grid grid-cols-2 gap-x-16 gap-y-14 max-w-[1100px]">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => onArticleClick(article)}
                  className="text-left group"
                >
                  {/* Category and Authors - Same line, very small */}
                  <div className="flex items-baseline justify-between mb-3 gap-4">
                    <span className="text-[10px] uppercase tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-right">{article.authors}</span>
                  </div>

                  {/* Article Image - Landscape aspect ratio */}
                  <div className="w-full aspect-[3/2] bg-muted/20 mb-4 overflow-hidden">
                    {article.imageUrl ? (
                      <ImageWithFallback
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/15" />
                    )}
                  </div>

                  {/* Article Title */}
                  <h3 className="text-base leading-tight mb-2 group-hover:opacity-70 transition-opacity">
                    {article.title}
                  </h3>

                  {/* Article Subtitle */}
                  {article.subtitle && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {article.subtitle}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Issue Metadata */}
          <div className="px-8 py-12 text-center space-y-8">
            <div className="space-y-0.5">
              <div className="text-sm">{season} {year}</div>
              <div className="text-xs text-muted-foreground">
                Volume {volume} Number {number}
              </div>
            </div>

            {/* Cover Image - Smaller on mobile */}
            <div className="w-[160px] mx-auto aspect-[3/4] bg-muted/20 relative overflow-hidden">
              {coverImageUrl ? (
                <ImageWithFallback
                  src={coverImageUrl}
                  alt={`${magazineName} ${season} ${year} Cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  Cover
                </div>
              )}
            </div>

            {/* Subscribe Button */}
            <button className="px-6 py-1.5 border border-foreground hover:bg-foreground hover:text-background transition-all text-xs tracking-wider uppercase">
              Subscribe
            </button>
          </div>

          {/* Articles */}
          <div className="px-8 pb-12">
            <h2 className="text-base mb-10 text-center">Table of Contents</h2>
            
            <div className="space-y-12">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => onArticleClick(article)}
                  className="text-left w-full group"
                >
                  {/* Category and Authors */}
                  <div className="flex items-baseline justify-between mb-3 gap-4">
                    <span className="text-[10px] uppercase tracking-wider flex-shrink-0">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-right">{article.authors}</span>
                  </div>

                  {/* Article Image */}
                  <div className="w-full aspect-[3/2] bg-muted/20 mb-3 overflow-hidden">
                    {article.imageUrl ? (
                      <ImageWithFallback
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/15" />
                    )}
                  </div>

                  {/* Article Title */}
                  <h3 className="text-base leading-tight mb-2 group-hover:opacity-70 transition-opacity">
                    {article.title}
                  </h3>

                  {/* Article Subtitle */}
                  {article.subtitle && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {article.subtitle}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
