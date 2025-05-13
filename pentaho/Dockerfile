# Usa a imagem base do Alpine
FROM alpine:3.18

# Instala dependências necessárias
RUN apk add --no-cache \
    openjdk11-jre-headless \
    wget \
    bash \
    unzip \
    && rm -rf /var/cache/apk/*

# Define o diretório de trabalho
WORKDIR /opt/pentaho

# Baixa e descompacta o Pentaho Data Integration
RUN wget https://privatefilesbucket-community-edition.s3.us-west-2.amazonaws.com/9.4.0.0-343/ce/client-tools/pdi-ce-9.4.0.0-343.zip \
    && unzip pdi-ce-9.4.0.0-343.zip

RUN echo '/opt/pentaho/data-integration/carte.sh 0.0.0.0 8081 > log_carte.txt & tail -f log_carte.txt' > /opt/pentaho/data-integration/carte.sh

# Exponha a porta usada pelo Pentaho Carte
EXPOSE 8081

# Define o comando de inicialização
CMD ["/opt/pentaho/data-integration/carte.sh", "0.0.0.0", "8081"] 
