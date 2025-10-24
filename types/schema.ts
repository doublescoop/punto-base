/**
 * PUNTO - Comprehensive Data Schema
 * 
 * This file defines the complete data model for the Punto platform.
 * It includes types for magazines, issues, open calls, submissions, users, and payments.
 * 
 * Design Principles:
 * - All IDs use prefixed strings (e.g., "mag_", "issue_", "user_") for type safety
 * - Timestamps use ISO 8601 strings for consistency
 * - Amounts use numbers (representing USDC cents) to avoid floating point issues
 * - Enums use SCREAMING_SNAKE_CASE for database compatibility
 * - Optional fields use `?` and required fields are explicit
 * - Relationships use ID references, not nested objects (for normalization)
 */

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

/**
 * User - Represents a platform user (can be founder, editor, contributor, or reader)
 */
export interface User {
  id: string; // Format: "user_{uuid}"
  
  // Identity
  walletAddress: string; // Primary identifier (Ethereum address)
  email?: string;
  displayName?: string;
  avatar?: string; // IPFS CID or URL
  bio?: string;
  
  // Social Links
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
    farcaster?: string;
  };
  
  // Platform Roles (can have multiple)
  roles: {
    isFounder: boolean; // Has created at least one magazine
    isEditor: boolean; // Has been added as editor to at least one magazine
    isContributor: boolean; // Has submitted to at least one open call
    isReader: boolean; // Has purchased/accessed at least one issue
  };
  
  // Metadata
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastActiveAt: string; // ISO 8601
}

/**
 * Magazine - A publication created by a founder
 */
export interface Magazine {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline?: string | null;
  cover_image?: string | null;
  logo_image?: string | null;
  theme_id: string;
  accent_colors: string[];
  founder_id: string;
  treasury_address: string;
  default_bounty_amount: number;
  is_public?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Magazine Theme Configuration
 */
export interface MagazineTheme {
  id: string; // e.g., "clean-gallery", "playful-experimental"
  name: string;
  fontFamily: {
    heading: string;
    body: string;
  };
  description: string;
}

/**
 * Magazine Issue - A specific edition of a magazine
 */
export interface MagazineIssue {
  id: string;
  magazine_id: string;
  issue_number: number;
  title?: string | null;
  description?: string | null;
  source_event_id?: string | null;
  source_event_title?: string | null;
  source_event_date?: string | null;
  source_event_location?: string | null;
  source_event_url?: string | null;
  source_event_platform?: string | null;
  status: string;
  deadline: string;
  treasury_address: string;
  required_funding: number;
  current_balance?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
}

/**
 * Issue Status Enum
 */
export type IssueStatus = 
  | 'DRAFT' // Being created by founder
  | 'OPEN_CALLS' // Open calls are active
  | 'IN_REVIEW' // Reviewing submissions
  | 'IN_PRODUCTION' // Accepted content being finalized
  | 'READY_TO_PUBLISH' // All content ready, awaiting publish
  | 'PUBLISHED' // Issue is live
  | 'ARCHIVED'; // Issue is archived

/**
 * Topic - A specific content section/topic within an issue (can be open call or internal)
 */
export interface Topic {
  id: string; // Format: "topic_{uuid}"
  
  // Basic Info
  issueId: string; // Reference to MagazineIssue.id
  title: string;
  description?: string;
  
  // Open Call Configuration
  isOpenCall: boolean; // If false, content is created internally
  format: TopicFormat; // What type of content is expected
  slotsNeeded: number; // How many pieces of content needed
  
  // Open Call Details (only if isOpenCall = true)
  openCallDetails?: {
    bountyAmount: number; // USDC cents per accepted submission
    dueDate: string; // ISO 8601
    guidelines?: string; // Markdown text with submission guidelines
    exampleUrls?: string[]; // Example submissions
  };
  
  // Internal Content (only if isOpenCall = false)
  internalContent?: {
    assignedToUserId?: string; // Reference to User.id
    content?: string; // Markdown or HTML content
    mediaUrls?: string[]; // IPFS CIDs or URLs
  };
  
  // Status
  status: TopicStatus;
  
  // Metadata
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  position: number; // Order in the issue (0-indexed)
  
  // Stats (computed, only for open calls)
  totalSubmissions?: number;
  acceptedSubmissionIds?: string[]; // References to Submission.id
}

/**
 * Topic Format Enum
 */
export type TopicFormat = 
  | 'SHORT_TEXT' // Short form text (< 500 words)
  | 'LONG_TEXT' // Long form text (> 500 words)
  | 'IMAGE' // Single image with caption
  | 'IMAGE_SERIES' // Multiple images with captions
  | 'MIXED_MEDIA' // Combination of text, images, etc.
  | 'OPEN'; // Any format accepted

/**
 * Topic Status Enum
 */
export type TopicStatus = 
  | 'UNFILLED' // No accepted submissions yet
  | 'IN_REVIEW' // Has submissions being reviewed
  | 'ACCEPTED' // Has accepted submissions, not all finalized
  | 'PROOFED' // All content proofed and ready
  | 'READY'; // All slots filled and ready to publish

/**
 * Submission - A contributor's submission to an open call
 */
export interface Submission {
  id: string; // Format: "sub_{uuid}"
  
  // References
  topicId: string; // Reference to Topic.id
  issueId: string; // Reference to MagazineIssue.id (denormalized for queries)
  magazineId: string; // Reference to Magazine.id (denormalized for queries)
  authorId: string; // Reference to User.id
  
  // Content
  title: string;
  description?: string; // Brief description/abstract
  content: string; // Main content (markdown or HTML)
  mediaUrls: string[]; // IPFS CIDs or URLs for images/files
  
  // File Metadata
  fileMetadata?: {
    fileType: string; // e.g., "JPEG", "PNG", "PDF"
    fileSize: number; // Bytes
    dimensions?: {
      width: number;
      height: number;
    };
  };
  
  // IPFS Storage
  ipfsCid?: string; // Content Identifier on IPFS
  
  // Status & Review
  status: SubmissionStatus;
  approvals: SubmissionApproval[]; // Array of editor approvals
  rejectionReason?: string;
  
  // Feedback
  editorNotes?: string; // Private notes from editors
  contributorNotes?: string; // Notes from the contributor
  
  // Payment
  paymentStatus: PaymentStatus;
  bountyAmount: number; // USDC cents
  paidAt?: string; // ISO 8601
  transactionHash?: string; // Blockchain transaction hash
  
  // Metadata
  submittedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  acceptedAt?: string; // ISO 8601
  publishedAt?: string; // ISO 8601
}

/**
 * Submission Status Enum
 */
export type SubmissionStatus = 
  | 'DRAFT' // Being created by contributor (not submitted yet)
  | 'SUBMITTED' // Submitted and awaiting review
  | 'IN_REVIEW' // Being reviewed by editors
  | 'ACCEPTED' // Accepted for publication
  | 'PUBLISHED' // Published in the issue
  | 'REJECTED' // Rejected by editors
  | 'WITHDRAWN'; // Withdrawn by contributor

/**
 * Submission Approval - An editor's approval/rejection of a submission
 */
export interface SubmissionApproval {
  editorId: string; // Reference to User.id
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes?: string;
  timestamp: string; // ISO 8601
}

/**
 * Payment Status Enum
 */
export type PaymentStatus = 
  | 'NOT_APPLICABLE' // Submission not accepted or no payment needed
  | 'PENDING' // Payment scheduled but not yet sent
  | 'PROCESSING' // Payment transaction in progress
  | 'PAID' // Payment successfully sent
  | 'FAILED'; // Payment failed

/**
 * Payment - A payment record for contributors, editors, or founders
 */
export interface Payment {
  id: string; // Format: "pay_{uuid}"
  
  // References
  issueId: string; // Reference to MagazineIssue.id
  magazineId: string; // Reference to Magazine.id
  recipientId: string; // Reference to User.id
  submissionId?: string; // Reference to Submission.id (if payment is for a submission)
  
  // Payment Details
  amount: number; // USDC cents
  currency: 'USDC'; // Currently only USDC
  role: PaymentRole; // What the payment is for
  
  // Status
  status: PaymentStatus;
  
  // Blockchain
  transactionHash?: string;
  blockNumber?: number;
  
  // Metadata
  createdAt: string; // ISO 8601
  paidAt?: string; // ISO 8601
  failedAt?: string; // ISO 8601
  failureReason?: string;
}

/**
 * Payment Role Enum
 */
export type PaymentRole = 
  | 'CONTRIBUTOR' // Payment for accepted submission
  | 'EDITOR' // Editor stipend
  | 'FOUNDER' // Founder stipend
  | 'COMMISSIONED'; // Commissioned internal content

// ============================================================================
// OPEN CALL TYPES (Public-facing)
// ============================================================================

/**
 * OpenCall - Public view of a topic that accepts submissions
 */
export interface OpenCall {
  id: string; // Same as Topic.id
  
  // Magazine Info
  magazineId: string;
  magazineName: string;
  magazineSlug: string;
  magazineCover?: string;
  
  // Issue Info
  issueId: string;
  issueNumber: number;
  
  // Topic Info
  title: string;
  description?: string;
  format: TopicFormat;
  guidelines?: string;
  exampleUrls?: string[];
  
  // Submission Details
  slotsNeeded: number;
  slotsRemaining: number;
  bountyAmount: number; // USDC cents
  dueDate: string; // ISO 8601
  
  // Status
  isActive: boolean; // Whether submissions are still being accepted
  totalSubmissions: number;
  
  // Metadata
  createdAt: string; // ISO 8601
}

// ============================================================================
// TREASURY & FINANCIAL TYPES
// ============================================================================

/**
 * Treasury - Financial tracking for a magazine issue
 */
export interface Treasury {
  id: string; // Format: "treasury_{uuid}"
  
  // References
  issueId: string; // Reference to MagazineIssue.id
  magazineId: string; // Reference to Magazine.id
  
  // Safe Wallet
  safeAddress: string; // Gnosis Safe address
  founderAddress: string; // Founder's wallet (Safe owner)
  
  // Balances (in USDC cents)
  currentBalance: number;
  requiredFunding: number;
  shortfall: number; // Computed: requiredFunding - currentBalance
  
  // Budget Breakdown
  budget: {
    founderStipend: number;
    editorStipends: number;
    contributorBounties: number;
    commissionedContent: number;
    buffer: number; // 10% buffer
  };
  
  // Payment Schedule
  payments: {
    pending: number; // Total pending payments
    processing: number; // Total processing payments
    paid: number; // Total paid
  };
  
  // Metadata
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Create Magazine Request
 */
export interface CreateMagazineRequest {
  name: string;
  description: string;
  tagline?: string;
  theme: string; // Theme ID
  accentColors: string[]; // Max 2 hex colors
  treasuryAddress: string; // Safe wallet address
  defaultBountyAmount: number; // USDC cents
  
  // Optional source event
  sourceEvent?: {
    eventUrl: string;
    eventData: Record<string, unknown>; // Scraped event data
  };
}

/**
 * Create Magazine Response
 */
export interface CreateMagazineResponse {
  success: boolean;
  magazine?: Magazine;
  error?: string;
}

/**
 * Create Issue Request
 */
export interface CreateIssueRequest {
  magazineId: string;
  title?: string;
  description?: string;
  deadline: string; // ISO 8601
  topics: CreateTopicRequest[];
  
  // Optional source event
  sourceEvent?: {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    eventUrl: string;
    platform: 'luma' | 'sociallayer';
  };
}

/**
 * Create Topic Request
 */
export interface CreateTopicRequest {
  title: string;
  description?: string;
  isOpenCall: boolean;
  format: TopicFormat;
  slotsNeeded: number;
  bountyAmount?: number; // USDC cents (required if isOpenCall = true)
  dueDate?: string; // ISO 8601 (required if isOpenCall = true)
  guidelines?: string;
  position: number; // Order in the issue
}

/**
 * Create Issue Response
 */
export interface CreateIssueResponse {
  success: boolean;
  issue?: MagazineIssue;
  topics?: Topic[];
  treasury?: Treasury;
  error?: string;
}

/**
 * Submit to Open Call Request
 */
export interface SubmitToOpenCallRequest {
  topicId: string;
  title: string;
  description?: string;
  content: string;
  mediaUrls: string[]; // IPFS CIDs
  fileMetadata?: {
    fileType: string;
    fileSize: number;
    dimensions?: { width: number; height: number };
  };
  contributorNotes?: string;
}

/**
 * Submit to Open Call Response
 */
export interface SubmitToOpenCallResponse {
  success: boolean;
  submission?: Submission;
  error?: string;
}

/**
 * Review Submission Request
 */
export interface ReviewSubmissionRequest {
  submissionId: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes?: string;
}

/**
 * Review Submission Response
 */
export interface ReviewSubmissionResponse {
  success: boolean;
  submission?: Submission;
  error?: string;
}

// ============================================================================
// FRONTEND STATE TYPES
// ============================================================================

/**
 * User Session State
 */
export interface UserSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * Magazine Dashboard State
 */
export interface MagazineDashboard {
  magazine: Magazine;
  issues: MagazineIssue[];
  activeIssue?: MagazineIssue;
  treasury?: Treasury;
  stats: {
    totalSubmissions: number;
    pendingReviews: number;
    totalContributors: number;
    totalRevenue: number; // USDC cents
  };
}

/**
 * Issue Board State (for founders/editors)
 */
export interface IssueBoard {
  issue: MagazineIssue;
  topics: Topic[];
  submissions: Submission[];
  treasury: Treasury;
  team: {
    founder: User;
    editors: User[];
  };
}

/**
 * Submission Detail State
 */
export interface SubmissionDetail {
  submission: Submission;
  topic: Topic;
  issue: MagazineIssue;
  magazine: Magazine;
  author: User;
  approvals: SubmissionApproval[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * API Error Response
 */
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * API Success Response
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Generic API Response
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

