
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/* Sample table and data that we can insert once the database is created for the first time */
CREATE TABLE public.teachers (
	name    VARCHAR (100),
	city    VARCHAR(100),
	created_on      TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on      TIMESTAMP NOT NULL DEFAULT NOW()
);

/* Default users table */
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100),
    password CHAR(64)
);

CREATE TABLE public.user_perms (
    user_uuid UUID NOT NULL UNIQUE,
    read TINYINT(1),
    edit TINYINT(1),
    admin TINYINT(1),
    FOREIGN KEY(user_uuid) REFERENCES users(id)
)

/*default user for the auth api*/
INSERT INTO users(username, password) VALUES('root', encode(digest('root', 'sha256'), 'hex'));

INSERT INTO teachers(name, city) VALUES('Luís Teófilo', 'Porto');
INSERT INTO teachers(name, city) VALUES('Ricardo Castro', 'Braga');
