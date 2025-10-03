export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  email: string;
  credits: number;
  unlockedTools: string[]; // Array of tool IDs
  createdAt: number;
  isAdmin?: boolean;
}
export interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  tags: string[];
  imageUrl: string;
  content: string; // The actual tool content/URL after unlocking
  rating: number;
  reviewCount: number;
}
export type AuthResponse = {
  user: User;
  // In a real app, this would be a JWT token
  token: string;
};
export interface Contribution {
  id: string;
  userId: string;
  userEmail: string;
  toolName: string;
  toolUrl: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
export interface Review {
  id:string;
  userId: string;
  userEmail?: string; // To display user info without joining
  toolId: string;
  rating: number;
  comment: string;
  createdAt: number;
}
export interface HeadlineRequest {
  topic: string;
  tone: 'Professional' | 'Casual' | 'Bold' | 'Witty' | 'Informative';
}
export interface HeadlineResponse {
  headlines: string[];
}
export interface ABTestRequest {
  visitorsA: number;
  conversionsA: number;
  visitorsB: number;
  conversionsB: number;
}
export interface ABTestResponse {
  rateA: number;
  rateB: number;
  zScore: number;
  pValue: number;
  significant: boolean;
  winner: 'A' | 'B' | 'None';
  confidence: string;
}
export interface SubjectLineRequest {
  subjectLine: string;
}
export interface SubjectLineFeedback {
  type: 'success' | 'warning' | 'info';
  message: string;
}
export interface SubjectLineResponse {
  score: number; // 0-100
  feedback: SubjectLineFeedback[];
}