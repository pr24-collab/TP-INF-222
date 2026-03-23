// ============================================
// SIMULATION BASE DE DONNÉES SQLite
// Utilise localStorage pour la persistance
// ============================================

import { Article, CreateArticleDTO, UpdateArticleDTO } from '../models/Article';

const STORAGE_KEY = 'blog_api_articles';

// Articles initiaux (données de démonstration)
const defaultArticles: Article[] = [
  {
    id: 1,
    titre: "Introduction à Node.js",
    contenu: "Node.js est un environnement d'exécution JavaScript côté serveur construit sur le moteur V8 de Chrome. Il permet de créer des applications réseau scalables et performantes. Avec son modèle d'E/S non bloquant et événementiel, Node.js est idéal pour les applications en temps réel.",
    auteur: "Charles",
    date: "2025-01-15",
    categorie: "Technologie",
    tags: ["nodejs", "javascript", "backend"]
  },
  {
    id: 2,
    titre: "Les bases de Express.js",
    contenu: "Express.js est le framework web le plus populaire pour Node.js. Il fournit un ensemble robuste de fonctionnalités pour développer des applications web et mobiles. Express simplifie la création de serveurs HTTP avec un système de middleware puissant et un routage flexible.",
    auteur: "Nalis",
    date: "2025-02-20",
    categorie: "Développement",
    tags: ["express", "framework", "api"]
  },
  {
    id: 3,
    titre: "SQLite pour les débutants",
    contenu: "SQLite est un moteur de base de données relationnelle légère et autonome. Contrairement à MySQL ou PostgreSQL, SQLite ne nécessite pas de serveur séparé. La base de données est stockée dans un seul fichier, ce qui la rend parfaite pour le développement et les applications embarquées.",
    auteur: "Charles",
    date: "2025-03-10",
    categorie: "Base de données",
    tags: ["sqlite", "sql", "database"]
  },
  {
    id: 4,
    titre: "Créer une API RESTful",
    contenu: "Une API RESTful suit les principes REST (Representational State Transfer). Elle utilise les méthodes HTTP standard (GET, POST, PUT, DELETE) pour effectuer des opérations CRUD. Chaque ressource est identifiée par une URL unique et les données sont échangées au format JSON.",
    auteur: "Nalis",
    date: "2025-04-05",
    categorie: "Technologie",
    tags: ["api", "rest", "http"]
  },
  {
    id: 5,
    titre: "Documentation API avec Swagger",
    contenu: "Swagger (OpenAPI) est un outil puissant pour documenter et tester les API REST. Il génère une interface interactive permettant aux développeurs de comprendre et tester chaque endpoint. La spécification OpenAPI décrit la structure complète de l'API de manière standardisée.",
    auteur: "Charles",
    date: "2025-05-12",
    categorie: "Développement",
    tags: ["swagger", "openapi", "documentation"]
  }
];

// Charger les articles depuis localStorage
function loadArticles(): Article[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erreur chargement données:', e);
  }
  // Initialiser avec les données par défaut
  saveArticles(defaultArticles);
  return [...defaultArticles];
}

// Sauvegarder dans localStorage
function saveArticles(articles: Article[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

// Générer un nouvel ID
function getNextId(articles: Article[]): number {
  if (articles.length === 0) return 1;
  return Math.max(...articles.map(a => a.id)) + 1;
}

// ============================================
// OPÉRATIONS CRUD
// ============================================

// GET /api/articles - Liste tous les articles (avec filtrage optionnel)
export function getAllArticles(filters?: { categorie?: string; auteur?: string; date?: string }): Article[] {
  let articles = loadArticles();

  if (filters) {
    if (filters.categorie) {
      articles = articles.filter(a =>
        a.categorie.toLowerCase() === filters.categorie!.toLowerCase()
      );
    }
    if (filters.auteur) {
      articles = articles.filter(a =>
        a.auteur.toLowerCase() === filters.auteur!.toLowerCase()
      );
    }
    if (filters.date) {
      articles = articles.filter(a => a.date === filters.date);
    }
  }

  return articles;
}

// GET /api/articles/:id - Lire un article unique
export function getArticleById(id: number): Article | null {
  const articles = loadArticles();
  return articles.find(a => a.id === id) || null;
}

// POST /api/articles - Créer un article
export function createArticle(dto: CreateArticleDTO): Article {
  const articles = loadArticles();
  const newArticle: Article = {
    id: getNextId(articles),
    titre: dto.titre,
    contenu: dto.contenu,
    auteur: dto.auteur,
    date: new Date().toISOString().split('T')[0],
    categorie: dto.categorie,
    tags: dto.tags || []
  };
  articles.push(newArticle);
  saveArticles(articles);
  return newArticle;
}

// PUT /api/articles/:id - Modifier un article
export function updateArticle(id: number, dto: UpdateArticleDTO): Article | null {
  const articles = loadArticles();
  const index = articles.findIndex(a => a.id === id);

  if (index === -1) return null;

  const article = articles[index];
  if (dto.titre !== undefined) article.titre = dto.titre;
  if (dto.contenu !== undefined) article.contenu = dto.contenu;
  if (dto.auteur !== undefined) article.auteur = dto.auteur;
  if (dto.categorie !== undefined) article.categorie = dto.categorie;
  if (dto.tags !== undefined) article.tags = dto.tags;

  articles[index] = article;
  saveArticles(articles);
  return article;
}

// DELETE /api/articles/:id - Supprimer un article
export function deleteArticle(id: number): boolean {
  const articles = loadArticles();
  const index = articles.findIndex(a => a.id === id);

  if (index === -1) return false;

  articles.splice(index, 1);
  saveArticles(articles);
  return true;
}

// GET /api/articles/search?query=texte - Rechercher des articles
export function searchArticles(query: string): Article[] {
  const articles = loadArticles();
  const q = query.toLowerCase();
  return articles.filter(a =>
    a.titre.toLowerCase().includes(q) ||
    a.contenu.toLowerCase().includes(q)
  );
}

// Réinitialiser la base de données
export function resetDatabase(): void {
  saveArticles([...defaultArticles]);
}

// Statistiques
export function getStats() {
  const articles = loadArticles();
  const categories = [...new Set(articles.map(a => a.categorie))];
  const auteurs = [...new Set(articles.map(a => a.auteur))];

  return {
    totalArticles: articles.length,
    categories: categories.map(c => ({
      nom: c,
      count: articles.filter(a => a.categorie === c).length
    })),
    auteurs: auteurs.map(a => ({
      nom: a,
      count: articles.filter(art => art.auteur === a).length
    }))
  };
}
