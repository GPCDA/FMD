import styled, { css } from 'styled-components';

const sizes = {
  default: css`
    margin-top: 15vh;
    margin-bottom: 20vh;
    margin-left: 20vw;
    width: 60%;
    min-height: 60vh;
  `,
  big: css`
    margin: 5vh auto;
    width: 90%;
    min-height: 90vh;
  `,
};

export const ConfigContainer = styled.div`
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  border-radius: 5px;

  ${(props) => sizes[props.size || 'default']}

  header {
    padding: 2rem;
  }
  
  h1 {
    font-weight: 600;
    font-size: 24px;
    line-height: 31px;
    color: #4A5173;
  }
`;
