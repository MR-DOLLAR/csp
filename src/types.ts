import { Timestamp } from "firebase/firestore";

export type UserRole = 'student' | 'supervisor' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  staffId?: string;
  department?: string;
  designation?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  profileUpdated: boolean;
}

export interface Proposal {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  introduction: string;
  objectives: string[];
  methodology: string;
  platforms: string[];
  keywords: string[];
  references: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  supervisorId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Report {
  id: string;
  pdfUrl: string;
  pptUrl: string;
  uploadedAt: Timestamp;
  version: number;
}

export interface Comment {
  id: string;
  staffId: string;
  staffName: string;
  message: string;
  createdAt: Timestamp;
}

export interface Evaluation {
  id: string;
  staffId: string;
  innovation: number;
  implementation: number;
  documentation: number;
  presentation: number;
  total: number;
  grade: string;
  remarks: string;
  evaluatedAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: Timestamp;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: Timestamp;
  createdBy: string;
  target: 'all_students' | string; // string could be a department or specific group
}
