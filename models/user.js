import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneById(id) {
  const userFound = await runSelectQuery(id);
  return userFound;

  async function runSelectQuery(id) {
    const results = await database.query({
      text: `
    SELECT
      *      
    FROM
      users
    WHERE
      id = $1
    LIMIT
      1
    ;`,
      values: [id],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O id de usuário informado não foi encontrado no sistema.",
        action: "Verifique se o id de usário desejado está correto.",
      });
    }

    return results.rows[0];
  }
}

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

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email) {
    const results = await database.query({
      text: `
    SELECT
      *      
    FROM
      users
    WHERE
      LOWER(email) = LOWER($1)
    LIMIT
      1
    ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O email informado não foi encontrado no sistema.",
        action: "Verifique se o email desejado está correto.",
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues) {
  await validateEmailUniqueness(userInputValues.email);
  await validateUsernameUniqueness(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
    INSERT INTO
      users (username, email, password)
    VALUES
      ($1, $2, $3)
    RETURNING
      *
    ;`,
      values: [userInputValues.username, userInputValues.email, userInputValues.password],
    });

    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("email" in userInputValues) {
    await validateEmailUniqueness(userInputValues.email);
  }

  if ("username" in userInputValues) {
    if (userInputValues.username.toLowerCase() !== currentUser.username.toLowerCase()) {
      await validateUsernameUniqueness(userInputValues.username);
    }
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc',now())
      WHERE
        id = $1
      RETURNING
        *
    ;`,
      values: [userWithNewValues.id, userWithNewValues.username, userWithNewValues.email, userWithNewValues.password],
    });

    return results.rows[0];
  }
}

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
      action: "Utilize outro email para realizar esta operação.",
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
      action: "Utilize outro apelido(username) para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashadPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashadPassword;
}

const user = {
  create,
  findOneById,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
