import express from 'express';
import ctrl from '../controllers/bibliothequeController.js';

const router = express.Router();

router.post('/', ctrl.creerBibliotheque);
router.post('/cle-api', ctrl.obtenirCleApi);

export default router;
