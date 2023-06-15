import React, { PureComponent } from 'react';
import DropZone from 'react-dropzone';
import filesize from 'filesize';
import { DropContainer, UploadMessage } from './styles';

export default class Upload extends PureComponent {
  handleUpload = (files) => {
    const uploadedFiles = files.map((file) => ({
      file,
      id: null,
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
    }));

    this.props.onUpload((prevUploadedFile) => prevUploadedFile.concat(uploadedFiles));

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => {
    this.props.onUpload((prevUploadedFile) => prevUploadedFile.map((uploadedFile) => (id === uploadedFile.id
      ? { ...uploadedFile, ...data }
      : uploadedFile)));
  };

  processUpload = (uploadedFile) => {
    const data = new FormData();
    const { serverUpload } = this.props;

    data.append('file', uploadedFile.file, uploadedFile.name);

    serverUpload(data, (newValues) => {
      this.updateFile(uploadedFile.id, newValues);
    });
  };

  renderDragMessage = (isDragActive, isDragReject) => {
    if (!isDragActive) return <UploadMessage>{this.props.message}</UploadMessage>;
    if (isDragReject) return <UploadMessage type="error">Arquivo não suportado</UploadMessage>;
    return <UploadMessage type="success">Solte os arquivos aqui</UploadMessage>;
  }

  render() {
    return (
      <DropZone accept={this.props.accept} onDropAccepted={this.handleUpload}>
        {({
          getRootProps, getInputProps, isDragActive, isDragReject,
        }) => (
          <DropContainer
            {...getRootProps()}
            isDragActive={isDragActive}
            isDragReject={isDragReject}
          >
            <input {...getInputProps()} />
            {this.renderDragMessage(isDragActive, isDragReject)}
          </DropContainer>
        )}
      </DropZone>
    );
  }
}
