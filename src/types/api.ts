export interface Pagination<T> {
    current_page: number;
    data: T[];
    last_page: number;
    total: number;
}

export interface Member {
    id: number;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    birth_date: string;
    curp: string;
    relationship: string;
    phone: string;
    occupation: string;
    role: string;
}

export interface FamilyProfile {
    id: number;
    family_name: string;
    slug: string;
    status?: string;
    members: Member[];
    responsible_member?: Member;
    current_address?: string;
    construction_address?: string;
    opened_at?: string;
    closed_at?: string;
    updated_at?: string;
    documents?: Document[];
    general_observations?: string;
}

export interface Document {
    id: number;
    document_type: string;
}

export interface Visit {
    id: number;
    family_profile_id: number;
    attended_by: number;
    status: string;
    scheduled_at: string;
    completed_at?: string;
    location_type?: string;
    outcome_summary?: string;
    created_at?: string;
    updated_at?: string;
    family_profile: FamilyProfile;
    attendant?: {
        id: number;
        name: string;
    };
    notes: any[];
    documents: any[];
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}
