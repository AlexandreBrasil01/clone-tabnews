import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

//Configurações padrão para a execução
const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  let dbClient;

  try {
    //Cria o client para a conexão com o banco de dados
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({ ...defaultMigrationOptions, dbClient });
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
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

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}
