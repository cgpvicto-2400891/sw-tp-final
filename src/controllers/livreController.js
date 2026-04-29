import livreModel from '../models/livreModel.js';

async function obtenirTousLivres(req, res) {
    try {
        const tous = req.query.tous === 'true';
        const livres = await livreModel.obtenirTousLivres(req.bibliotheque.id, tous);
        res.json({ succes: true, nombre: livres.length, donnees: livres });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur serveur' });
    }
}

async function obtenirLivreParId(req, res) {
    try {
        const livre = await livreModel.obtenirLivreParId(req.params.id, req.bibliotheque.id);
        if (!livre) return res.status(404).json({ succes: false, message: 'Livre non trouvé' });
        res.json({ succes: true, donnees: livre });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur serveur' });
    }
}

async function ajouterLivre(req, res) {
    const { titre, auteur, isbn, description } = req.body;
    if (!titre || !auteur || !isbn) {
        return res.status(400).json({ succes: false, message: 'Infos manquantes' });
    }
    try {
        const livre = await livreModel.ajouterLivre(req.bibliotheque.id, titre, auteur, isbn, description);
        res.status(201).json({ succes: true, message: 'Livre ajouté', donnees: livre });
    } catch (err) {
        res.status(500).json({ succes: false, message: "Erreur lors de l'ajout" });
    }
}

async function modifierLivre(req, res) {
    const { titre, auteur, isbn, description } = req.body;
    if (!titre || !auteur || !isbn) {
        return res.status(400).json({ succes: false, message: 'Infos manquantes' });
    }
    try {
        const livre = await livreModel.modifierLivre(req.params.id, req.bibliotheque.id, titre, auteur, isbn, description);
        if (!livre) return res.status(404).json({ succes: false, message: 'Livre non trouvé' });
        res.json({ succes: true, message: 'Livre modifié', donnees: livre });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur modification' });
    }
}

async function changerStatutLivre(req, res) {
    const { statut } = req.body;
    if (!['disponible', 'emprunte'].includes(statut)) {
        return res.status(400).json({ succes: false, message: 'Statut invalide' });
    }
    try {
        const livre = await livreModel.changerStatutLivre(req.params.id, req.bibliotheque.id, statut);
        if (!livre) return res.status(404).json({ succes: false, message: 'Livre non trouvé' });
        res.json({ succes: true, message: 'Statut mis à jour', donnees: livre });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur mise à jour' });
    }
}

async function supprimerLivre(req, res) {
    try {
        const livre = await livreModel.supprimerLivre(req.params.id, req.bibliotheque.id);
        if (!livre) return res.status(404).json({ succes: false, message: 'Livre non trouvé' });
        res.json({ succes: true, message: 'Livre supprimé' });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur suppression' });
    }
}

export default {
    obtenirTousLivres,
    obtenirLivreParId,
    ajouterLivre,
    modifierLivre,
    changerStatutLivre,
    supprimerLivre
};
