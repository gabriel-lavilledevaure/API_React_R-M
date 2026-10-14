# Todo List React — Backlog de User Stories

## Présentation du projet

Réaliser une application de gestion de tâches en React dans le cadre d’un TP. L’application fonctionne entièrement dans le navigateur, sans compte utilisateur ni serveur.

Un seul type d’utilisateur : la personne qui note, organise et suit ses tâches.

Ce document constitue une feuille de route pour le développement. Il ne contient pas le code de l’application. L’interface sera réalisée plus tard avec React, Tailwind CSS et un Design System qui reste à fournir.

## User Stories

Les User Stories sont classées dans un ordre logique de développement, des fonctionnalités fondamentales aux fonctionnalités secondaires.

### US-01 — Afficher les tâches

- **En tant que** personne qui organise ses tâches
- **Je veux** consulter mes tâches lorsqu’il y en a
- **Afin de** savoir ce que j’ai à faire

**Exercice(s) associé(s) :** Exercice 4 — L’Inventaire

**Notion(s) React mobilisée(s) :** State, `map`, clés `key`.

**Réutilisation :** Remplacer la liste de fruits par une liste de tâches et afficher leur intitulé.

**Priorité :** Essentielle

### US-02 — Comprendre que la liste est vide

- **En tant que** personne qui consulte sa liste
- **Je veux** voir un message « Aucune tâche pour le moment » lorsque je n’ai aucune tâche
- **Afin de** comprendre que ma liste est vide

**Exercice(s) associé(s) :** Exercice 3 — Mode Sombre

**Notion(s) React mobilisée(s) :** Rendu conditionnel, longueur d’un tableau.

**Réutilisation :** Afficher la liste si elle contient des tâches ; sinon, afficher uniquement le message de liste vide.

**Priorité :** Essentielle

### US-03 — Ajouter une tâche

- **En tant que** personne qui organise ses tâches
- **Je veux** saisir un intitulé et ajouter une tâche à ma liste
- **Afin de** ne pas oublier ce que je dois faire

**Exercice(s) associé(s) :** Exercice 7 — Le Champ Non Contrôlé ; Exercice 4 — L’Inventaire

**Notion(s) React mobilisée(s) :** Formulaire non contrôlé, `FormData`, props, ajout immutable.

**Réutilisation :** Récupérer le texte à la soumission, refuser une saisie vide ou composée d’espaces, puis ajouter une tâche avec un identifiant unique. Une nouvelle tâche est à faire par défaut. Vider le champ après l’ajout.

**Priorité :** Essentielle

### US-04 — Changer le statut d’une tâche

- **En tant que** personne qui suit ses tâches
- **Je veux** marquer une tâche comme terminée ou la remettre à faire
- **Afin de** suivre mon avancement et corriger une erreur de manipulation

**Exercice(s) associé(s) :** Exercice 5 — Le Tableau de Bord

**Notion(s) React mobilisée(s) :** State, `map`, immutabilité, rendu conditionnel.

**Réutilisation :** Adapter la bascule du booléen `active` en statut terminé et distinguer visuellement les tâches terminées.

**Priorité :** Essentielle

### US-05 — Supprimer une tâche

- **En tant que** personne qui organise ses tâches
- **Je veux** supprimer une tâche de ma liste
- **Afin de** retirer ce que je ne souhaite plus conserver

**Exercice(s) associé(s) :** Exercice 5 — Le Tableau de Bord

**Notion(s) React mobilisée(s) :** `filter`, mise à jour du state, immutabilité.

**Réutilisation :** Reprendre la suppression par identifiant pour retirer uniquement la tâche choisie. Si c’était la dernière, afficher le message de liste vide.

**Priorité :** Essentielle

### US-06 — Modifier une tâche

- **En tant que** personne qui organise ses tâches
- **Je veux** modifier l’intitulé d’une tâche, puis valider ou annuler ma modification
- **Afin de** corriger ou préciser son contenu sans la recréer

**Exercice(s) associé(s) :** Exercice 10 — La Carte Éditable ; Exercice 6 — Le Champ Contrôlé ; Exercice 5 — Le Tableau de Bord

**Notion(s) React mobilisée(s) :** State local, champ contrôlé, props, rendu conditionnel, `map`.

**Réutilisation :** Préparer un brouillon local, enregistrer un intitulé non vide à la validation et conserver l’ancien texte en cas d’annulation. L’exercice 10 doit être complété pour reprendre cette logique.

**Priorité :** Importante

### US-07 — Filtrer les tâches

- **En tant que** personne qui consulte ses tâches
- **Je veux** afficher toutes les tâches, seulement celles à faire ou seulement celles terminées
- **Afin de** me concentrer sur les tâches qui m’intéressent

**Exercice(s) associé(s) :** Exercice 8 — Le Filtre à Films ; Exercice 3 — Mode Sombre

**Notion(s) React mobilisée(s) :** State du filtre, `filter`, données dérivées, rendu conditionnel.

**Réutilisation :** Adapter les filtres « Tous / Vus / À voir » en « Toutes / À faire / Terminées ». Distinguer le filtre actif et afficher un message si aucune tâche ne lui correspond. La liste filtrée est calculée depuis les tâches, sans state supplémentaire.

**Priorité :** Importante

### US-08 — Voir le nombre de tâches restantes

- **En tant que** personne qui suit ses tâches
- **Je veux** connaître le nombre de tâches qu’il me reste à terminer
- **Afin de** pouvoir évaluer rapidement le travail restant

**Exercice(s) associé(s) :** Exercice 8 — Le Filtre à Films

**Notion(s) React mobilisée(s) :** Donnée dérivée, `filter`, `.length`.

**Réutilisation :** Compter les tâches non terminées à partir de la liste complète, indépendamment du filtre sélectionné, sans créer de state supplémentaire pour le compteur.

**Priorité :** Importante

## Tableau récapitulatif

| ID | User Story | Exercice(s) associé(s) | Notion React | Priorité |
| --- | --- | --- | --- | --- |
| US-01 | Afficher les tâches | Exercice 4 | State, `map`, `key` | Essentielle |
| US-02 | Comprendre que la liste est vide | Exercice 3 | Rendu conditionnel | Essentielle |
| US-03 | Ajouter une tâche | Exercices 7 et 4 | Formulaire non contrôlé, ajout immutable | Essentielle |
| US-04 | Changer le statut d’une tâche | Exercice 5 | `map`, immutabilité | Essentielle |
| US-05 | Supprimer une tâche | Exercice 5 | `filter`, state | Essentielle |
| US-06 | Modifier une tâche | Exercices 10, 6 et 5 | State local, champ contrôlé, props | Importante |
| US-07 | Filtrer les tâches | Exercices 8 et 3 | Filtrage dérivé, rendu conditionnel | Importante |
| US-08 | Voir le nombre de tâches restantes | Exercice 8 | Donnée dérivée, `.length` | Importante |

## Exercices particulièrement utiles

- **Exercice 4 :** affichage d’une liste et ajout d’un élément. La logique est presque directement réutilisable pour les tâches.
- **Exercice 5 :** suppression et changement de statut par identifiant. C’est une base centrale, presque directement réutilisable.
- **Exercice 7 :** formulaire d’ajout réutilisable après avoir ajouté sa réinitialisation. Le contrôle du type doit précéder le premier appel à `.trim()`.
- **Exercice 8 :** filtres et compteurs. Corriger `setFilter("watched").length` en supprimant l’accès à `.length`, puis compléter l’indication visuelle et `aria-pressed` du filtre actif.
- **Exercice 10 :** modification d’un intitulé avec validation ou annulation. Compléter l’interface et les gestionnaires, puis corriger `usermane` en `username`.

Les exercices 1 et 2 apportent les bases du state et des échanges entre parent et enfant. Leurs notions seront utilisées dans les composants, sans nécessiter de User Story technique dédiée.

L’exercice 9 — Le Panier est décrit dans le README préparatoire, mais son fichier réalisé n’a pas été fourni. Sa consigne explique comment partager le state entre le formulaire et la liste via leur parent commun.

## Limites de cette première version

Ce backlog reste centré sur les notions présentes dans les exercices. Il ne prévoit ni backend, ni authentification, ni base de données, ni API, ni bibliothèque de gestion d’état.

La sauvegarde des tâches n’est pas incluse : les tâches seront perdues au rechargement de la page. Leur conservation dans le navigateur pourra faire l’objet d’une User Story supplémentaire avec `localStorage`, une notion absente des exercices fournis.

Le Design System sera analysé lorsqu’il sera fourni, avant la réalisation de l’interface.
