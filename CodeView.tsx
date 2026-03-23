import { useState } from 'react';
import { FileCode, Database, Server, FolderTree, Terminal } from 'lucide-react';

interface CodeTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  filename: string;
  language: string;
  code: string;
}

const codeTabs: CodeTab[] = [
  {
    id: 'structure',
    label: 'Structure',
    icon: <FolderTree size={16} />,
    filename: 'Structure du projet',
    language: 'text',
    code: `blog-api/
├── node_modules/
├── database/
│   └── blog.db                 ← Base de données SQLite
├── src/
│   ├── models/
│   │   └── articleModel.js     ← Modèle Article (Sequelize/SQLite)
│   ├── controllers/
│   │   └── articleController.js ← Logique métier CRUD
│   ├── routes/
│   │   └── articleRoutes.js    ← Définition des routes Express
│   └── database/
│       └── db.js               ← Configuration SQLite
├── swagger/
│   └── swagger.json            ← Spécification OpenAPI 3.0
├── server.js                   ← Point d'entrée Express
├── package.json
└── README.md`
  },
  {
    id: 'server',
    label: 'server.js',
    icon: <Server size={16} />,
    filename: 'server.js',
    language: 'javascript',
    code: `// ============================================
// SERVEUR EXPRESS - Point d'entrée de l'API
// ============================================
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const articleRoutes = require('./src/routes/articleRoutes');
const { initDatabase } = require('./src/database/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes API
app.use('/api/articles', articleRoutes);

// Initialiser la BDD et démarrer le serveur
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(\`🚀 Serveur démarré sur http://localhost:\${PORT}\`);
    console.log(\`📚 Documentation Swagger : http://localhost:\${PORT}/api-docs\`);
  });
});`
  },
  {
    id: 'database',
    label: 'db.js',
    icon: <Database size={16} />,
    filename: 'src/database/db.js',
    language: 'javascript',
    code: `// ============================================
// CONFIGURATION BASE DE DONNÉES SQLite
// ============================================
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/blog.db');

// Créer / ouvrir la connexion SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erreur connexion SQLite:', err.message);
  } else {
    console.log('✅ Connecté à la base de données SQLite');
  }
});

// Initialiser la table articles
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.run(\`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titre TEXT NOT NULL,
        contenu TEXT NOT NULL,
        auteur TEXT NOT NULL,
        date TEXT DEFAULT (date('now')),
        categorie TEXT NOT NULL,
        tags TEXT DEFAULT '[]'
      )
    \`, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Table "articles" prête');
        resolve();
      }
    });
  });
}

module.exports = { db, initDatabase };`
  },
  {
    id: 'model',
    label: 'articleModel.js',
    icon: <FileCode size={16} />,
    filename: 'src/models/articleModel.js',
    language: 'javascript',
    code: `// ============================================
// MODÈLE ARTICLE - Opérations CRUD sur SQLite
// ============================================
const { db } = require('../database/db');

// Récupérer tous les articles (avec filtres optionnels)
function getAll(filters = {}) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM articles';
    const params = [];
    const conditions = [];

    if (filters.categorie) {
      conditions.push('categorie = ?');
      params.push(filters.categorie);
    }
    if (filters.auteur) {
      conditions.push('auteur = ?');
      params.push(filters.auteur);
    }
    if (filters.date) {
      conditions.push('date = ?');
      params.push(filters.date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY id DESC';

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => ({
        ...r,
        tags: JSON.parse(r.tags || '[]')
      })));
    });
  });
}

// Récupérer un article par ID
function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else if (row) {
        row.tags = JSON.parse(row.tags || '[]');
        resolve(row);
      } else resolve(null);
    });
  });
}

// Créer un nouvel article
function create(data) {
  return new Promise((resolve, reject) => {
    const { titre, contenu, auteur, categorie, tags } = data;
    db.run(
      \`INSERT INTO articles (titre, contenu, auteur, categorie, tags)
       VALUES (?, ?, ?, ?, ?)\`,
      [titre, contenu, auteur, categorie, JSON.stringify(tags || [])],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data, date: new Date().toISOString().split('T')[0] });
      }
    );
  });
}

// Modifier un article existant
function update(id, data) {
  return new Promise((resolve, reject) => {
    const fields = [];
    const params = [];

    if (data.titre) { fields.push('titre = ?'); params.push(data.titre); }
    if (data.contenu) { fields.push('contenu = ?'); params.push(data.contenu); }
    if (data.categorie) { fields.push('categorie = ?'); params.push(data.categorie); }
    if (data.tags) { fields.push('tags = ?'); params.push(JSON.stringify(data.tags)); }

    if (fields.length === 0) return resolve(null);

    params.push(id);
    db.run(
      \`UPDATE articles SET \${fields.join(', ')} WHERE id = ?\`,
      params,
      function(err) {
        if (err) reject(err);
        else if (this.changes === 0) resolve(null);
        else getById(id).then(resolve).catch(reject);
      }
    );
  });
}

// Supprimer un article
function remove(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

// Rechercher des articles (titre ou contenu)
function search(query) {
  return new Promise((resolve, reject) => {
    db.all(
      \`SELECT * FROM articles
       WHERE titre LIKE ? OR contenu LIKE ?
       ORDER BY id DESC\`,
      [\`%\${query}%\`, \`%\${query}%\`],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => ({
          ...r,
          tags: JSON.parse(r.tags || '[]')
        })));
      }
    );
  });
}

module.exports = { getAll, getById, create, update, remove, search };`
  },
  {
    id: 'controller',
    label: 'articleController.js',
    icon: <FileCode size={16} />,
    filename: 'src/controllers/articleController.js',
    language: 'javascript',
    code: `// ============================================
// CONTRÔLEUR DES ARTICLES
// Gère les requêtes HTTP et la validation
// ============================================
const Article = require('../models/articleModel');

// GET /api/articles
// Récupérer la liste complète ou filtrée
exports.getAll = async (req, res) => {
  try {
    const filters = {};
    if (req.query.categorie) filters.categorie = req.query.categorie;
    if (req.query.auteur) filters.auteur = req.query.auteur;
    if (req.query.date) filters.date = req.query.date;

    const articles = await Article.getAll(filters);
    res.status(200).json({
      success: true,
      message: \`\${articles.length} article(s) trouvé(s)\`,
      data: articles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/articles/:id
// Récupérer un article spécifique via son ID
exports.getById = async (req, res) => {
  try {
    const article = await Article.getById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: \`Article avec l'ID \${req.params.id} non trouvé\`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Article trouvé',
      data: article
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/articles
// Créer un nouvel article
exports.create = async (req, res) => {
  try {
    const { titre, contenu, auteur, categorie, tags } = req.body;

    // Validation
    if (!titre || !contenu || !auteur || !categorie) {
      return res.status(400).json({
        success: false,
        message: 'Titre, contenu, auteur et catégorie sont requis'
      });
    }

    const article = await Article.create({
      titre, contenu, auteur, categorie, tags
    });

    res.status(201).json({
      success: true,
      message: \`Article créé avec succès (ID: \${article.id})\`,
      data: article
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/articles/:id
// Modifier un article existant
exports.update = async (req, res) => {
  try {
    const article = await Article.update(req.params.id, req.body);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: \`Article avec l'ID \${req.params.id} non trouvé\`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Article modifié avec succès',
      data: article
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/articles/:id
// Supprimer un article via son ID
exports.delete = async (req, res) => {
  try {
    const deleted = await Article.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: \`Article avec l'ID \${req.params.id} non trouvé\`
      });
    }
    res.status(200).json({
      success: true,
      message: \`Article avec l'ID \${req.params.id} supprimé avec succès\`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/articles/search?query=texte
// Rechercher des articles par titre ou contenu
exports.search = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "query" est requis'
      });
    }
    const articles = await Article.search(query);
    res.status(200).json({
      success: true,
      message: \`\${articles.length} article(s) trouvé(s) pour "\${query}"\`,
      data: articles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};`
  },
  {
    id: 'routes',
    label: 'articleRoutes.js',
    icon: <FileCode size={16} />,
    filename: 'src/routes/articleRoutes.js',
    language: 'javascript',
    code: `// ============================================
// ROUTES DES ARTICLES
// Définition des endpoints de l'API
// ============================================
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// GET /api/articles/search?query=texte
// ⚠️ Cette route doit être AVANT /:id
router.get('/search', articleController.search);

// GET /api/articles
// Liste complète ou filtrée (categorie, auteur, date)
router.get('/', articleController.getAll);

// GET /api/articles/:id
// Lire un article unique par son ID
router.get('/:id', articleController.getById);

// POST /api/articles
// Créer un nouvel article
router.post('/', articleController.create);

// PUT /api/articles/:id
// Modifier un article existant
router.put('/:id', articleController.update);

// DELETE /api/articles/:id
// Supprimer un article via son ID
router.delete('/:id', articleController.delete);

module.exports = router;`
  },
  {
    id: 'package',
    label: 'package.json',
    icon: <FileCode size={16} />,
    filename: 'package.json',
    language: 'json',
    code: `{
  "name": "blog-api",
  "version": "1.0.0",
  "description": "API Backend pour gérer un blog simple - Node.js Express SQLite",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "sqlite3": "^5.1.7",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}`
  },
  {
    id: 'install',
    label: 'Installation',
    icon: <Terminal size={16} />,
    filename: 'Commandes d\'installation et de test',
    language: 'bash',
    code: `# ============================================
# INSTALLATION ET DÉMARRAGE DU PROJET
# ============================================

# 1. Créer le dossier du projet
mkdir blog-api && cd blog-api

# 2. Initialiser le projet Node.js
npm init -y

# 3. Installer les dépendances
npm install express sqlite3 cors swagger-ui-express
npm install --save-dev nodemon

# 4. Créer la structure des dossiers
mkdir -p src/models src/controllers src/routes src/database
mkdir -p database swagger

# 5. Démarrer le serveur en mode développement
npm run dev

# ============================================
# TESTER L'API AVEC CURL (Postman / Terminal)
# ============================================

# Lire tous les articles
curl http://localhost:3000/api/articles

# Lire un article par ID
curl http://localhost:3000/api/articles/1

# Filtrer par catégorie
curl "http://localhost:3000/api/articles?categorie=Technologie"

# Filtrer par auteur
curl "http://localhost:3000/api/articles?auteur=Charles"

# Rechercher un article
curl "http://localhost:3000/api/articles/search?query=Node"

# Créer un article
curl -X POST http://localhost:3000/api/articles \\
  -H "Content-Type: application/json" \\
  -d '{
    "titre": "Mon article",
    "contenu": "Contenu de test",
    "auteur": "Étudiant",
    "categorie": "Technologie",
    "tags": ["test", "api"]
  }'

# Modifier un article (ID = 1)
curl -X PUT http://localhost:3000/api/articles/1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "titre": "Titre modifié",
    "contenu": "Contenu mis à jour"
  }'

# Supprimer un article (ID = 1)
curl -X DELETE http://localhost:3000/api/articles/1

# Accéder à la documentation Swagger
# Ouvrir dans le navigateur : http://localhost:3000/api-docs`
  }
];

export default function CodeView() {
  const [activeTab, setActiveTab] = useState('structure');
  const currentTab = codeTabs.find(t => t.id === activeTab)!;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-xl mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gray-600 p-2 rounded-lg">
            <FileCode size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">💻 Code Source du Backend</h2>
            <span className="text-gray-300 text-sm">Architecture Node.js (Express) + SQLite - Pattern MVC</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Voici le code source complet du serveur backend. Chaque fichier suit le pattern MVC
          (Modèle - Vue - Contrôleur) avec Express.js et SQLite comme base de données.
        </p>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b bg-gray-50">
          {codeTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* En-tête fichier */}
        <div className="flex items-center gap-2 px-5 py-3 bg-gray-100 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <code className="text-xs text-gray-600 font-mono ml-2">{currentTab.filename}</code>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded ml-auto">{currentTab.language}</span>
        </div>

        {/* Code */}
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-5 overflow-x-auto text-xs leading-relaxed max-h-[600px] overflow-y-auto">
            <code>{currentTab.code}</code>
          </pre>
        </div>
      </div>

      {/* Technologies */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { name: 'Node.js', desc: 'Runtime JavaScript', color: 'bg-green-100 text-green-800 border-green-300', icon: '🟢' },
          { name: 'Express.js', desc: 'Framework web', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '⚡' },
          { name: 'SQLite', desc: 'Base de données', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🗄️' },
          { name: 'Swagger', desc: 'Documentation API', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '📚' },
        ].map(tech => (
          <div key={tech.name} className={`${tech.color} border rounded-xl p-4 text-center`}>
            <div className="text-2xl mb-1">{tech.icon}</div>
            <div className="font-bold text-sm">{tech.name}</div>
            <div className="text-xs opacity-70">{tech.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
