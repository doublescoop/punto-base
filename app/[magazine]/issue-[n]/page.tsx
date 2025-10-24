"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MagazineIssue } from "../../../components/MagazineIssue";
import { ArticleDetail } from "../../../components/ArticleDetail";

// Mock magazine issue data
interface MagazineIssueData {
  magazineName: string;
  season: string;
  year: string;
  volume: string;
  number: string;
  coverImageUrl?: string;
  articles: Article[];
}

interface Article {
  id: string;
  category: string;
  authors: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

const mockMagazineIssues: { [key: string]: MagazineIssueData } = {
  "concrete-light-12": {
    magazineName: "Concrete & Light",
    season: "Fall",
    year: "2024",
    volume: "12",
    number: "3",
    coverImageUrl: undefined,
    articles: [
      {
        id: "art-1",
        category: "Conversation",
        authors: "Kaja Silverman and Carrie Schneider",
        title: "Future Shock",
        subtitle: "Many people who all around me will ultimately reach for mine in the middle of the night—and find it under my pillow, although I don't remember putting it there.",
        imageUrl: undefined,
      },
      {
        id: "art-2",
        category: "REVIEW",
        authors: "Anuradha Vikram",
        title: "Uncanny Views: Reflections on the Human in the Age of AI",
        subtitle: "Uncanny Valley: Being Human in the Age of AI by Young Museum, San Francisco February 12, 2020-June 27, 2021",
        imageUrl: undefined,
      },
      {
        id: "art-3",
        category: "Conversation",
        authors: "Phil Chang and John Zujiang Wu",
        title: "Not Art, Not Yet Art",
        subtitle: "A conversation about the boundaries of artistic practice and commercial work.",
        imageUrl: undefined,
      },
      {
        id: "art-4",
        category: "ARTIST'S PROJECT",
        authors: "John Zujiang Wu",
        title: "Office Suite",
        subtitle: "Photographic documentation of abandoned commercial spaces in Los Angeles.",
        imageUrl: undefined,
      },
    ],
  },
  "ephemera-quarterly-8": {
    magazineName: "Ephemera Quarterly",
    season: "Winter",
    year: "2024",
    volume: "8",
    number: "4",
    coverImageUrl: undefined,
    articles: [
      {
        id: "art-5",
        category: "Essay",
        authors: "Marcus Webb",
        title: "Urban Archaeologies",
        subtitle: "Excavating memory through the built environment.",
        imageUrl: undefined,
      },
      {
        id: "art-6",
        category: "Portfolio",
        authors: "Elena Martinez",
        title: "Concrete Dreams",
        subtitle: "A photographic series exploring brutalist architecture.",
        imageUrl: undefined,
      },
    ],
  },
};

// Mock article content with footnotes
interface Footnote {
  number: number;
  text: string;
}

const mockArticleContent: { [key: string]: { content: string; footnotes: Footnote[] } } = {
  "art-1": {
    content: "Many people who all around me will ultimately reach for mine in the middle of the night-and find it under my pillow, although I don't remember putting it there.\n\nThis conversation explores the boundaries between the conscious and unconscious, the remembered and forgotten. We discuss how technology mediates our relationship with memory and how the digital realm creates new forms of intimacy and distance.\n\nThe future is already here, but it's unevenly distributed. We find ourselves caught between nostalgia for a past that never quite existed and anxiety about a future we can barely imagine.",
    footnotes: [
      { number: 1, text: 'Kaja Silverman, "The Acoustic Mirror: The Female Voice in Psychoanalysis and Cinema" (Bloomington: Indiana University Press, 1988), 72.' },
      { number: 2, text: 'See also Vivian Sobchack, "The Address of the Eye: A Phenomenology of Film Experience" (Princeton: Princeton University Press, 1992).' },
      { number: 3, text: 'William Gibson, "The Future Is Already Here - It\'s Just Not Very Evenly Distributed," interview in The Economist, December 4, 2003.' },
    ]
  },
  "art-2": {
    content: "Uncanny Valley: Being Human in the Age of AI opened at the de Young Museum in San Francisco on February 12, 2020, just weeks before the pandemic would fundamentally alter our relationship with technology and each other.\n\nThe exhibition's title refers to the unsettling feeling we experience when confronted with robots or AI that appear almost, but not quite, human. This gap-the uncanny valley-becomes a metaphor for our contemporary condition, caught between the organic and the synthetic, the real and the simulated.\n\nWhat does it mean to be human in an age where machines can generate art, compose music, and write poetry? The exhibition doesn't offer easy answers, but instead presents a series of provocations that force us to confront our assumptions about consciousness, creativity, and what makes us uniquely human.",
    footnotes: [
      { number: 1, text: 'Masahiro Mori, "The Uncanny Valley," first published in 1970, reprinted in IEEE Robotics and Automation Magazine (June 2012).' },
      { number: 2, text: 'See Sigmund Freud, "The Uncanny" (1919), in The Standard Works of Sigmund Freud, vol. 17.' },
      { number: 3, text: 'Hito Steyerl, "A Sea of Data: Apophenia and Pattern (Mis-)Recognition," in How Not to Be Seen: A Fucking Didactic Educational .MOV File (New York and London: Verso, 2017).' },
      { number: 4, text: 'Jan Cheng, "The Out of Place and the Out of Time: Loneliness and the Weird," The Weird and the Eerie (London: Repeater Books, 2016).' },
      { number: 5, text: 'Mark Fisher, "The Out of Place and the Out of Time: Loneliness and the Weird," The Weird and the Eerie (London: Repeater Books, 2016).' },
    ]
  },
  "art-3": {
    content: "The conversation begins with a simple question: When does a commercial project become art? Or perhaps more accurately, when does art become merely commercial?\n\nThese boundaries have always been porous. We discuss the history of artists working on commission, from Renaissance masters to contemporary designers. The difference today is the speed and scale of production, the constant pressure to monetize creativity.\n\nYet there's something liberating in this ambiguity. By refusing to draw strict lines between art and commerce, we open up new possibilities for practice, new ways of thinking about value and meaning in creative work.",
    footnotes: []
  },
  "art-4": {
    content: "Office Suite documents the remnants of late capitalism's infrastructure: abandoned call centers, empty cubicle farms, forsaken break rooms with their fluorescent lights still humming.\n\nThese spaces were designed for efficiency, for the smooth operation of bureaucratic machinery. Now, emptied of their human occupants, they reveal something else: the melancholy beauty of functional architecture stripped of its function.\n\nThe photographs don't mourn or celebrate these spaces. They simply observe, allowing the viewer to project their own feelings about labor, obsolescence, and the future of work onto these vacant rooms.",
    footnotes: [
      { number: 1, text: 'Michel Foucault, "Discipline and Punish: The Birth of the Prison," trans. Alan Sheridan (New York: Vintage Books, 1977).' },
      { number: 2, text: 'See also Georges Perec, "Species of Spaces and Other Pieces," ed. and trans. John Sturrock (London: Penguin Books, 1997).' },
    ]
  },
  "art-5": {
    content: "The plaza was never just a plaza. It was a stage for daily life, a commons where strangers became neighbors through the simple act of coexistence. When the city council announced plans to privatize the space, transforming it into a shopping center, something fundamental was lost. Public space is not empty space waiting to be filled with commerce. It is the very fabric of democracy, the physical manifestation of our social contract...",
    footnotes: []
  },
  "art-6": {
    content: "Concrete Dreams explores the intersection of brutalist architecture and human emotion. Through a series of carefully composed photographs, Elena Martinez captures the raw beauty of concrete structures that have been dismissed as cold and inhuman.\n\nEach image tells a story of resilience, of buildings that stand as monuments to both human ambition and the passage of time. The harsh angles and exposed materials become a canvas for light and shadow, creating compositions that are both geometric and deeply emotional.",
    footnotes: []
  },
};

export default function IssuePage() {
  const router = useRouter();
  const params = useParams();
  const magazineName = params.magazine as string;
  const issueNumber = params.n as string;
  
  const [view, setView] = useState<"issue" | "article">("issue");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Generate the issue key based on magazine and issue number
  const issueKey = `${magazineName}-${issueNumber}`;
  const issue = mockMagazineIssues[issueKey];

  // If issue doesn't exist, redirect or show error
  if (!issue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-mono text-2xl">Issue Not Found</h1>
          <p className="text-muted-foreground">
            The issue you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/opencalls")}
            className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg"
          >
            Browse Open Calls
          </button>
        </div>
      </div>
    );
  }

  // Handle article view
  if (view === "article" && selectedArticle) {
    const articleData = mockArticleContent[selectedArticle.id] || { 
      content: "Article content coming soon...", 
      footnotes: [] 
    };
    
    return (
      <ArticleDetail
        category={selectedArticle.category}
        authors={selectedArticle.authors}
        title={selectedArticle.title}
        subtitle={selectedArticle.subtitle}
        imageUrl={selectedArticle.imageUrl}
        content={articleData.content}
        footnotes={articleData.footnotes}
        magazineName={issue.magazineName}
        season={issue.season}
        year={issue.year}
        volume={issue.volume}
        number={issue.number}
        coverImageUrl={issue.coverImageUrl}
        onBack={() => setView("issue")}
      />
    );
  }

  // Handle issue view
  return (
    <MagazineIssue
      {...issue}
      onBack={() => router.push("/opencalls")}
      onArticleClick={(article: Article) => {
        setSelectedArticle(article);
        setView("article");
      }}
    />
  );
}
