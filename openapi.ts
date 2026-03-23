// ============================================
// SPÉCIFICATION OpenAPI 3.0 (Swagger)
// Décrit tous les endpoints de l'API Blog
// ============================================

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "API Blog - Gestion des Articles",
    description: "API RESTful pour gérer un blog simple. Permet la création, lecture, modification, suppression et recherche d'articles. Développée avec Node.js (Express) et SQLite.",
    version: "1.0.0",
    contact: {
      name: "Étudiant Développeur Web"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Serveur de développement local"
    }
  ],
  paths: {
    "/api/articles": {
      get: {
        tags: ["Articles"],
        summary: "Lire / afficher les articles",
        description: "Récupérer la liste complète ou filtrée par catégorie, auteur ou date. La réponse est un tableau JSON avec tous les articles correspondants.",
        parameters: [
          {
            name: "categorie",
            in: "query",
            required: false,
            description: "Filtrer par catégorie",
            schema: { type: "string" }
          },
          {
            name: "auteur",
            in: "query",
            required: false,
            description: "Filtrer par auteur",
            schema: { type: "string" }
          },
          {
            name: "date",
            in: "query",
            required: false,
            description: "Filtrer par date (YYYY-MM-DD)",
            schema: { type: "string", format: "date" }
          }
        ],
        responses: {
          "200": {
            description: "Liste des articles récupérée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "array",
                      items: { "$ref": "#/components/schemas/Article" }
                    }
                  }
                },
                example: {
                  success: true,
                  message: "5 article(s) trouvé(s)",
                  data: [
                    {
                      id: 1,
                      titre: "Introduction à Node.js",
                      contenu: "Node.js est un environnement...",
                      auteur: "Charles",
                      date: "2025-01-15",
                      categorie: "Technologie",
                      tags: ["nodejs", "javascript"]
                    }
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Articles"],
        summary: "Créer un article",
        description: "Chaque article doit contenir : titre, contenu, auteur, date, catégorie, tags. L'article est stocké dans la base de données et une confirmation avec l'ID est renvoyée.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/CreateArticle" },
              example: {
                titre: "Mon nouvel article",
                contenu: "Contenu détaillé de l'article...",
                auteur: "Charles",
                categorie: "Technologie",
                tags: ["nodejs", "express"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Article créé avec succès - confirmation avec l'ID",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Article créé avec succès (ID: 6)",
                  data: {
                    id: 6,
                    titre: "Mon nouvel article",
                    contenu: "Contenu détaillé de l'article...",
                    auteur: "Charles",
                    date: "2025-06-01",
                    categorie: "Technologie",
                    tags: ["nodejs", "express"]
                  }
                }
              }
            }
          },
          "400": {
            description: "Erreur de validation",
            content: {
              "application/json": {
                example: {
                  success: false,
                  message: "Le titre est requis",
                  error: "VALIDATION_ERROR"
                }
              }
            }
          }
        }
      }
    },
    "/api/articles/{id}": {
      get: {
        tags: ["Articles"],
        summary: "Lire un article unique",
        description: "Récupérer un article spécifique via son ID. La réponse contient toutes les informations de l'article.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de l'article",
            schema: { type: "integer" }
          }
        ],
        responses: {
          "200": {
            description: "Article trouvé - toutes les informations retournées",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Article trouvé",
                  data: {
                    id: 1,
                    titre: "Introduction à Node.js",
                    contenu: "Node.js est un environnement d'exécution...",
                    auteur: "Charles",
                    date: "2025-01-15",
                    categorie: "Technologie",
                    tags: ["nodejs", "javascript", "backend"]
                  }
                }
              }
            }
          },
          "404": {
            description: "Article non trouvé",
            content: {
              "application/json": {
                example: {
                  success: false,
                  message: "Article avec l'ID 99 non trouvé",
                  error: "NOT_FOUND"
                }
              }
            }
          }
        }
      },
      put: {
        tags: ["Articles"],
        summary: "Modifier un article",
        description: "Mettre à jour le titre, contenu, catégorie ou tags d'un article existant. Les modifications sont enregistrées et une confirmation est renvoyée.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de l'article à modifier",
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/UpdateArticle" },
              example: {
                titre: "Titre modifié",
                contenu: "Nouveau contenu mis à jour",
                categorie: "Développement",
                tags: ["updated", "modified"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Modifications enregistrées - confirmation renvoyée",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Article modifié avec succès",
                  data: {
                    id: 1,
                    titre: "Titre modifié",
                    contenu: "Nouveau contenu mis à jour",
                    auteur: "Charles",
                    date: "2025-01-15",
                    categorie: "Développement",
                    tags: ["updated", "modified"]
                  }
                }
              }
            }
          },
          "404": {
            description: "Article non trouvé"
          }
        }
      },
      delete: {
        tags: ["Articles"],
        summary: "Supprimer un article",
        description: "Supprimer un article via son ID. L'article est supprimé et une confirmation est renvoyée.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de l'article à supprimer",
            schema: { type: "integer" }
          }
        ],
        responses: {
          "200": {
            description: "Article supprimé - confirmation renvoyée",
            content: {
              "application/json": {
                example: {
                  success: false,
                  message: "Article avec l'ID 1 supprimé avec succès"
                }
              }
            }
          },
          "404": {
            description: "Article non trouvé"
          }
        }
      }
    },
    "/api/articles/search": {
      get: {
        tags: ["Recherche"],
        summary: "Rechercher un article",
        description: "Rechercher des articles dont le titre ou le contenu contient un texte donné. La réponse est un tableau JSON des articles correspondant à la recherche.",
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            description: "Texte à rechercher dans le titre ou le contenu",
            schema: { type: "string" },
            example: "Node"
          }
        ],
        responses: {
          "200": {
            description: "Tableau JSON des articles correspondants",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: '2 article(s) trouvé(s) pour "Node"',
                  data: [
                    {
                      id: 1,
                      titre: "Introduction à Node.js",
                      contenu: "Node.js est un environnement...",
                      auteur: "Charles",
                      date: "2025-01-15",
                      categorie: "Technologie",
                      tags: ["nodejs", "javascript"]
                    }
                  ]
                }
              }
            }
          },
          "400": {
            description: "Paramètre query manquant"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Article: {
        type: "object",
        properties: {
          id: { type: "integer", description: "Identifiant unique auto-généré" },
          titre: { type: "string", description: "Titre de l'article" },
          contenu: { type: "string", description: "Contenu textuel de l'article" },
          auteur: { type: "string", description: "Nom de l'auteur" },
          date: { type: "string", format: "date", description: "Date de création (YYYY-MM-DD)" },
          categorie: { type: "string", description: "Catégorie de l'article" },
          tags: { type: "array", items: { type: "string" }, description: "Liste des tags" }
        },
        required: ["id", "titre", "contenu", "auteur", "date", "categorie", "tags"]
      },
      CreateArticle: {
        type: "object",
        properties: {
          titre: { type: "string", description: "Titre de l'article" },
          contenu: { type: "string", description: "Contenu de l'article" },
          auteur: { type: "string", description: "Auteur de l'article" },
          categorie: { type: "string", description: "Catégorie" },
          tags: { type: "array", items: { type: "string" }, description: "Tags" }
        },
        required: ["titre", "contenu", "auteur", "categorie"]
      },
      UpdateArticle: {
        type: "object",
        properties: {
          titre: { type: "string", description: "Nouveau titre" },
          contenu: { type: "string", description: "Nouveau contenu" },
          categorie: { type: "string", description: "Nouvelle catégorie" },
          tags: { type: "array", items: { type: "string" }, description: "Nouveaux tags" }
        }
      }
    }
  }
};
