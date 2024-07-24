
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/* Default users table */
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100),
    password CHAR(64)
);

/* Default user permissions table */
CREATE TABLE public.user_perms (
    user_uuid UUID NOT NULL UNIQUE,
    read TINYINT(1),
    edit TINYINT(1),
    admin TINYINT(1),
    FOREIGN KEY(user_uuid) REFERENCES users(id)
)

/*default user for the auth api*/
INSERT INTO users(username, password) VALUES('root', encode(digest('root', 'sha256'), 'hex'));

