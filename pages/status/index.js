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
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let statusText = "Carregando...";

  if (!isLoading && data) {
    let updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    let versinDBText = data.dependencies.database.version;
    let maxConnText = data.dependencies.database.max_connections;
    let numConnText = data.dependencies.database.opened_connections;
    statusText = (
      <>
        <div>Última atualização: {updatedAtText}</div>
        <div>Versão do Banco de dados: {versinDBText}</div>
        <div>N° máximo de conexões: {maxConnText}</div>
        <div>N° de conexões abertas: {numConnText}</div>
      </>
    );
  }
  return <div>{statusText}</div>;
}
