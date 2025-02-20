import pg from "pg";
const { Client } = pg;

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  try {
    await client.connect();
    const result = await client.query(queryObject); // ---> passando o SQL como parametro da função
    // const result = await client.query("SELECT $1::text as message", ["Hello world!",]); ---> passando o SQL direto como string
    //console.log(result.rows[0].message); ---> mostrando o resultado da primeira linha
    return result;
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados: ", error);
    throw error;
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  process.env.NODE_ENV === "development" ? false : true;
}
