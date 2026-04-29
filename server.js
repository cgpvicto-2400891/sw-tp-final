import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import bibliothequeRoutes from './src/routes/bibliothequeRoutes.js';
import livreRoutes from './src/routes/livreRoutes.js';
import pretController from './src/controllers/pretController.js';
import { authentifierCleApi } from './src/middleware/auth.js';

// __dirname n'existe pas en ES modules — on le reconstruit
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Répertoire des logs
const logsDir = path.join(__dirname, 'src', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
const logStream = fs.createWriteStream(path.join(logsDir, 'errors.log'), { flags: 'a' });

// Logging des requêtes
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 500,
    stream: logStream
}));

app.use(cors());
app.use(express.json());
// front-end non déployé sur Render — pas de static file serving

// Documentation Swagger — URL dynamique selon l'environnement
const swaggerSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));

// Render fournit automatiquement RENDER_EXTERNAL_URL (ex: https://mon-app.onrender.com)
// En local, on utilise http://localhost:PORT
const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
swaggerSpec.servers = [{ url: serverUrl, description: 'Serveur actif' }];

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { defaultModelsExpandDepth: -1 } }));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// Routes API
app.use('/api/bibliotheques', bibliothequeRoutes);
app.use('/api/livres', livreRoutes);

// Routes des prêts
app.post('/api/livres/:livreId/prets', authentifierCleApi, pretController.ajouterPret);
app.put('/api/prets/:pretId', authentifierCleApi, pretController.modifierPret);
app.patch('/api/prets/:pretId/statut', authentifierCleApi, pretController.changerStatutPret);
app.delete('/api/prets/:pretId', authentifierCleApi, pretController.supprimerPret);

// Route de base
app.get('/', (req, res) => {
    res.json({
        message: 'API gestion bibliothèque v1.0.0',
        documentation: '/api/docs'
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ succes: false, message: 'Route introuvable' });
});

// Gestion des erreurs serveur
app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ${req.method} ${req.originalUrl} — ${err.message}\n${err.stack}\n\n`);
    res.status(500).json({ succes: false, message: 'Erreur interne' });
});

app.listen(PORT, () => {
    console.log(`Serveur prêt sur le port ${PORT}`);
});
