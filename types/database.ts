export type UserRole = 'client' | 'musician';
export type MusicianType = 'solo' | 'band' | 'session' | 'teacher';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type MediaType = 'photo' | 'audio';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
}

export interface MusicianProfile {
  id: string;
  musician_type: MusicianType;
  bio: string | null;
  genres: string[];
  hourly_rate: number;
  years_experience: number | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  is_available: boolean;
  avg_rating: number;
  review_count: number;
  // joined
  profile?: Profile;
}

export interface MusicianMedia {
  id: string;
  musician_id: string;
  media_type: MediaType;
  storage_path: string;
  display_name: string | null;
  sort_order: number;
  created_at: string;
}

export interface Availability {
  id: string;
  musician_id: string;
  starts_at: string;
  ends_at: string;
  is_blocked: boolean;
}

export interface Booking {
  id: string;
  client_id: string;
  musician_id: string;
  status: BookingStatus;
  event_type: string;
  event_date: string;
  duration_hours: number;
  location: string;
  notes: string | null;
  quoted_amount: number;
  platform_fee: number;
  musician_payout: number;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  paid_at: string | null;
  completed_at: string | null;
  created_at: string;
  // joined
  client?: Profile;
  musician?: MusicianProfile;
}

export interface Conversation {
  id: string;
  booking_id: string | null;
  client_id: string;
  musician_id: string;
  created_at: string;
  // joined
  other_user?: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  musician_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // joined
  reviewer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking_request' | 'message' | 'review' | 'payout' | 'booking_confirmed' | 'booking_completed';
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}
