module.exports = {
    db: {
        client: 'pg',
        connection: {
            host: 'auth-db',
            user: 'sd',
            password: 'sd',
            database: 'auth-db'
        },
        migrations: {
            directory: './migrations'
        },
        seeds: {
            directory: './seeds'
        }
    }
};
