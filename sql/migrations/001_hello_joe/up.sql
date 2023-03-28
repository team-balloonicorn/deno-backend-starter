-- A trigger function function to update the updated_at column to the current
-- time. This is to be used in a trigger on the tables to be updated.
create or replace function update_updated_at()
  returns trigger as $$
begin
  new.updated_at = now() at time zone 'utc';
  return new;
end
$$ language plpgsql;

create table users
( id integer primary key generated always as identity
  
, name character varying(255) not null
    constraint name_length check (char_length(name) > 0)

, email character varying(255) not null
    constraint email_unique unique
    constraint email_valid check (email ~* '^.+@.+\..+$')

, inserted_at timestamp not null default (now() at time zone 'utc')
, updated_at timestamp not null default (now() at time zone 'utc')
);

-- Automatically update the updated_at column when a row is updated.
create trigger users_updated_at
  before update on users
  for each row
  execute procedure update_updated_at();
