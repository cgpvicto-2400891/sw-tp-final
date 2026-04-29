import express from 'express';
import ctrl from '../controllers/livreController.js';
import { authentifierCleApi } from '../middleware/auth.js';

const router = express.Router();

router.use(authentifierCleApi);

router.get('/', ctrl.obtenirTousLivres);
router.get('/:id', ctrl.obtenirLivreParId);
router.post('/', ctrl.ajouterLivre);
router.put('/:id', ctrl.modifierLivre);
router.patch('/:id/statut', ctrl.changerStatutLivre);
router.delete('/:id', ctrl.supprimerLivre);

export default router;
