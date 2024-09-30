.ONESHELL:

env_init:
	cp .env.example .env

# Docker
start:
	docker compose build --parallel
	docker compose --profile dev up -d --force-recreate 

stop: 
	docker compose down

clean:
	docker image prune -a