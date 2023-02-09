CREATE SEQUENCE IF NOT EXISTS users_id_seq;

CREATE TABLE IF NOT EXISTS "public"."users" (
  "id" int4 NOT NULL DEFAULT nextval('users_id_seq' ::regclass),
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "deleted_at" timestamptz,
  "username" varchar,
  "email" varchar,
  "password" varchar,
  PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS tokens_id_seq;

CREATE TABLE IF NOT EXISTS "public"."tokens" (
  "id" int4 NOT NULL DEFAULT nextval('tokens_id_seq' :: regclass),
  "created_at" timestamptz NOT NULL,
  "user_id" varchar,
  "token" varchar,
  "expire_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS tasks_id_seq;

CREATE TABLE IF NOT EXISTS "public"."tasks" (
  "id" int4 NOT NULL DEFAULT nextval('tasks_id_seq' :: regclass),
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "deleted_at" timestamptz,
  "content" varchar,
  "is_completed" boolean,
  "author_id" int4,
  PRIMARY KEY ("id")
);