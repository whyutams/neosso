# UI & Code Rules

## Typography
- Strictly forbid `font-mono`. Always use primary font (`Noto Sans` / sans) across all UI elements (including inputs, URLs, IDs, slugs, and table values).

## UI Text Simplification (No AI Slop)
- Keep all UI labels short, natural, and clean:
  - `Nama` instead of `Nama Layanan`
  - `Slug` instead of `Slug Identifier`
  - `URL` instead of `Alamat Web / URL Layanan`
  - `Urutan` instead of `Urutan Kartu di Portal`
  - `Jurusan` instead of `Jurusan Pemilik Layanan`
  - `Deskripsi` instead of `Deskripsi Singkat Layanan`
  - `Aktif` instead of `Aktifkan visibilitas kartu layanan di portal mahasiswa`
  - `Tambah Layanan` instead of `+ Tambah Layanan Baru`
  - `Layanan` instead of `Katalog Layanan Pendidikan`
- Never add developer badges like `CRUD` in menus.
- Never add decorative arrows or symbols to button/link labels (e.g. no `← Kembali`, `Detail →`, or `+ Tambah Layanan`). Use clean plain text like `Kembali`, `Tambah Layanan`, `Detail`.
- Remove redundant helper text under form inputs.

## Code Comments
- Write code comments in **Bahasa Indonesia**.
- Keep comments simple, concise, and minimal.
- Never use numbered points (1., 2., etc.) in comments.
- Avoid over-explaining obvious code.
