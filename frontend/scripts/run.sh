# Localiza o NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Isso carrega o nvm

# Usa a versão correta do node (13.9)
nvm use 13.9

# Inicializa a aplicação com yarn
yarn start
