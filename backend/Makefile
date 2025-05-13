# default:
# 	@echo "\nHello there! You are able to run the following commands:\n"
# 	@echo "- Run from docker:\nmake start\n"
# 	@echo "- Run from docker:\nmake setup\n"

# start:
# 	chmod +x makefile_scripts/start.sh
# 	./makefile_scripts/start.sh

# setup:
# 	chmod +x makefile_scripts/setup.sh
# 	./makefile_scripts/setup.sh

# restart:
# 	chmod +x makefile_scripts/restart.sh
# 	./makefile_scripts/restart.sh

.PHONY: clean_venv create_venv activate_venv install_requirements reset_venv

# Caminho para o virtual environment
VENV_DIR=.venv

# Comando para ativar o virtual environment
ACTIVATE_CMD=source $(VENV_DIR)/bin/activate

# Remove o ambiente virtual
clean_venv:
	@echo "Desativando e removendo o ambiente virtual..."
	@if [ -d "$(VENV_DIR)" ]; then deactivate || true; rm -rf $(VENV_DIR); fi

# Cria o ambiente virtual
create_venv:
	@echo "Criando o ambiente virtual..."
	python3 -m venv $(VENV_DIR)

# Ativa o ambiente virtual
activate_venv:
	@echo "Ativando o ambiente virtual..."
	@echo "Use o comando: $(ACTIVATE_CMD)"

# Instala as dependências do arquivo requirements.txt
install_requirements:
	@echo "Instalando dependências..."
	$(ACTIVATE_CMD) && pip install -r requirements.txt

# Reseta o ambiente virtual
reset_venv: clean_venv create_venv activate_venv install_requirements
	@echo "Ambiente virtual foi resetado com sucesso!"
