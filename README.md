docker-compose up -d --build

docker ps

docker exec -it postgres_db psql -U root -d app-db

\dt