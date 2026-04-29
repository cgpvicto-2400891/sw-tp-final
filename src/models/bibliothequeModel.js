import db from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function creerBibliotheque(nom, courriel, motDePasse) {
    const hash = await bcrypt.hash(motDePasse, 10);
    // Génération d'une clé API unique via UUID (122 bits aléatoires, non devinable)
    const cleApi = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const result = await db.query(
        'INSERT INTO bibliotheques (nom, courriel, mot_de_passe, cle_api) VALUES ($1, $2, $3, $4) RETURNING id, nom, courriel, cle_api',
        [nom, courriel, hash, cleApi]
    );
    return result.rows[0];
}

async function trouverParCourriel(courriel) {
    const res = await db.query('SELECT * FROM bibliotheques WHERE courriel = $1', [courriel]);
    return res.rows[0] || null;
}

async function trouverParCleApi(cleApi) {
    const res = await db.query('SELECT * FROM bibliotheques WHERE cle_api = $1', [cleApi]);
    return res.rows[0] || null;
}

async function regenererCleApi(id) {
    // Nouvelle clé unique générée à partir de deux UUID concaténés
    const nouvelleCle = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const res = await db.query('UPDATE bibliotheques SET cle_api = $1 WHERE id = $2 RETURNING id, nom, courriel, cle_api', [nouvelleCle, id]);
    return res.rows[0] || null;
}

async function verifierMotDePasse(mdp, hash) {
    return bcrypt.compare(mdp, hash);
}

export default {
    creerBibliotheque,
    trouverParCourriel,
    trouverParCleApi,
    regenererCleApi,
    verifierMotDePasse
};
