import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
    SELECT
      *      
    FROM
      users
    WHERE
      LOWER(username) = LOWER($1)
    LIMIT
      1
    ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O nome de usário informado não foi encontrado no sistema.",
        action: "Verifique se o nome de usário desejado está correto.",
      });
    }

    return results.rows[0];
  }
}

async function create(userInputeValues) {
  await validateEmailUniqueness(userInputeValues.email);
  await validateUsernameUniqueness(userInputeValues.username);
  await hashPasswordInObject(userInputeValues);

  const newUser = await runInsertQuery(userInputeValues);
  return newUser;

  async function validateEmailUniqueness(email) {
    const results = await database.query({
      text: `
    SELECT
      email      
    FROM
      users
    WHERE
      LOWER(email) = LOWER($1)
    ;`,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
      });
    }
  }

  async function validateUsernameUniqueness(username) {
    const results = await database.query({
      text: `
    SELECT
      username      
    FROM
      users
    WHERE
      LOWER(username) = LOWER($1)
    ;`,
      values: [username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O apelido(username) informado já está sendo utilizado.",
        action: "Utilize outro apelido(username) para realizar o cadastro.",
      });
    }
  }

  async function hashPasswordInObject(userInputeValues) {
    const hashadPassword = await password.hash(userInputeValues.password);
    userInputeValues.password = hashadPassword;
  }

  async function runInsertQuery(userInputeValues) {
    const results = await database.query({
      text: `
    INSERT INTO
      users (username, email, password)
    VALUES
      ($1, $2, $3)
    RETURNING
      *
    ;`,
      values: [userInputeValues.username, userInputeValues.email, userInputeValues.password],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
