-- =========================================================
-- SCRIPT DE TEST : Client sans aucun dossier actif
-- Objectif : tester l'affichage du message "Aucun dossier actif"
-- Base : recouvrement_db  |  Adapter si nécessaire
-- =========================================================

USE recouvrement_db;

-- 1. Insérer le client de test (sans dossier)
INSERT INTO client (id_agence, nom, prenom, telephone, email, cin, adresse, statut, token_acces, token_expiration)
VALUES (
  1,                                          -- id_agence  (agence existante)
  'Test',                                     -- nom
  'SansDossier',                              -- prenom
  '+21698000000',                             -- telephone
  'test.sansdossier@stb.tn',                  -- email
  '99999999',                                 -- CIN fictif
  '1 Rue de Test, Tunis',                     -- adresse
  'Actif',                                    -- statut
  UUID(),                                     -- token_acces  (UUID unique auto-généré)
  DATE_ADD(NOW(), INTERVAL 7 DAY)             -- token_expiration  (valide 7 jours)
);

-- 2. Récupérer le token généré pour tester l'URL dans le navigateur
SELECT
  id_client,
  CONCAT(nom, ' ', prenom)  AS client,
  token_acces               AS token,
  token_expiration          AS expiration,
  CONCAT(
    'http://localhost:4200/dossiers/',
    token_acces
  )                         AS url_test
FROM client
WHERE cin = '99999999';

-- 3. Copier l'URL affichée et l'ouvrir dans le navigateur.
--    Le message « Aucun dossier actif » doit s'afficher.

-- ── NETTOYAGE (après test) ──────────────────────────────
-- DELETE FROM client WHERE cin = '99999999';
