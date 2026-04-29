import db from '../config/db.js';

async function verifierLivreBibliotheque(livreId, bibliothequeId) {
    const res = await db.query('SELECT id FROM livres WHERE id = $1 AND bibliotheque_id = $2', [livreId, bibliothequeId]);
    return res.rows.length > 0;
}

async function ajouterPret(livreId, nomEmprunteur, dateDebut, dateRetourPrevue) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const res = await client.query(
            'INSERT INTO prets (livre_id, nom_emprunteur, date_debut, date_retour_prevue) VALUES ($1, $2, $3, $4) RETURNING *',
            [livreId, nomEmprunteur, dateDebut, dateRetourPrevue]
        );
        await client.query("UPDATE livres SET statut = 'emprunte' WHERE id = $1", [livreId]);
        await client.query('COMMIT');
        return res.rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function obtenirPretParId(id) {
    const res = await db.query('SELECT * FROM prets WHERE id = $1', [id]);
    return res.rows[0] || null;
}

async function modifierPret(id, nomEmprunteur, dateDebut, dateRetourPrevue) {
    const res = await db.query(
        'UPDATE prets SET nom_emprunteur = $1, date_debut = $2, date_retour_prevue = $3 WHERE id = $4 RETURNING *',
        [nomEmprunteur, dateDebut, dateRetourPrevue, id]
    );
    return res.rows[0] || null;
}

async function changerStatutPret(id, statut) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const dateReel = statut === 'termine' ? new Date().toISOString().split('T')[0] : null;
        const res = await client.query('UPDATE prets SET statut = $1, date_retour_reel = $2 WHERE id = $3 RETURNING *', [statut, dateReel, id]);

        if (res.rows[0] && statut === 'termine') {
            const livreId = res.rows[0].livre_id;
            const autres = await client.query("SELECT id FROM prets WHERE livre_id = $1 AND statut = 'en_cours'", [livreId]);
            if (autres.rows.length === 0) {
                await client.query("UPDATE livres SET statut = 'disponible' WHERE id = $1", [livreId]);
            }
        }
        await client.query('COMMIT');
        return res.rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function supprimerPret(id) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const pret = await client.query('SELECT * FROM prets WHERE id = $1', [id]);
        if (pret.rows[0]) {
            await client.query('DELETE FROM prets WHERE id = $1', [id]);
            const livreId = pret.rows[0].livre_id;
            const autres = await client.query("SELECT id FROM prets WHERE livre_id = $1 AND statut = 'en_cours'", [livreId]);
            if (autres.rows.length === 0) {
                await client.query("UPDATE livres SET statut = 'disponible' WHERE id = $1", [livreId]);
            }
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

export default {
    verifierLivreBibliotheque,
    ajouterPret,
    obtenirPretParId,
    modifierPret,
    changerStatutPret,
    supprimerPret
};
