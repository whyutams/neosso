export interface Jurusan {
    id: number;
    nama_jurusan: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    jurusan_id?: number | null;
    google_id?: string | null;
    avatar?: string | null;
    nim?: string | null;
    angkatan?: number | null;
    role: 'superadmin' | 'admin' | 'mahasiswa';
    is_active: boolean;
    jurusan?: Jurusan | null;
    created_at?: string;
    updated_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
