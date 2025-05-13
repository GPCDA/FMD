import React from "react";
import { ConfigContainer } from "../../styles/ConfigContainer";

import { Header } from "../../styles/global";
import PerfectScrollbar from "react-perfect-scrollbar";
import { LeftContent, Content, Separator } from "./styles";
import Button from "../../styles/Button";
import "./ButtonGrid.css"; 
import "./stylestwo.css"; 

// class ConfigurarIntegracao extends Component {
//   state = {
//     url: "Valor Padrão do IP",
//     token: "Valor Padrão da Chave de API",
//     version: null, 
//   };

//   handleChangeInput = (e) => {
//     this.setState({ [e.target.name]: e.target.value });
//   };

//   handleChangeVersion = (selectedOption) => {
//     this.setState({ version: selectedOption });
//   };
// }

const Formulario = () => {
  return (
    <PerfectScrollbar style={{ width: "100%", overflowX: "auto" }}>
      <ConfigContainer size="big" style={{ color: "#000" }}>
        <Header>
          <h1>Administração Cluster</h1>
        </Header>

        <Content>
          <LeftContent>
          <div className="button-grid">
            <Button onClick={() => window.open('http://localhost:8088/cluster', '_blank')}>Hadoop</Button>
            <Button onClick={() => window.open('http://localhost:50070/dfshealth.html#tab-overview', '_blank')}>HDFS</Button>
            <Button onClick={() => window.open('http://localhost:8080', '_blank')}>WebUI Spark Master</Button>
          </div>
          </LeftContent>
          <Separator> </Separator>
          <div className="form-content">
            {" "}
            {/* Aplicando a classe form-content */}
            <div>
              <label htmlFor="url" className="label-style">
                Master IP Adress:
              </label>
              <input
                type="text"
                id="url"
                name="url"
                className="input-style"
                defaultValue="10.5.0.2"
              />
            </div>
            <div>
              <label htmlFor="port" className="label-style">
                Django Port:
              </label>
              <input
                type="text"
                id="port"
                name="port"
                className="input-style"
                defaultValue="8000"
              />
            </div>
            <div>
              <label htmlFor="mode" className="label-style">
                Deploy Mode:
              </label>
              <input
                type="text"
                id="mode"
                name="Deploy mode"
                className="input-style"
                defaultValue="Cluster"
              />
            </div>
            <div>
              <label htmlFor="mode" className="label-style">
                Hadoop Version:
              </label>
              <input
                type="text"
                id="hadoop"
                name="hadoop"
                className="input-style"
                defaultValue="3.3.3"
              />
            </div>
            <div>
              <label htmlFor="mode" className="label-style">
                Spark Version:
              </label>
              <input
                type="text"
                id="spark"
                name="spark"
                className="input-style"
                defaultValue="3.3.0"
              />
            </div>
          <div>
            <label htmlFor="mode" className="label-style">
              Endpoint Django Rest:
            </label>
            <input
              type="text"
              id="endpoint"
              name="endpoint"
              className="input-style"
              defaultValue="https:localhost:8000"
            />
          </div>
          </div>
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
