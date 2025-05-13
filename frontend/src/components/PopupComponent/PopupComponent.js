import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@material-ui/core';

const PopupComponent = ({ isOpen, handleClose, selectedItemName }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/dados?file=' + selectedItemName);
        const json = await response.json();

        const rawData = json.message;
        const rows = rawData.split('\n');
        const extractedHeaders = rows[0].split(',');
        setHeaders(extractedHeaders);

        const extractedData = rows.slice(1, -1).map(row => {
          const values = row.split(',');
          let obj = {};
          values.forEach((value, index) => {
            obj[extractedHeaders[index]] = value;
          });
          return obj;
        });

        setData(extractedData);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [selectedItemName]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <Card style={{
        maxWidth: 800,
        width: '80%',
        minHeight: 400,
        maxHeight: '90%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <CardContent style={{
          overflow: 'auto',
          maxHeight: '100%',
        }}>
          <div>
            {data.length > 0 ? (
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    {headers.map(key => (
                      <th key={key} style={{
                        backgroundColor: 'rgb(73,81,114)',
                        border: '1px solid rgb(73,81,114)',
                        color: 'white',
                        padding: '8px',
                        textAlign: 'left'
                      }}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, idx) => (
                        <td key={idx} style={{
                          border: '1px solid rgb(73,81,114)',
                          padding: '5px 10px'
                        }}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Carregando dados...</p>}
          </div>
          <button
            onClick={handleClose}
            style={{
              marginTop: '30px',
              fontSize: '18px',
              backgroundColor: 'white',
              color: 'rgb(73,81,114)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            Fechar
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PopupComponent;
