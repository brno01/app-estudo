docker-compose up -d --build

docker ps

docker exec -it postgres_db psql -U root -d app-db

\dt

Local: docker compose --profile local up

Remoto: docker compose --profile remote up