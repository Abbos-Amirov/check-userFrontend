-- Zavod ovqat puli — foydalanuvchi ilovasi sxemasi
-- Supabase SQL Editor da ishga tushiring

create table public.users (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  employee_id text unique not null,
  phone text,
  avatar_url text,
  role text default 'worker' check (role in ('worker', 'admin')),
  created_at timestamptz default now()
);

-- Mavjud bazaga: alter table public.users add column if not exists avatar_url text;

create table public.checks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  image_url text not null,
  amount numeric(10,2) default 0,
  store_name text,
  check_date date,
  month text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz default now()
);

create table public.monthly_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  month text not null,
  total_amount numeric(10,2) default 0,
  check_count integer default 0,
  submitted_at timestamptz,
  status text default 'draft' check (status in ('draft', 'submitted', 'paid')),
  unique (user_id, month)
);

alter table public.users enable row level security;
alter table public.checks enable row level security;
alter table public.monthly_reports enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Ishchilar o‘zaro profil (ism, ID) — lenta kartochkalari uchun
create policy "users_select_community" on public.users
  for select to authenticated
  using (true);

create policy "checks_select_own" on public.checks
  for select using (auth.uid() = user_id);

-- Bosh sahifa jamoat lentasi: kirgan foydalanuvchi barcha cheklarni ko‘ra oladi (faqat o‘qish)
create policy "checks_select_community" on public.checks
  for select to authenticated
  using (true);

create policy "checks_insert_own" on public.checks
  for insert with check (auth.uid() = user_id);

create policy "checks_update_own" on public.checks
  for update using (auth.uid() = user_id);

create policy "checks_delete_own" on public.checks
  for delete using (auth.uid() = user_id);

create policy "reports_select_own" on public.monthly_reports
  for select using (auth.uid() = user_id);

create policy "reports_insert_own" on public.monthly_reports
  for insert with check (auth.uid() = user_id);

create policy "reports_update_own" on public.monthly_reports
  for update using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('check-images', 'check-images', true)
on conflict (id) do nothing;

create policy "check_images_authenticated_upload"
on storage.objects for insert to authenticated
with check (bucket_id = 'check-images');

create policy "check_images_public_read"
on storage.objects for select
using (bucket_id = 'check-images');

create policy "check_images_owner_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'check-images');

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Fayl yo‘li: {auth.uid()}/avatar — faqat o‘z papkasi
create policy "avatars_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_select_public"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
