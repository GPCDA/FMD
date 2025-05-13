default:
	@echo "\nHello there! You are able to run the following commands:\n"
	@echo "- Run:\nmake run\n"
	@echo "- Setup:\nmake setup\n"

run:
	chmod +x scripts/run.sh
	./scripts/run.sh

setup:
	chmod +x scripts/setup.sh
	./scripts/setup.sh

run-docker:
	docker-compose -f compose.yml up --build