-- Base de données : système de prêt de livres

-- Suppression des tables si elles existent
DROP TABLE IF EXISTS prets CASCADE;
DROP TABLE IF EXISTS livres CASCADE;
DROP TABLE IF EXISTS bibliotheques CASCADE;

-- Table bibliotheques
CREATE TABLE bibliotheques (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    courriel VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    cle_api VARCHAR(64) NOT NULL UNIQUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table livres
CREATE TABLE livres (
    id SERIAL PRIMARY KEY,
    bibliotheque_id INTEGER NOT NULL REFERENCES bibliotheques(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    auteur VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    statut VARCHAR(20) DEFAULT 'disponible'
        CHECK (statut IN ('disponible', 'emprunte')),
    description TEXT,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table prets
CREATE TABLE prets (
    id SERIAL PRIMARY KEY,
    livre_id INTEGER NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
    nom_emprunteur VARCHAR(255) NOT NULL,
    date_debut DATE NOT NULL,
    date_retour_prevue DATE NOT NULL,
    date_retour_reel DATE,
    statut VARCHAR(20) DEFAULT 'en_cours'
        CHECK (statut IN ('en_cours', 'termine'))
);

-- Données de test

INSERT INTO bibliotheques (nom, courriel, mot_de_passe, cle_api) VALUES
('Bibliothèque Centrale de Montréal',
 'centrale@biblio.qc.ca',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LhETYgPkMhO',
 'cle-api-biblio-centrale-0001'),

('Bibliothèque Saint-Laurent',
 'stlaurent@biblio.qc.ca',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LhETYgPkMhO',
 'cle-api-biblio-stlaurent-0002');

-- Livres
INSERT INTO livres (bibliotheque_id, titre, auteur, isbn, statut, description) VALUES
(1, 'Le Petit Prince', 'Antoine de Saint-Exupéry', '978-2-07-040850-4', 'disponible', 'Conte philosophique'),
(1, 'L''Étranger', 'Albert Camus', '978-2-07-036024-5', 'emprunte', 'Roman de 1942'),
(1, 'Les Misérables', 'Victor Hugo', '978-2-07-040878-8', 'disponible', 'Roman historique'),
(1, 'Madame Bovary', 'Gustave Flaubert', '978-2-07-036361-1', 'disponible', 'Roman réaliste'),

(2, 'Germinal', 'Émile Zola', '978-2-07-040095-9', 'disponible', 'Roman naturaliste'),
(2, 'Le Rouge et le Noir', 'Stendhal', '978-2-07-036316-1', 'emprunte', 'Roman de 1830');

-- Prêts
INSERT INTO prets (livre_id, nom_emprunteur, date_debut, date_retour_prevue, statut) VALUES
(2, 'Marie Tremblay', '2026-01-10', '2026-01-31', 'en_cours'),
(6, 'Jean Dupont', '2026-01-05', '2026-01-25', 'en_cours');

-- Mise à jour
UPDATE prets
SET date_retour_reel = '2026-01-24',
    statut = 'termine'
WHERE id = 2;

-- Vérification
SELECT 'bibliotheques', COUNT(*) FROM bibliotheques
UNION ALL
SELECT 'livres', COUNT(*) FROM livres
UNION ALL
SELECT 'prets', COUNT(*) FROM prets;