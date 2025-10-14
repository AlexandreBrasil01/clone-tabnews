import pg from "pg";
const { Client } = pg;

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject); // ---> passando o SQL como parametro da função
    // const result = await client.query("SELECT $1::text as message", ["Hello world!",]); ---> passando o SQL direto como string
    //console.log(result.rows[0].message); ---> mostrando o resultado da primeira linha
    return result;
  } catch (error) {
    console.log("\n Erro ao conectar com o banco de dados: ");
    console.error(error);
    throw error;
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();
  return client;
}

const database = {
  // Exportar deste modo com os nomes identicos (query: query, getNewClient: getNewClient,)
  //  se torna redundante e pode ser feito como está apos os comentarios
  query,
  getNewClient,
};

export default database;

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV === "production" ? true : false;
}
