import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <VersionDB />
      <MaxConnectionsDB />
      <OpenedConnectionsDB />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let updatedAtText = "Carregando...";
  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <div>Última atualização: {updatedAtText}</div>;
}

function VersionDB() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let versinDBText = "Carregando...";
  if (!isLoading && data) {
    versinDBText = data.dependencies.database.version;
  }
  return <div>Versão do Banco de dados: {versinDBText}</div>;
}

function MaxConnectionsDB() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let maxConnText = "Carregando...";
  if (!isLoading && data) {
    maxConnText = data.dependencies.database.max_connections;
  }
  return <div>N° máximo de conexões: {maxConnText}</div>;
}

function OpenedConnectionsDB() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let numConnText = "Carregando...";
  if (!isLoading && data) {
    numConnText = data.dependencies.database.opened_connections;
  }
  return <div>N° de conexões abertas: {numConnText}</div>;
}
