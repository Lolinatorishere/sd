module.exports = {
    db: {
        client: 'pg',
        connection: {
            host: 'bl-db',
            user: 'sd',
            password: 'sd',
            database: 'bl-db'
        },
        migrations: {
            directory: './migrations'
        },
        seeds: {

        }
    }
};
