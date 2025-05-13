import React, { Component } from "react";
import { ConfigContainer } from "../../styles/ConfigContainer";

import { Header } from "../../styles/global";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Content } from "./styles";
import "./ButtonGrid.css"; // Import the CSS file
import "./stylestwo.css"; // Importe o arquivo de estilos
import { api_spark } from "../Indicators";



const Formulario = () => {
  return (
    <PerfectScrollbar style={{ width: "100%", overflowX: "auto" }}>
      <ConfigContainer size="big" style={{ color: "#000" }}>
        <Header>
          <h1>Análise do AutomL</h1>        
        </Header>

        <Content>        
        <h2>API Spark: {api_spark}</h2>      
        </Content>

        {/* {!data.length && !loading ?
            <StatusMsgContainer> Sem dados para serem exibidos. </StatusMsgContainer>
            : null} */}

        {/*loading ?
            <LoadingContainer>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#EEEEEE" animationDuration=".5s" />
            </LoadingContainer>
          : null*/}
      </ConfigContainer>
    </PerfectScrollbar>
  );
}

export default Formulario;
