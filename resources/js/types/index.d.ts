export interface Jurusan {
    id: number;
    nama_jurusan: string;
    is_active: boolean;
    admins_count?: number;
    mahasiswa_count?: number;
    layanan_count?: number;
    program_studi_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProgramStudi {
    id: number;
    jurusan_id: number;
    nama_prodi: string;
    kode_prodi?: string | null;
    jenjang: string;
    is_active: boolean;
    jurusan?: Jurusan | null;
    mahasiswa_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    jurusan_id?: number | null;
    program_studi_id?: number | null;
    google_id?: string | null;
    avatar?: string | null;
    nim?: string | null;
    angkatan?: number | null;
    role: 'superadmin' | 'admin' | 'mahasiswa';
    is_active: boolean;
    jurusan?: Jurusan | null;
    program_studi?: ProgramStudi | null;
    created_at?: string;
    updated_at?: string;
}

export interface SsoClient {
    id: number;
    layanan_id: number;
    client_id: string;
    client_secret?: string;
    redirect_uri: string;
    is_active: boolean;
    created_by?: number | null;
    layanan?: Layanan | null;
    creator?: User | null;
    created_at?: string;
    updated_at?: string;
}

export interface AuthLog {
    id: number;
    user_id?: number | null;
    event: string;
    email?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    status: 'success' | 'failed' | 'blocked';
    message?: string | null;
    created_at?: string;
    user?: User | null;
}

export interface Layanan {
    id: number;
    jurusan_id: number;
    nama_layanan: string;
    slug: string;
    deskripsi?: string | null;
    icon_url?: string | null;
    url: string;
    tipe_integrasi: 'sso' | 'link_eksternal';
    is_active: boolean;
    urutan: number;
    jurusan?: Jurusan | null;
    sso_client?: SsoClient | null;
    created_at?: string;
    updated_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};
