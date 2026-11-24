-- מחירונים ותמחור יומני עבודה (נ.ג.ש)
create table if not exists public.ngs_pricers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create or replace function public.app_can_price() returns boolean
language sql stable security definer set search_path = public as $$
  select public.app_is_admin() and exists (select 1 from public.ngs_pricers where user_id = auth.uid())
$$;

create table if not exists public.ngs_price_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.ngs_price_items (
  id uuid primary key default gen_random_uuid(),
  price_list_id uuid not null references public.ngs_price_lists(id) on delete cascade,
  code text,
  description text not null,
  unit text,
  price numeric(12,2) not null default 0,
  category text,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index if not exists ngs_price_items_list_idx on public.ngs_price_items(price_list_id, sort_order);

create table if not exists public.ngs_work_log_lines (
  id uuid primary key default gen_random_uuid(),
  work_log_id uuid not null references public.ngs_work_logs(id) on delete cascade,
  price_item_id uuid references public.ngs_price_items(id) on delete set null,
  code text,
  description text not null,
  unit text,
  qty numeric(12,2) not null default 1,
  base_price numeric(12,2) not null default 0,   -- מחיר המחירון ברגע ההוספה
  line_pct numeric(6,2) not null default 0,      -- תוספת/הנחה שקטה באחוזים
  sort_order int default 0,
  created_at timestamptz default now()
);
create index if not exists ngs_work_log_lines_log_idx on public.ngs_work_log_lines(work_log_id, sort_order);

alter table public.ngs_work_logs
  add column if not exists price_list_id uuid references public.ngs_price_lists(id) on delete set null,
  add column if not exists priced_at timestamptz,
  add column if not exists priced_by text;

alter table public.ngs_pricers enable row level security;
alter table public.ngs_price_lists enable row level security;
alter table public.ngs_price_items enable row level security;
alter table public.ngs_work_log_lines enable row level security;

create policy pricers_read on public.ngs_pricers for select to authenticated using (public.app_is_admin());
create policy pricers_write on public.ngs_pricers for all to authenticated using (public.app_can_price()) with check (public.app_can_price());

create policy price_lists_read on public.ngs_price_lists for select to authenticated using (public.app_is_admin());
create policy price_lists_write on public.ngs_price_lists for all to authenticated using (public.app_can_price()) with check (public.app_can_price());

create policy price_items_read on public.ngs_price_items for select to authenticated using (public.app_is_admin());
create policy price_items_write on public.ngs_price_items for all to authenticated using (public.app_can_price()) with check (public.app_can_price());

create policy wl_lines_read on public.ngs_work_log_lines for select to authenticated using (public.app_is_admin());
create policy wl_lines_write on public.ngs_work_log_lines for all to authenticated using (public.app_can_price()) with check (public.app_can_price());

-- גל ונסים מורשים לתמחר
insert into public.ngs_pricers(user_id)
select id from public.profiles where role = 'admin' and trim(full_name) in ('גל מזרחי', 'נסים מזרחי')
on conflict do nothing;
