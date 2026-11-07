# Fab's Foot ⚽

Application React + TypeScript + Vite utilisant un instantané de données football officielles, publié sans clé API.

## Fonctionnalités

- Tableau de bord football
- Matchs du jour
- Résultats et calendriers par compétition
- Classements
- Meilleurs buteurs
- Liste des compétitions disponibles
- Recherche de clubs
- Gestion des états chargement / erreur
- Rafraîchissement manuel
- Interface responsive sombre
- Sources officielles contrôlées toutes les 30 minutes par GitHub Actions
- Couverture et statistiques manquantes signalées sans inventer de données

## Installation

1. Installer Node.js 20+.
2. Installer les dépendances :

```bash
npm install
```

3. Lancer en développement :

```bash
npm run dev
```

4. Construire :

```bash
npm run build
```

## Actualisation des données

Le workflow `.github/workflows/refresh-official-match-data.yml` collecte les sources officielles toutes les 30 minutes et peut également être lancé manuellement depuis l’onglet Actions. Il publie `public/data/official-matches.json` sur la branche par défaut uniquement lorsque les données changent. Le déploiement Vercel doit être configuré pour redéployer après ces commits.

Pour lancer la collecte localement :

```bash
npm run refresh:official-data
```

Le collecteur utilise uniquement des pages et flux publics sans authentification. Il n’essaie pas de contourner les protections des sites. Les résultats récents de Premier League alimentent les statistiques des équipes ; si l’historique vérifié manque, le modèle affiche une estimation de secours explicitement signalée comme moins fiable. Une source inaccessible ou ne publiant pas de données lisibles est indiquée comme couverture partielle.

Le comparateur met en regard le pronostic IA et des liens vers des sites d’experts. Leurs sélections restent consultables chez leurs éditeurs : elles ne sont pas copiées ni présentées comme automatiquement vérifiées, et aucune cote tierce n’est importée.

Les projections IA de tirs cadrés et de corners sont des estimations dérivées des buts et de la forme récents, pas des statistiques de match observées. Si l’historique est incomplet, une estimation de secours basée sur une référence neutre est affichée et signalée comme moins fiable.
