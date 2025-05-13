import React, { useState, useEffect } from "react";
import { ConfigContainer } from "../../styles/ConfigContainer";
import { Header } from "../../styles/global";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Content } from "./styles";
import { api_spark } from "../Indicators";
import api from "../../services/api";
import { SpinnerContainer, Spinner, Message } from "./styles";
import ComponentComTooltip from "./styles";
import "./styles.css";

const Formulario = () => {
  const [loading, setLoading] = useState(true); 
  const [responseData, setResponseData] = useState(null); 
  const [fileName, setFileName] = useState(""); 

  useEffect(() => {
    const fetchFromSparkAPI = async () => {
      try {
        const response = await api.get(api_spark);
        setResponseData(response.data);

        const resultado = response.data.resultado.split("\n");
        if (resultado.length > 1) {
          const fileNameFromResponse = resultado[1].split(/\s+/)[0];
          setFileName(`${fileNameFromResponse}.zip`);
        }
        
        setLoading(false); 

      } catch (error) {
        console.error("Erro ao fazer o POST para a API:", error);
      }
    };

    fetchFromSparkAPI(); 
  }, []); 

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `http://127.0.0.1:8000/modelo?model=${fileName}`;
    link.download = fileName;
    link.click();
  };

  const formatModelId = (modelId) => {
    if (modelId.startsWith('DRF')) {
      return `Distributed Random Forest ${modelId}`;
    } else if (modelId.startsWith('GBM')) {
      return `Gradient Boost Machine ${modelId}`;
    } else if (modelId.startsWith('GLM')) {
      return `Generalized Linear Model ${modelId}`;
    } else if (modelId.startsWith('XRT')) {
      return `Extreme Random Forest ${modelId}`;
    } else {
      return modelId;
    }
  };

  return (
    <PerfectScrollbar style={{ width: "100%", overflowX: "auto" }}>
      <ConfigContainer size="big" style={{ color: "#000" }}>
        <Header>
          <h1>Análise do AutoML</h1>        
        </Header>

        <Content>
          {loading ? ( 
            <div>
              <SpinnerContainer>              
                <Spinner />
                <Message> O treinamento de AutoML iniciou-se...</Message>
              </SpinnerContainer>                          
            </div> 
          ) : (
            <div>
              {responseData && responseData.resultado ? (
                <div>
                  {responseData.resultado.model_id}
                  {responseData.resultado.includes("auc") ? (
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th style={{ width: "400px" }}>Identificação do modelo </th>
                          <th style={{ width: "200px" }}>Acurácia <ComponentComTooltip text="Quanto maior a acurácia, melhor é a capacidade do modelo de classificação em distinguir entre as classes. Uma acurácia de 1 indica um modelo perfeito que é capaz de distinguir perfeitamente entre as classes." /></th>
                          <th style={{ width: "150px", display: "none" }}> Log Loss <ComponentComTooltip text="O resultado do cálculo do Log-Loss é um valor numérico que indica o quão bem o modelo está se ajustando aos dados de teste. Quanto menor o valor do Log-Loss, melhor é a performance do modelo." /></th>
                          <th style={{ width: "150px", display: "none" }}>AUCPR <ComponentComTooltip text="AUCPR = 1 significa que seu modelo sempre prevê corretamente as classes positivas e negativas" /></th>
                          <th style={{ width: "300px" }}>Erro Médio por Classe <ComponentComTooltip text="Erro Médio por Classe (Mean Class Error) é uma métrica usada para avaliar a performance de um modelo de classificação, especialmente em problemas com múltiplas classes. Ele calcula a média dos erros de classificação para cada classe individualmente. Quanto menor o valor do Erro Médio por Classe, melhor é o desempenho do modelo, indicando que o modelo está fazendo menos erros ao classificar os dados em cada classe." /></th>
                          <th style={{ width: "150px" }}>RMSE <ComponentComTooltip text="A Raiz do Erro Quadrático Médio (RMSE) é uma medida semelhante ao Erro Quadrático Médio (MSE), mas é calculada tomando a raiz quadrada do valor médio dos quadrados dos erros entre as previsões do modelo e os valores reais. Quanto menor o valor do RMSE, melhor é o desempenho do modelo, indicando que as previsões do modelo estão mais próximas dos valores reais." /></th>
                          <th style={{ width: "100px" }}>MSE <ComponentComTooltip text="Quanto menor o valor do MSE, melhor é o desempenho do modelo, indicando que os valores previstos estão mais próximos dos valores reais. Em resumo, um valor baixo de MSE significa que o modelo tem uma precisão mais alta em suas previsões." /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {responseData.resultado.split("\n").map((row, index) => {
                          const rowData = row.trim().split(/\s+/);

                          if (rowData[0].startsWith("lb:")) {
                            return null; // Ignorar a linha
                          }

                          if (rowData[0].startsWith("[")) {
                            return null; // Ignorar a linha
                          }

                          return (
                            <tr key={index}>
                              {rowData.map((data, dataIndex) => (
                                (dataIndex !== 2 && dataIndex !== 3) ? (
                                  <td key={dataIndex} style={{ textAlign: dataIndex !== 0 ? 'center' : 'left' }}>
                                    {dataIndex === 0 ? formatModelId(data) : data}
                                  </td>
                                ) : null
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th style={{ width: "400px" }}>Identificação do modelo</th>
                          <th style={{ width: "300px" }}>Erro Médio por Classe <ComponentComTooltip text="Erro Médio por Classe (Mean Class Error) é uma métrica usada para avaliar a performance de um modelo de classificação, especialmente em problemas com múltiplas classes. Ele calcula a média dos erros de classificação para cada classe individualmente. Quanto menor o valor do Erro Médio por Classe, melhor é o desempenho do modelo, indicando que o modelo está fazendo menos erros ao classificar os dados em cada classe." /></th>
                          <th style={{ width: "150px" }}>LogLoss<ComponentComTooltip text="Log loss, também conhecida como perda logarítmica ou entropia cruzada, é uma função de custo usada para avaliar a performance de modelos de classificação. Ela mede o quão próximas as probabilidades previstas pelo modelo estão das etiquetas verdadeiras." /></th>
                          <th style={{ width: "150px" }}>RMSE <ComponentComTooltip text="A Raiz do Erro Quadrático Médio (RMSE) é uma medida semelhante ao Erro Quadrático Médio (MSE), mas é calculada tomando a raiz quadrada do valor médio dos quadrados dos erros entre as previsões do modelo e os valores reais. Quanto menor o valor do RMSE, melhor é o desempenho do modelo, indicando que as previsões do modelo estão mais próximas dos valores reais." /></th>
                          <th style={{ width: "100px" }}>MSE <ComponentComTooltip text="Quanto menor o valor do MSE, melhor é o desempenho do modelo, indicando que os valores previstos estão mais próximos dos valores reais. Em resumo, um valor baixo de MSE significa que o modelo tem uma precisão mais alta em suas previsões." /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {responseData.resultado.split("\n").map((row, index) => {
                          const rowData = row.trim().split(/\s+/);

                          if (rowData[0].startsWith("lb:")) {
                            return null; // Ignorar a linha
                          }

                          if (rowData[0].startsWith("[")) {
                            return null; // Ignorar a linha
                          }

                          return (
                            <tr key={index}>
                              {rowData.map((data, dataIndex) => (
                                <td key={dataIndex} style={{ textAlign: dataIndex !== 0 ? 'center' : 'left' }}>
                                  {dataIndex === 0 ? formatModelId(data) : data}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  <button className="download-button" onClick={handleDownload}>Baixar Modelo</button>
                </div>
              ) : (
                <p>Nenhum dado disponível</p>
              )}
            </div>
          )}
        </Content>
      </ConfigContainer>
    </PerfectScrollbar>
  );
}

export default Formulario;
