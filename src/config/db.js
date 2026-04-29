import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Paramètres de connexion de base (local)
const parametresConnexion = {
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'biblio',
    password: process.env.PG_PASSWORD || '1234',
    port: parseInt(process.env.PG_PORT) || 5432,
};

// En production (Render), on utilise la chaîne de connexion complète avec SSL
if (process.env.NODE_ENV === 'production') {
    parametresConnexion.connectionString = process.env.DATABASE_URL;
}

// Activation SSL si la variable PG_SSL est définie (requis sur Render)
if (process.env.PG_SSL === 'true') {
    parametresConnexion.ssl = { rejectUnauthorized: false };
}

const pool = new pg.Pool(parametresConnexion);

pool.on('connect', () => {
    console.log('✅ Connexion PostgreSQL établie');
});

pool.on('error', (err) => {
    console.error('❌ Erreur inattendue sur le pool PostgreSQL :', err.message);
});

export default {
    query: (texte, params) => pool.query(texte, params),
    connect: () => pool.connect(),
};
