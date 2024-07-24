
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/* Default users table */
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100),
    password CHAR(64)
);

/* Default user permissions table */
CREATE TABLE IF NOT EXISTS public.user_perms (
    user_id UUID NOT NULL UNIQUE,
    user_permission_level INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

/*default user for the auth api*/
INSERT INTO users(username, password) VALUES('root', encode(digest('root', 'sha256'), 'hex'));

INSERT INTO user_perms (user_id, user_permission_level) SELECT id, '2' FROM USERS WHERE username = 'root';
