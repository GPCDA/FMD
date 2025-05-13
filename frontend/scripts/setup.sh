 #!/bin/bash

# Verifica se o NVM já está instalado
if [ -d "$HOME/.nvm" ]; then
  echo "NVM já está instalado."
else
  echo "NVM não encontrado. Instalando..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

# Carrega o NVM no shell atual
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instala e usa o Node.js 13.9
nvm install 13.9
nvm use 13.9

# Instala dependências e inicia a aplicação
yarn install
yarn start
