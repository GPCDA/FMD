import React, { PureComponent } from 'react';
import {
  DialogForm, DialogLabelGroup,
  DialogLabel, DialogInput, DialogSpan,
} from '../../../../../styles/global';
import Upload from '../../../../Upload';
import UploadFileList from '../../../../UploadFileList';

export class File extends PureComponent {
  render() {
    const {
      name, setName, file, setFile,
    } = this.props;

    return (
      <DialogForm>
        <DialogLabelGroup>
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
        <div style={{ paddingTop: '2vh' }}>
          <div style={{ paddingBottom: '.5vh' }}><DialogSpan>Arquivo:</DialogSpan></div>
          <Upload
            onUpload={(newUploadedFiles) => setFile({ ...file, uploadedFiles: newUploadedFiles })}
            accept="text/csv"
            message="Arraste um arquivo CSV ou clique aqui."
          />
        </div>
        )}

        {!!file.uploadedFiles.length && (
        <UploadFileList
          files={file.uploadedFiles}
          onDelete={(newUploadedFiles) => setFile({ ...file, uploadedFiles: newUploadedFiles })}
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
