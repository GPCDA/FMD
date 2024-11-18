import React, { PureComponent } from 'react';
import {
  DialogForm, DialogLabelGroup,
  DialogLabel, DialogInput, DialogSpan,
} from '../../../../../styles/global';
import Upload from '../../../../Upload';
import UploadFileList from '../../../../UploadFileList';
import api from '../../../../../services/api';

export class File extends PureComponent {
  uploadDatasourceFile = (file, callback) => {
    api
      .post('file', file, {
        onUploadProgress: (e) => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total), 10);
          callback({ progress });
        },
      })
      .then((response) => {
        callback({
          uploaded: true,
          id: response.data.id,
          url: response.data.url,
        });
      })
      .catch(() => {
        callback({ error: true });
      });
  }

  render() {
    const {
      name, setName, file, setFile,
    } = this.props;

    return (
      <DialogForm>
        <DialogLabelGroup className="fonte-dados-csv">
          <DialogLabel htmlFor="name">Fonte de dados*:</DialogLabel>
          <DialogInput
            id="name"
            name="name"
            autoComplete="off"
            defaultValue={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DialogLabelGroup>

        {!file.uploadedFiles.length && (
        <div style={{ paddingTop: '2vh' }} className="upload-arquivo">
          <div style={{ paddingBottom: '.5vh' }}><DialogSpan>Arquivo*:</DialogSpan></div>
          <Upload
            serverUpload={this.uploadDatasourceFile}
            onUpload={(callback) => setFile((prevFile) => ({ ...prevFile, uploadedFiles: callback(prevFile.uploadedFiles) }))}
            accept="text/csv"
            message="Arraste um arquivo CSV ou clique aqui."
          />
        </div>
        )}

        {!!file.uploadedFiles.length && (
        <UploadFileList
          files={file.uploadedFiles}
          onDelete={(newUploadedFiles) => setFile((prevFile) => ({ ...prevFile, uploadedFiles: newUploadedFiles }))}
        />
        )}

        {!file.uploadedFiles.length && (
        <>
          <DialogSpan
            style={{ fontSize: '0.75rem', fontWeight: 'bold', lineHeight: 'unset' }}
          >
            * Arquivo deve estar separado por vírgulas
          </DialogSpan>
          <DialogSpan
            style={{ fontSize: '0.75rem', fontWeight: 'bold', lineHeight: 'unset' }}
          >
            * Primeira linha deve ser o cabeçalho
          </DialogSpan>
          <DialogSpan
            style={{ fontSize: '0.75rem', fontWeight: 'bold', lineHeight: 'unset' }}
          >
            * As variáveis alvo devem ser numéricas
          </DialogSpan>
        </>
        )}

      </DialogForm>
    );
  }
}
