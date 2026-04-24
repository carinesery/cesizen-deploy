Readme Application Cesizen


Cesizen est une application complète de suivi du bien-être et des émotions, composée de trois parties principales :
- frontend-web-cesizen : Application web (Vite + React + TypeScript)
- mobile-cesizen : Application mobile (React Native/Expo)
- backend-cesizen : API backend (Node.js + TypeScript + Express + Prisma)

Prérequis
- Node.js >= 18.x
- npm >= 9.x
- (Mobile) Expo CLI : `npm install -g expo-cli`
- (Backend) Base de données compatible Prisma (ex: PostgreSQL)

Installation

1. Cloner le dépôt
(bash)
git clone <repo-url>
cd project-cesizen


2. Installer les dépendances
Pour chaque dossier :
(bash)
cd backend-cesizen && npm install
cd ../frontend-web-cesizen && npm install
cd ../mobile-cesizen && npm install


3. Configuration
- Backend :
  - Copier `.env.example` en `.env` et configurer la base de données
  - Lancer les migrations Prisma si besoin
- Frontend/Mobile :
  - Adapter les URLs d’API dans les fichiers de config/services si nécessaire

4. Lancer les applications
- Backend :
  (bash)
  cd backend-cesizen
  npm run dev
  
- Web :
  (bash)
  cd frontend-web-cesizen
  npm run dev
  
- Mobile :
  (bash)
  cd mobile-cesizen
  npm start
  

Structure du projet

project-cesizen/
├── backend-cesizen/      # API Node.js/Express/Prisma
├── frontend-web-cesizen/ # Frontend web React/Vite
├── mobile-cesizen/       # Application mobile Expo/React Native


Endpoints API
Présentés qous la forme Méthode- Chemin - Description

Authentification
POST	/api/auth/register	Inscription d’un nouvel utilisateur
POST	/api/auth/login	Connexion utilisateur
POST	/api/auth/refresh	Rafraîchir le token JWT
POST	/api/auth/forgot	Demande de réinitialisation de mot de passe
POST	/api/auth/reset	Réinitialisation du mot de passe


Utilisateurs
GET	/api/admin/users	Liste des utilisateurs (admin)
GET	/api/admin/users/:id	Détail d’un utilisateur (admin)
PATCH	/api/admin/users/:id	Modifier un utilisateur (admin)
DELETE	/api/admin/users/:id	Supprimer un utilisateur (admin)


Articles
GET	/api/articles	Liste des articles publics
GET	/api/articles/:slug	Détail d’un article
POST	/api/articles	Créer un article (admin)
PATCH	/api/articles/:slug	Modifier un article (admin)
DELETE	/api/articles/:slug	Supprimer un article (admin)

Catégories
GET	/api/categories	Liste des catégories
POST	/api/categories	Créer une catégorie (admin)
PATCH	/api/categories/:slug	Modifier une catégorie (admin)
DELETE	/api/categories/:slug	Supprimer une catégorie (admin)

Emotions & Mood Entries
GET	/api/emotions	Liste des émotions
POST	/api/mood-entries	Ajouter une entrée d’humeur
GET	/api/mood-entries/user/:id	Récupérer les humeurs d’un utilisateur


Technologies principales
- Backend : Node.js, Express, TypeScript, Prisma
- Web : React, Vite, TypeScript
- Mobile : React Native, Expo, TypeScript

Scripts utiles
- `npm run dev` : Démarrage en mode développement
- `npm run build` : Build de production (web/backend)
- `npm start` : Démarrage (mobile)

Contribution
1. Forkez le repo
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications
4. Poussez la branche et ouvrez une Pull Request


Pas de licence (Tous droits réservés)

---

Pour toute question, contactez l’équipe Cesizen.
