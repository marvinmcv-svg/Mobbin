create extension if not exists vector;
create extension if not exists pgcrypto;

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

-- 'site' = marketing websites (captured as sections); 'web' = web apps.
create table apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  platform text not null check (platform in ('ios','android','web','site')),
  category_id uuid references categories(id),
  developer text,
  website_url text,
  icon_path text,
  brand_color text,
  version text,
  captured_at date,
  notes text,
  created_at timestamptz default now()
);

create table flows (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references apps(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table screens (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references apps(id) on delete cascade,
  kind text not null default 'screen' check (kind in ('screen','section')),
  flow_id uuid references flows(id) on delete set null,
  flow_position int,
  flow_caption text,
  image_path text not null,
  full_image_path text,             -- full-page capture a section was cropped from
  width int, height int,
  blurhash text,
  phash text,
  dominant_colors text[],
  ocr_text text,
  ai_description text,
  embedding vector(1536),
  search_tsv tsvector,
  save_count int not null default 0,
  status text default 'draft' check (status in ('draft','published','hidden')),
  captured_at date,
  created_at timestamptz default now()
);

create table clips (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references apps(id) on delete cascade,
  screen_id uuid references screens(id) on delete set null,
  video_path text not null,
  poster_path text,
  duration_ms int,
  description text,
  created_at timestamptz default now()
);

create table patterns (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, slug text unique not null,
  scope text not null default 'app' check (scope in ('app','site'))
);
create table ui_elements (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, slug text unique not null
);
create table styles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, slug text unique not null
);
create table screen_patterns (screen_id uuid references screens(id) on delete cascade, pattern_id uuid references patterns(id) on delete cascade, primary key (screen_id, pattern_id));
create table screen_ui_elements (screen_id uuid references screens(id) on delete cascade, element_id uuid references ui_elements(id) on delete cascade, primary key (screen_id, element_id));
create table screen_styles (screen_id uuid references screens(id) on delete cascade, style_id uuid references styles(id) on delete cascade, primary key (screen_id, style_id));

create table users (id uuid primary key default gen_random_uuid(), email text unique, role text default 'member' check (role in ('member','admin')));
create table collections (id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade, name text not null, is_public boolean default false);
create table collection_items (collection_id uuid references collections(id) on delete cascade, screen_id uuid references screens(id) on delete cascade, added_at timestamptz default now(), primary key (collection_id, screen_id));

create table takedown_requests (id uuid primary key default gen_random_uuid(), screen_id uuid references screens(id) on delete set null, reason text, contact text, status text default 'open', created_at timestamptz default now());

create index screens_search_tsv_idx on screens using gin (search_tsv);
create index screens_embedding_idx on screens using hnsw (embedding vector_cosine_ops);
create index screens_app_idx on screens (app_id);
create index screens_flow_idx on screens (flow_id, flow_position);
create index screens_status_created_idx on screens (status, created_at desc);
create index screen_patterns_pattern_idx on screen_patterns (pattern_id);
create index screen_styles_style_idx on screen_styles (style_id);
create index screen_ui_elements_element_idx on screen_ui_elements (element_id);

-- Rebuilds the full-text document for one screen from its own text and its tags.
create or replace function refresh_screen_tsv(target uuid) returns void language sql as $$
  update screens s set search_tsv =
      setweight(to_tsvector('english', coalesce(a.name, '')), 'A')
    || setweight(to_tsvector('english', coalesce((
         select string_agg(p.name, ' ') from screen_patterns sp join patterns p on p.id = sp.pattern_id where sp.screen_id = s.id), '')), 'A')
    || setweight(to_tsvector('english', coalesce((
         select string_agg(st.name, ' ') from screen_styles ss join styles st on st.id = ss.style_id where ss.screen_id = s.id), '')), 'B')
    || setweight(to_tsvector('english', coalesce((
         select string_agg(e.name, ' ') from screen_ui_elements se join ui_elements e on e.id = se.element_id where se.screen_id = s.id), '')), 'B')
    || setweight(to_tsvector('english', coalesce(c.name, '')), 'B')
    || setweight(to_tsvector('english', coalesce(s.ai_description, '')), 'C')
    || setweight(to_tsvector('english', coalesce(s.ocr_text, '')), 'D')
  from apps a left join categories c on c.id = a.category_id
  where s.id = target and a.id = s.app_id;
$$;
