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


-- creating a function to create the profiles table when user verifies his email
create or replace function handle_email_confirmed_user()
returns trigger as $$
begin
  -- Create profile ONLY when email gets confirmed
  if old.email_confirmed_at is null
     and new.email_confirmed_at is not null then

    insert into profiles (user_id, name, dob, phone)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', ''),
      (new.raw_user_meta_data->>'dob')::date,
      new.raw_user_meta_data->>'phone'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql
security definer
set search_path = public;

-- this code creates the trigger for this function.
create trigger on_auth_user_email_confirmed
after update on auth.users
for each row
execute procedure handle_email_confirmed_user();
