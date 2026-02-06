export interface Pagination<T> {
    current_page: number;
    data: T[];
    last_page: number;
    total: number;
}

export interface Model {
    id: number;
    created_at: string;
    updated_at: string;
}

export interface User extends Model {
    name: string;
    email: string;
    email_verified_at?: string | null;
    assigned_tasks?: Task[];
}

export interface FamilyProfile extends Model {
    family_name: string;
    slug: string;
    status: 'prospect' | 'active' | 'in_follow_up' | 'closed' | string;
    family_photo_path?: string | null;
    current_address?: string | null;
    current_address_link?: string | null;
    construction_address?: string | null;
    construction_address_link?: string | null;
    responsible_member_id?: number | null;
    opened_at: string;
    closed_at?: string | null;
    general_observations?: string | null;
    
    members?: FamilyMember[];
    responsible_member?: FamilyMember;
    visits?: Visit[];
    testimonies?: Testimony[];
    documents?: Document[];
    notes?: Note[];
}

export interface FamilyMember extends Model {
    family_profile_id: number;
    full_name: string;
    paternal_surname: string;
    maternal_surname?: string | null;
    birth_date: string;
    curp?: string | null;
    relationship: string;
    is_responsible: boolean;
    phone?: string | null;
    email?: string | null;
    occupation?: string | null;
    medical_notes?: string | null;
    
    family_profile?: FamilyProfile;
    documents?: Document[];
    notes?: Note[];
}

export interface Group extends Model {
    name: string;
    capacity: number;
    current_members_count: number;
    date_time?: string | null;
    location?: string | null;
    location_link?: string | null;

    applicants?: Applicant[];
}

export interface Applicant extends Model {
    chat_id: string;
    applicant_name?: string | null;
    curp?: string | null;
    gender?: 'man' | 'woman' | string | null;
}

export interface Document extends Model {
    documentable_id: number;
    documentable_type: string;
    document_type: string;
    original_name: string;
    file_path: string;
    mime_type?: string | null;
    size: number;
    uploaded_by: number;

    url?: string;
    uploader?: User;
    documentable?: FamilyProfile | FamilyMember | Visit | Task | any;
}

export interface Note extends Model {
    noteable_id: number;
    noteable_type: string;
    content: string;
    user_id: number;

    author?: User;
    noteable?: FamilyProfile | FamilyMember | Visit | Task | any;
}

export interface Visit extends Model {
    family_profile_id: number;
    attended_by: number;
    status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled' | string;
    scheduled_at: string;
    completed_at?: string | null;
    location_type?: 'current_address' | 'construction_site' | 'office' | 'other' | string | null;
    outcome_summary?: string | null;

    family_profile?: FamilyProfile;
    attendant?: User;
    evidences?: Evidence[];
    tasks?: Task[];
    notes?: Note[];
    documents?: Document[];
}

export interface Evidence extends Model {
    visit_id: number;
    file_path: string;
    taken_by: number;

    url?: string;
    visit?: Visit;
    photographer?: User;
}

export interface Task extends Model {
    visit_id: number;
    title: string;
    description?: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
    priority: 'low' | 'medium' | 'high' | string;
    due_date?: string | null;
    completed_at?: string | null;
    assigned_by: number;
    assigned_to?: number | null;

    visit?: Visit;
    assigner?: User;
    assignee?: User;
    notes?: Note[];
    documents?: Document[];
}

export interface Testimony extends Model {
    family_profile_id: number;
    language: string;
    audio_path?: string | null;
    transcription?: string | null;
    summary?: string | null;
    recorded_by: number;
    recorded_at: string;

    audio_url?: string | null;
    family_profile?: FamilyProfile;
    recorder?: User;
}