import express from 'express';
import ctrl from '../controllers/pretController.js';
import { authentifierCleApi } from '../middleware/auth.js';

const router = express.Router();

router.use(authentifierCleApi);

// POST /api/livres/:livreId/prets  →  monté séparément dans server.js
// Ces routes sont montées sur /api/prets
router.put('/:pretId', ctrl.modifierPret);
router.patch('/:pretId/statut', ctrl.changerStatutPret);
router.delete('/:pretId', ctrl.supprimerPret);

export default router;
