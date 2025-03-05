import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
import { DEV_CLIENT_PAGES_MANIFEST } from "next/dist/shared/lib/constants";

export default async function migrations(request, response) {
  //Cria o client para a conexão com o banco de dados
  const dbClient = await database.getNewClient();
  //Configurações padrão para a execução
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      //Caso precise alterar algo das config padrao basta utilizar os ... que sao chamados de spread operator
      // depois passar o atributo que deseja alterar e o novo valor
      ...defaultMigrationOptions,
      dryRun: false,
    });
    await dbClient.end();
    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  }

  return response.status(405).end();
}
