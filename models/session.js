import crypto from "node:crypto";
import database from "infra/database";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30; //30 dias em Milisegundos

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt, createdAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt, createdAt) {
    const results = await database.query({
      text: `
    INSERT INTO
      sessions (token, user_id, expires_at, created_at)
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      *
    ;`,
      values: [token, userId, expiresAt, createdAt],
    });

    return results.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
