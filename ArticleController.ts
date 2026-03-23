// ============================================
// CONTRÔLEUR DES ARTICLES
// Gère la logique métier et la validation
// ============================================

import { CreateArticleDTO, UpdateArticleDTO, ApiResponse } from '../models/Article';
import * as db from '../database/db';
import type { Article } from '../models/Article';

// Validation des données
function validateCreateDTO(dto: CreateArticleDTO): string | null {
  if (!dto.titre || dto.titre.trim() === '') return 'Le titre est requis';
  if (!dto.contenu || dto.contenu.trim() === '') return 'Le contenu est requis';
  if (!dto.auteur || dto.auteur.trim() === '') return "L'auteur est requis";
  if (!dto.categorie || dto.categorie.trim() === '') return 'La catégorie est requise';
  return null;
}

// GET /api/articles
export function getAll(filters?: { categorie?: string; auteur?: string; date?: string }): ApiResponse<Article[]> {
  const articles = db.getAllArticles(filters);
  return {
    success: true,
    message: `${articles.length} article(s) trouvé(s)`,
    data: articles
  };
}

// GET /api/articles/:id
export function getById(id: number): ApiResponse<Article> {
  const article = db.getArticleById(id);
  if (!article) {
    return {
      success: false,
      message: `Article avec l'ID ${id} non trouvé`,
      error: 'NOT_FOUND'
    };
  }
  return {
    success: true,
    message: 'Article trouvé',
    data: article
  };
}

// POST /api/articles
export function create(dto: CreateArticleDTO): ApiResponse<Article> {
  const validationError = validateCreateDTO(dto);
  if (validationError) {
    return {
      success: false,
      message: validationError,
      error: 'VALIDATION_ERROR'
    };
  }

  const article = db.createArticle(dto);
  return {
    success: true,
    message: `Article créé avec succès (ID: ${article.id})`,
    data: article
  };
}

// PUT /api/articles/:id
export function update(id: number, dto: UpdateArticleDTO): ApiResponse<Article> {
  const existing = db.getArticleById(id);
  if (!existing) {
    return {
      success: false,
      message: `Article avec l'ID ${id} non trouvé`,
      error: 'NOT_FOUND'
    };
  }

  if (dto.titre !== undefined && dto.titre.trim() === '') {
    return {
      success: false,
      message: 'Le titre ne peut pas être vide',
      error: 'VALIDATION_ERROR'
    };
  }

  const updated = db.updateArticle(id, dto);
  return {
    success: true,
    message: 'Article modifié avec succès',
    data: updated!
  };
}

// DELETE /api/articles/:id
export function remove(id: number): ApiResponse<null> {
  const existing = db.getArticleById(id);
  if (!existing) {
    return {
      success: false,
      message: `Article avec l'ID ${id} non trouvé`,
      error: 'NOT_FOUND'
    };
  }

  db.deleteArticle(id);
  return {
    success: true,
    message: `Article avec l'ID ${id} supprimé avec succès`
  };
}

// GET /api/articles/search?query=texte
export function search(query: string): ApiResponse<Article[]> {
  if (!query || query.trim() === '') {
    return {
      success: false,
      message: 'Le paramètre de recherche "query" est requis',
      error: 'VALIDATION_ERROR'
    };
  }

  const results = db.searchArticles(query);
  return {
    success: true,
    message: `${results.length} article(s) trouvé(s) pour "${query}"`,
    data: results
  };
}

// Stats
export function stats() {
  const s = db.getStats();
  return {
    success: true,
    message: 'Statistiques récupérées',
    data: s
  };
}

// Reset
export function reset(): ApiResponse<null> {
  db.resetDatabase();
  return {
    success: true,
    message: 'Base de données réinitialisée'
  };
}
