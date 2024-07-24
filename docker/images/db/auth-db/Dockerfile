FROM postgres:16.1

ENV POSTGRES_USER=sd
ENV POSTGRES_PASSWORD=sd
ENV POSTGRES_DB=auth-db

COPY auth-db_schema.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
