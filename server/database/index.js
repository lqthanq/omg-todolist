const { Client } = require("pg");
const bcrypt = require("bcrypt");

let client;
(async function () {
  try {
    client = new Client({
      connectionString: process.env.DB_CONNECTION_STRING,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    });
    await client.connect();

    // Create users table
    await client.query(`CREATE SEQUENCE IF NOT EXISTS users_id_seq;`);

    await client.query(
      `
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
      `
    );

    // Create tokens table
    await client.query(`CREATE SEQUENCE IF NOT EXISTS tokens_id_seq;`);

    await client.query(
      `
       CREATE TABLE IF NOT EXISTS "public"."tokens" (
        "id" int4 NOT NULL DEFAULT nextval('tokens_id_seq' :: regclass),
        "created_at" timestamptz NOT NULL,
        "user_id" varchar,
        "token" varchar,
        "expire_at" timestamptz,
        PRIMARY KEY ("id")
      );
       `
    );

    // Create tokens table
    await client.query(`CREATE SEQUENCE IF NOT EXISTS tasks_id_seq;`);

    await client.query(
      `
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
        `
    );

    const { rows } = await client.query({
      text: "SELECT * FROM users WHERE email = $1",
      values: ["admin@onemercegroup.com"],
    });

    if (rows.length === 0) {
      const password = await bcrypt.hash("admin", 10);
      await client.query({
        text: "INSERT INTO users(created_at, updated_at, email, password, username) VALUES(NOW(), NOW(), 'admin@onemercegroup.com', $1, 'Admin')",
        values: [password],
      });
    }
  } catch (err) {
    console.error(err);
  }
})();

module.exports = client;
