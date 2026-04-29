import db from '../config/db.js';

async function obtenirTousLivres(bibliothequeId, afficherTous = false) {
    let query = 'SELECT id, titre, auteur, isbn, statut, description, date_ajout FROM livres WHERE bibliotheque_id = $1';
    const params = [bibliothequeId];
    if (!afficherTous) {
        query += ' AND statut = $2';
        params.push('disponible');
    }
    query += ' ORDER BY date_ajout DESC';
    const result = await db.query(query, params);
    return result.rows;
}

async function obtenirLivreParId(id, bibliothequeId) {
    const result = await db.query(
        'SELECT l.*, p.id AS pret_id, p.nom_emprunteur, p.date_debut, p.date_retour_prevue, p.date_retour_reel, p.statut AS pret_statut ' +
        'FROM livres l LEFT JOIN prets p ON p.livre_id = l.id ' +
        'WHERE l.id = $1 AND l.bibliotheque_id = $2 ' +
        'ORDER BY p.date_debut DESC',
        [id, bibliothequeId]
    );
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const livre = {
        id: row.id,
        titre: row.titre,
        auteur: row.auteur,
        isbn: row.isbn,
        statut: row.statut,
        description: row.description,
        date_ajout: row.date_ajout,
        prets: []
    };
    result.rows.forEach(r => {
        if (r.pret_id) {
            livre.prets.push({
                id: r.pret_id,
                nom_emprunteur: r.nom_emprunteur,
                date_debut: r.date_debut,
                date_retour_prevue: r.date_retour_prevue,
                date_retour_reel: r.date_retour_reel,
                statut: r.pret_statut
            });
        }
    });
    return livre;
}

async function ajouterLivre(bibliothequeId, titre, auteur, isbn, description) {
    const res = await db.query(
        'INSERT INTO livres (bibliotheque_id, titre, auteur, isbn, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [bibliothequeId, titre, auteur, isbn, description || null]
    );
    return res.rows[0];
}

async function modifierLivre(id, bibliothequeId, titre, auteur, isbn, description) {
    const res = await db.query(
        'UPDATE livres SET titre = $1, auteur = $2, isbn = $3, description = $4 WHERE id = $5 AND bibliotheque_id = $6 RETURNING *',
        [titre, auteur, isbn, description || null, id, bibliothequeId]
    );
    return res.rows[0] || null;
}

async function changerStatutLivre(id, bibliothequeId, statut) {
    const res = await db.query(
        'UPDATE livres SET statut = $1 WHERE id = $2 AND bibliotheque_id = $3 RETURNING *',
        [statut, id, bibliothequeId]
    );
    return res.rows[0] || null;
}

async function supprimerLivre(id, bibliothequeId) {
    const res = await db.query('DELETE FROM livres WHERE id = $1 AND bibliotheque_id = $2 RETURNING id', [id, bibliothequeId]);
    return res.rows[0] || null;
}

export default {
    obtenirTousLivres,
    obtenirLivreParId,
    ajouterLivre,
    modifierLivre,
    changerStatutLivre,
    supprimerLivre
};
