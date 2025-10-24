-- PUNTO DATABASE SCHEMA FOR SUPABASE
-- Run this in Supabase SQL Editor
-- Last updated: 2025-10-23

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  avatar TEXT,
  bio TEXT,
  
  -- Roles
  is_founder BOOLEAN DEFAULT false,
  is_editor BOOLEAN DEFAULT false,
  is_contributor BOOLEAN DEFAULT false,
  is_reader BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for wallet lookups
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- ============================================================================
-- MAGAZINES TABLE
-- ============================================================================
CREATE TABLE magazines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  tagline TEXT,
  
  -- Visual
  cover_image TEXT,
  logo_image TEXT,
  theme_id TEXT NOT NULL,
  accent_colors TEXT[] NOT NULL,
  
  -- Ownership
  founder_id UUID NOT NULL REFERENCES users(id),
  
  -- Treasury
  treasury_address TEXT NOT NULL,
  default_bounty_amount INTEGER NOT NULL, -- USDC cents
  
  -- Settings
  is_public BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_magazines_slug ON magazines(slug);
CREATE INDEX idx_magazines_founder ON magazines(founder_id);

-- ============================================================================
-- MAGAZINE_EDITORS (Many-to-Many)
-- ============================================================================
CREATE TABLE magazine_editors (
  magazine_id UUID NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (magazine_id, user_id)
);

-- ============================================================================
-- ISSUES TABLE
-- ============================================================================
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  magazine_id UUID NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  
  -- Basic info
  issue_number INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Source event (if post-event zine)
  source_event_id TEXT,
  source_event_title TEXT,
  source_event_date TEXT,
  source_event_location TEXT,
  source_event_url TEXT,
  source_event_platform TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'DRAFT',
  deadline TIMESTAMPTZ NOT NULL,
  
  -- Treasury
  treasury_address TEXT NOT NULL,
  required_funding INTEGER NOT NULL, -- USDC cents
  current_balance INTEGER DEFAULT 0, -- USDC cents
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Unique constraint
  UNIQUE(magazine_id, issue_number)
);

-- Indexes
CREATE INDEX idx_issues_magazine ON issues(magazine_id);
CREATE INDEX idx_issues_status ON issues(status);

-- ============================================================================
-- TOPICS TABLE
-- ============================================================================
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Configuration
  is_open_call BOOLEAN NOT NULL,
  format TEXT NOT NULL,
  slots_needed INTEGER NOT NULL,
  position INTEGER NOT NULL,
  
  -- Open call details (nullable if not open call)
  bounty_amount INTEGER, -- USDC cents
  due_date TIMESTAMPTZ,
  guidelines TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'UNFILLED',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_topics_issue ON topics(issue_id);
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_topics_is_open_call ON topics(is_open_call);

-- ============================================================================
-- SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  magazine_id UUID NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[],
  
  -- IPFS
  ipfs_cid TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
  bounty_amount INTEGER NOT NULL, -- USDC cents
  paid_at TIMESTAMPTZ,
  transaction_hash TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_submissions_topic ON submissions(topic_id);
CREATE INDEX idx_submissions_author ON submissions(author_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_issue ON submissions(issue_id);

-- ============================================================================
-- SUBMISSION_APPROVALS TABLE
-- ============================================================================
CREATE TABLE submission_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL REFERENCES users(id),
  
  -- Decision
  decision TEXT NOT NULL, -- 'APPROVE', 'REJECT', 'REQUEST_CHANGES'
  notes TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint (one approval per editor per submission)
  UNIQUE(submission_id, editor_id)
);

-- Indexes
CREATE INDEX idx_approvals_submission ON submission_approvals(submission_id);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  magazine_id UUID NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id),
  submission_id UUID REFERENCES submissions(id),
  
  -- Payment details
  amount INTEGER NOT NULL, -- USDC cents
  currency TEXT NOT NULL DEFAULT 'USDC',
  role TEXT NOT NULL, -- 'CONTRIBUTOR', 'EDITOR', 'FOUNDER', 'COMMISSIONED'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING',
  
  -- Blockchain
  transaction_hash TEXT,
  block_number INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT
);

-- Indexes
CREATE INDEX idx_payments_issue ON payments(issue_id);
CREATE INDEX idx_payments_recipient ON payments(recipient_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users: Anyone can read, users can update their own profile
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Magazines: Public readable, founders can manage
CREATE POLICY "Magazines are viewable by everyone" ON magazines FOR SELECT USING (is_public = true);
CREATE POLICY "Founders can insert magazines" ON magazines FOR INSERT WITH CHECK (auth.uid()::text = founder_id::text);
CREATE POLICY "Founders can update own magazines" ON magazines FOR UPDATE USING (auth.uid()::text = founder_id::text);

-- Issues: Public readable, founders/editors can manage
CREATE POLICY "Issues are viewable by everyone" ON issues FOR SELECT USING (true);
CREATE POLICY "Founders can manage issues" ON issues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM magazines WHERE magazines.id = issues.magazine_id AND magazines.founder_id::text = auth.uid()::text
  )
);

-- Topics: Public readable, founders/editors can manage
CREATE POLICY "Topics are viewable by everyone" ON topics FOR SELECT USING (true);
CREATE POLICY "Founders can manage topics" ON topics FOR ALL USING (
  EXISTS (
    SELECT 1 FROM issues 
    JOIN magazines ON magazines.id = issues.magazine_id 
    WHERE issues.id = topics.issue_id AND magazines.founder_id::text = auth.uid()::text
  )
);

-- Submissions: Authors and editors can view, authors can create/update
CREATE POLICY "Submissions viewable by author and editors" ON submissions FOR SELECT USING (
  auth.uid()::text = author_id::text OR
  EXISTS (
    SELECT 1 FROM magazine_editors WHERE magazine_editors.magazine_id = submissions.magazine_id AND magazine_editors.user_id::text = auth.uid()::text
  ) OR
  EXISTS (
    SELECT 1 FROM magazines WHERE magazines.id = submissions.magazine_id AND magazines.founder_id::text = auth.uid()::text
  )
);
CREATE POLICY "Authors can create submissions" ON submissions FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);
CREATE POLICY "Authors can update own submissions" ON submissions FOR UPDATE USING (auth.uid()::text = author_id::text);

-- Approvals: Editors can create, everyone can view
CREATE POLICY "Approvals viewable by everyone" ON submission_approvals FOR SELECT USING (true);
CREATE POLICY "Editors can create approvals" ON submission_approvals FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM submissions 
    JOIN magazine_editors ON magazine_editors.magazine_id = submissions.magazine_id 
    WHERE submissions.id = submission_approvals.submission_id AND magazine_editors.user_id::text = auth.uid()::text
  )
);

-- Payments: Viewable by recipient and magazine team
CREATE POLICY "Payments viewable by recipient and team" ON payments FOR SELECT USING (
  auth.uid()::text = recipient_id::text OR
  EXISTS (
    SELECT 1 FROM magazines WHERE magazines.id = payments.magazine_id AND magazines.founder_id::text = auth.uid()::text
  )
);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_magazines_updated_at BEFORE UPDATE ON magazines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA / SEED (Optional)
-- ============================================================================

-- You can add seed data here if needed

-- ============================================================================
-- VIEWS (For easier querying)
-- ============================================================================

-- View for open calls with magazine info
CREATE VIEW open_calls AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.format,
  t.slots_needed,
  t.bounty_amount,
  t.due_date,
  t.guidelines,
  t.status,
  i.id as issue_id,
  i.issue_number,
  m.id as magazine_id,
  m.name as magazine_name,
  m.slug as magazine_slug,
  m.cover_image as magazine_cover,
  (SELECT COUNT(*) FROM submissions WHERE submissions.topic_id = t.id) as total_submissions
FROM topics t
JOIN issues i ON i.id = t.issue_id
JOIN magazines m ON m.id = i.magazine_id
WHERE t.is_open_call = true
  AND t.status != 'READY'
  AND t.due_date > NOW();

-- ============================================================================
-- COMPLETE!
-- ============================================================================
-- Run this entire file in Supabase SQL Editor
-- Then get your API keys and add them to Vercel environment variables

