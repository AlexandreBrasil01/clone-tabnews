import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import { ServiceError } from "infra/errors.js";

//Configurações padrão para a execução
const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;
  try {
    //Cria o client para a conexão com o banco de dados
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      //Caso precise alterar algo das config padrao basta utilizar os ... que sao chamados de spread operator
      // depois passar o atributo que deseja alterar e o novo valor
      ...defaultMigrationOptions,
      dbClient,
    });
    return pendingMigrations;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Erro ao listar as migrations pendentes:",
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    //Cria o client para a conexão com o banco de dados
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      //Caso precise alterar algo das config padrao basta utilizar os ... que sao chamados de spread operator
      // depois passar o atributo que deseja alterar e o novo valor
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Erro ao executar as migrations pendentes:",
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
