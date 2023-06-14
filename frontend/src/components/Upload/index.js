import React, { Component } from 'react';
import DropZone from 'react-dropzone';
import filesize from 'filesize';
import { DropContainer, UploadMessage } from './styles';
import api from '../../services/api';

export default class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadedFiles: [],
    };
  }

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

    this.setState((prevState) => ({
      ...prevState,
      uploadedFiles: prevState.uploadedFiles.concat(uploadedFiles),
    }));

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => {
    let newFiles = this.state.uploadedFiles;
    this.setState((prevState) => {
      newFiles = prevState.uploadedFiles.map((uploadedFile) => (id === uploadedFile.id
        ? { ...uploadedFile, ...data }
        : uploadedFile));
      return { ...prevState, uploadedFiles: newFiles };
    });

    if (this.props.onUpload) {
      this.props.onUpload(newFiles);
    }
  };

  processUpload = (uploadedFile) => {
    const data = new FormData();
    // const { serverUpload = api.post } = this.props;

    data.append('file', uploadedFile.file, uploadedFile.name);

    // serverUpload(data, (newValues) => {
    //   updateFile(uploadedFile.id, newValues);
    // });
    api
      .post('file', data, {
        onUploadProgress: (e) => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total), 10);

          this.updateFile(uploadedFile.id, {
            progress,
          });
        },
      })
      .then((response) => {
        this.updateFile(uploadedFile.id, {
          uploaded: true,
          id: response.data.id,
          url: response.data.url,
        });
      })
      .catch(() => {
        this.updateFile(uploadedFile.id, {
          error: true,
        });
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
