import bibliothequeModel from '../models/bibliothequeModel.js';

async function creerBibliotheque(req, res) {
    const { nom, courriel, mot_de_passe } = req.body;
    if (!nom || !courriel || !mot_de_passe) {
        return res.status(400).json({ succes: false, message: 'Champs obligatoires manquants' });
    }
    try {
        const existe = await bibliothequeModel.trouverParCourriel(courriel);
        if (existe) return res.status(409).json({ succes: false, message: 'Ce courriel est déjà utilisé' });

        const biblio = await bibliothequeModel.creerBibliotheque(nom, courriel, mot_de_passe);
        res.status(201).json({ succes: true, message: 'Compte créé', donnees: biblio });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur création compte' });
    }
}

async function obtenirCleApi(req, res) {
    const { courriel, mot_de_passe, regenerer } = req.body;
    if (!courriel || !mot_de_passe) {
        return res.status(400).json({ succes: false, message: 'Identifiants requis' });
    }
    try {
        const biblio = await bibliothequeModel.trouverParCourriel(courriel);
        if (!biblio) return res.status(404).json({ succes: false, message: 'Utilisateur non trouvé' });

        const mdpCorrect = await bibliothequeModel.verifierMotDePasse(mot_de_passe, biblio.mot_de_passe);
        if (!mdpCorrect) return res.status(401).json({ succes: false, message: 'Mot de passe incorrect' });

        if (regenerer) {
            const maj = await bibliothequeModel.regenererCleApi(biblio.id);
            return res.json({ succes: true, message: 'Clé API régénérée', donnees: maj });
        }
        res.json({ succes: true, message: 'Clé API récupérée', donnees: { id: biblio.id, nom: biblio.nom, courriel: biblio.courriel, cle_api: biblio.cle_api } });
    } catch (err) {
        res.status(500).json({ succes: false, message: 'Erreur serveur' });
    }
}

export default { creerBibliotheque, obtenirCleApi };
