// ============================================
// MODÈLE ARTICLE - Structure de données
// Conforme au cahier des charges :
//   titre, contenu, auteur, date, catégorie, tags
// ============================================

export interface Article {
  id: number;
  titre: string;
  contenu: string;
  auteur: string;
  date: string;        // ISO 8601
  categorie: string;
  tags: string[];
}

export interface CreateArticleDTO {
  titre: string;
  contenu: string;
  auteur: string;
  categorie: string;
  tags: string[];
}

export interface UpdateArticleDTO {
  titre?: string;
  contenu?: string;
  auteur?: string;
  categorie?: string;
  tags?: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface SearchParams {
  query?: string;
  categorie?: string;
  auteur?: string;
  date?: string;
}
