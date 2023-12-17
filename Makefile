dev:
	@docker-compose up -d
clear-dev:
	@docker-compose up -d --build
logs:
	@docker-compose logs app -f
