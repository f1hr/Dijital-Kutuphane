create table books (
  id bigint generated always as identity primary key,
  slug text unique not null,
  title text not null,
  author text not null,
  cover_color text not null default '#C4873A',
  read_date text not null default '',
  created_at timestamptz not null default now()
);

create table quotes (
  id bigint generated always as identity primary key,
  book_id bigint not null references books(id) on delete cascade,
  page integer,
  chapter text,
  text text not null,
  analysis text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
