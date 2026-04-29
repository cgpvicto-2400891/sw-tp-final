import pretModel from '../models/pretModel.js';

async function ajouterPret(req, res) {
    const { livreId } = req.params;
    const { nom_emprunteur, date_debut, date_retour_prevue } = req.body;

    if (!nom_emprunteur || !date_debut || !date_retour_prevue) {
        return res.status(400).json({ succes: false, message: 'Données de prêt incomplètes' });
    }

    try {
        const appartient = await pretModel.verifierLivreBibliotheque(livreId, req.bibliotheque.id);
        if (!appartient) return res.status(404).json({ succes: false, message: 'Livre introuvable' });

        const pret = await pretModel.ajouterPret(livreId, nom_emprunteur, date_debut, date_retour_prevue);
        res.status(201).json({ succes: true, message: 'Prêt enregistré', donnees: pret });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur lors du prêt' });
    }
}

async function modifierPret(req, res) {
    const { nom_emprunteur, date_debut, date_retour_prevue } = req.body;
    try {
        const pretExistant = await pretModel.obtenirPretParId(req.params.pretId);
        if (!pretExistant) return res.status(404).json({ succes: false, message: 'Prêt non trouvé' });

        const appartient = await pretModel.verifierLivreBibliotheque(pretExistant.livre_id, req.bibliotheque.id);
        if (!appartient) return res.status(403).json({ succes: false, message: 'Accès interdit' });

        const maj = await pretModel.modifierPret(req.params.pretId, nom_emprunteur, date_debut, date_retour_prevue);
        res.json({ succes: true, message: 'Prêt modifié', donnees: maj });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur modification prêt' });
    }
}

async function changerStatutPret(req, res) {
    const { statut } = req.body;
    if (!['en_cours', 'termine'].includes(statut)) {
        return res.status(400).json({ succes: false, message: 'Statut invalide' });
    }
    try {
        const pretExistant = await pretModel.obtenirPretParId(req.params.pretId);
        if (!pretExistant) return res.status(404).json({ succes: false, message: 'Prêt non trouvé' });

        const appartient = await pretModel.verifierLivreBibliotheque(pretExistant.livre_id, req.bibliotheque.id);
        if (!appartient) return res.status(403).json({ succes: false, message: 'Accès interdit' });

        const maj = await pretModel.changerStatutPret(req.params.pretId, statut);
        res.json({ succes: true, message: 'Statut du prêt mis à jour', donnees: maj });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur statut prêt' });
    }
}

async function supprimerPret(req, res) {
    try {
        const pretExistant = await pretModel.obtenirPretParId(req.params.pretId);
        if (!pretExistant) return res.status(404).json({ succes: false, message: 'Prêt non trouvé' });

        const appartient = await pretModel.verifierLivreBibliotheque(pretExistant.livre_id, req.bibliotheque.id);
        if (!appartient) return res.status(403).json({ succes: false, message: 'Accès interdit' });

        await pretModel.supprimerPret(req.params.pretId);
        res.json({ succes: true, message: 'Prêt supprimé' });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur suppression prêt' });
    }
}

export default { ajouterPret, modifierPret, changerStatutPret, supprimerPret };
