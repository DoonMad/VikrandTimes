-- create profiles
create table if not exists profiles(
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    name text not null,
    dob date,
    phone text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- update RLS for profiles
alter table profiles enable row level security;
create policy "Users can create their own profile" on profiles for insert to authenticated with check (user_id = auth.uid());
create policy "Users can read their own profile" on profiles for select to authenticated using (user_id = auth.uid());
create policy "Users can update their own profile" on profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());