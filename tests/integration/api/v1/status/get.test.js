import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("Get to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
  const responseBody = await response.json();

  //Testa se a propriedade updated_at existe
  //expect(responseBody.updated_at).toBeDefined();

  //Testa se a propriedade é uma data no formato ISO
  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

  //Testa se a propriedade updated_at é a data atual pegando até a hora, este teste pode vir a falhar em algum momento
  // const parsedUpdatedAtNow = new Date().toISOString();
  // expect(responseBody.updated_at.slice(0, 13)).toEqual(parsedUpdatedAt.slice(0, 13),);

  //Testa se a versão do banco de dados é a mesma que foi definida no arquivo de configuração
  expect(responseBody.dependencies.database.version).toEqual("16.0");

  //Testa se o número maximo de conexoes c/ banco de dados é a mesma que o padrao do postgres no db local
  expect(responseBody.dependencies.database.max_connections).toEqual(100);

  //Testa se o número de conexoes abertas é 1
  expect(responseBody.dependencies.database.opened_connections).toEqual(1);
});
