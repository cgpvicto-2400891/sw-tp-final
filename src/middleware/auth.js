import bibliothequeModel from '../models/bibliothequeModel.js';

/**
 * Intergiciel de validation de la clé API.
 * La clé doit être transmise dans l'en-tête Authorization
 * sous le format : "cle_api VOTRE_CLE"
 */
async function authentifierCleApi(req, res, next) {
    const enteteAutorisation = req.headers.authorization;

    // Vérifier que l'en-tête Authorization est présent
    if (!enteteAutorisation) {
        return res.status(401).json({
            succes: false,
            message: 'Accès refusé : en-tête Authorization manquant'
        });
    }

    // Extraire la clé : format attendu → "cle_api XXXXXXXX"
    const partiesEntete = enteteAutorisation.split(' ');
    if (partiesEntete.length !== 2 || partiesEntete[0] !== 'cle_api') {
        return res.status(401).json({
            succes: false,
            message: 'Format invalide : Authorization doit être "cle_api VOTRE_CLE"'
        });
    }

    const cleApi = partiesEntete[1];

    try {
        const biblio = await bibliothequeModel.trouverParCleApi(cleApi);

        if (!biblio) {
            return res.status(403).json({
                succes: false,
                message: 'Clé API non reconnue ou révoquée'
            });
        }

        // Attacher la bibliothèque identifiée à la requête pour les prochains middlewares
        req.bibliotheque = biblio;
        next();
    } catch (err) {
        res.status(500).json({
            succes: false,
            message: 'Erreur lors de la vérification de la clé API'
        });
    }
}

export { authentifierCleApi };
