import { useState } from 'react';
import * as ArticleController from '../api/controllers/ArticleController';
import { Play, RotateCcw, Send } from 'lucide-react';

type EndpointKey =
  | 'GET_ALL'
  | 'GET_BY_ID'
  | 'POST_CREATE'
  | 'PUT_UPDATE'
  | 'DELETE'
  | 'SEARCH'
  | 'RESET';

interface EndpointConfig {
  key: EndpointKey;
  method: string;
  path: string;
  description: string;
  color: string;
  badgeColor: string;
}

const endpoints: EndpointConfig[] = [
  { key: 'GET_ALL',    method: 'GET',    path: '/api/articles',              description: 'Lire tous les articles',          color: 'bg-blue-50 border-blue-300',     badgeColor: 'bg-blue-600' },
  { key: 'GET_BY_ID',  method: 'GET',    path: '/api/articles/{id}',         description: 'Lire un article unique',          color: 'bg-blue-50 border-blue-300',     badgeColor: 'bg-blue-600' },
  { key: 'SEARCH',     method: 'GET',    path: '/api/articles/search?query=', description: 'Rechercher des articles',        color: 'bg-blue-50 border-blue-300',     badgeColor: 'bg-blue-600' },
  { key: 'POST_CREATE',method: 'POST',   path: '/api/articles',              description: 'Créer un article',                color: 'bg-green-50 border-green-300',   badgeColor: 'bg-green-600' },
  { key: 'PUT_UPDATE', method: 'PUT',    path: '/api/articles/{id}',         description: 'Modifier un article',             color: 'bg-orange-50 border-orange-300', badgeColor: 'bg-orange-500' },
  { key: 'DELETE',     method: 'DELETE', path: '/api/articles/{id}',         description: 'Supprimer un article',            color: 'bg-red-50 border-red-300',       badgeColor: 'bg-red-600' },
  { key: 'RESET',      method: 'POST',   path: '/api/reset',                 description: 'Réinitialiser la BDD',            color: 'bg-gray-50 border-gray-300',     badgeColor: 'bg-gray-600' },
];

export default function ApiTester() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointKey>('GET_ALL');
  const [response, setResponse] = useState<string>('');
  const [statusCode, setStatusCode] = useState<number>(0);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [articleId, setArticleId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('Node');
  const [filterCategorie, setFilterCategorie] = useState<string>('');
  const [filterAuteur, setFilterAuteur] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>(JSON.stringify({
    titre: "Mon nouvel article",
    contenu: "Contenu de l'article créé via l'API...",
    auteur: "Étudiant",
    categorie: "Technologie",
    tags: ["api", "test"]
  }, null, 2));
  const [updateBody, setUpdateBody] = useState<string>(JSON.stringify({
    titre: "Titre mis à jour",
    contenu: "Contenu modifié",
    categorie: "Développement",
    tags: ["updated"]
  }, null, 2));

  const executeRequest = () => {
    const start = performance.now();
    let result: unknown;
    let code = 200;

    try {
      switch (selectedEndpoint) {
        case 'GET_ALL': {
          const filters: { categorie?: string; auteur?: string } = {};
          if (filterCategorie) filters.categorie = filterCategorie;
          if (filterAuteur) filters.auteur = filterAuteur;
          result = ArticleController.getAll(Object.keys(filters).length > 0 ? filters : undefined);
          break;
        }
        case 'GET_BY_ID':
          result = ArticleController.getById(parseInt(articleId));
          if (!(result as { success: boolean }).success) code = 404;
          break;
        case 'SEARCH':
          result = ArticleController.search(searchQuery);
          if (!(result as { success: boolean }).success) code = 400;
          break;
        case 'POST_CREATE': {
          const body = JSON.parse(requestBody);
          result = ArticleController.create(body);
          code = (result as { success: boolean }).success ? 201 : 400;
          break;
        }
        case 'PUT_UPDATE': {
          const upBody = JSON.parse(updateBody);
          result = ArticleController.update(parseInt(articleId), upBody);
          if (!(result as { success: boolean }).success) code = 404;
          break;
        }
        case 'DELETE':
          result = ArticleController.remove(parseInt(articleId));
          if (!(result as { success: boolean }).success) code = 404;
          break;
        case 'RESET':
          result = ArticleController.reset();
          break;
      }
    } catch (e) {
      code = 500;
      result = { success: false, message: 'Erreur serveur', error: String(e) };
    }

    const elapsed = performance.now() - start;
    setResponseTime(Math.round(elapsed * 100) / 100);
    setStatusCode(code);
    setResponse(JSON.stringify(result, null, 2));
  };

  const currentEndpoint = endpoints.find(e => e.key === selectedEndpoint)!;

  const getStatusColor = () => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-100';
    if (statusCode >= 400 && statusCode < 500) return 'text-red-600 bg-red-100';
    if (statusCode >= 500) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-6 rounded-xl mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Send size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Testeur d'API Interactif</h2>
            <span className="text-indigo-200 text-sm">Simulateur Postman / Swagger UI - Tester les endpoints localement</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Sélection endpoint */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-3">📡 Endpoints disponibles</h3>
            <div className="space-y-2">
              {endpoints.map(ep => (
                <button
                  key={ep.key}
                  onClick={() => setSelectedEndpoint(ep.key)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedEndpoint === ep.key
                      ? `${ep.color} border-2 shadow-sm`
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${ep.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase`}>
                      {ep.method}
                    </span>
                    <code className="text-xs font-mono text-gray-700 truncate">{ep.path}</code>
                  </div>
                  <p className="text-xs text-gray-500">{ep.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite - Requête & Réponse */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barre de requête */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className={`${currentEndpoint.badgeColor} text-white text-sm font-bold px-4 py-1.5 rounded uppercase`}>
                {currentEndpoint.method}
              </span>
              <code className="font-mono text-sm text-gray-800 bg-gray-100 px-3 py-1.5 rounded flex-1">
                http://localhost:3000{currentEndpoint.path}
              </code>
              <button
                onClick={executeRequest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md"
              >
                <Play size={16} /> Exécuter
              </button>
            </div>

            {/* Paramètres dynamiques */}
            {(selectedEndpoint === 'GET_BY_ID' || selectedEndpoint === 'PUT_UPDATE' || selectedEndpoint === 'DELETE') && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">ID de l'article :</label>
                <input
                  type="number"
                  value={articleId}
                  onChange={e => setArticleId(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-32 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                  min="1"
                />
              </div>
            )}

            {selectedEndpoint === 'SEARCH' && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Texte de recherche (query) :</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                  placeholder="Ex: Node, Express, SQLite..."
                />
              </div>
            )}

            {selectedEndpoint === 'GET_ALL' && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Filtrer par catégorie :</label>
                  <input
                    type="text"
                    value={filterCategorie}
                    onChange={e => setFilterCategorie(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                    placeholder="Ex: Technologie"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Filtrer par auteur :</label>
                  <input
                    type="text"
                    value={filterAuteur}
                    onChange={e => setFilterAuteur(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                    placeholder="Ex: Charles"
                  />
                </div>
              </div>
            )}

            {selectedEndpoint === 'POST_CREATE' && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Corps de la requête (JSON) :</label>
                <textarea
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  rows={8}
                  className="border rounded-lg px-3 py-2 w-full font-mono text-xs focus:ring-2 focus:ring-indigo-300 focus:outline-none bg-gray-50"
                />
              </div>
            )}

            {selectedEndpoint === 'PUT_UPDATE' && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Corps de la requête (JSON) :</label>
                <textarea
                  value={updateBody}
                  onChange={e => setUpdateBody(e.target.value)}
                  rows={6}
                  className="border rounded-lg px-3 py-2 w-full font-mono text-xs focus:ring-2 focus:ring-indigo-300 focus:outline-none bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Réponse */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                📤 Réponse
              </h3>
              {statusCode > 0 && (
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded ${getStatusColor()}`}>
                    Status: {statusCode}
                  </span>
                  <span className="text-xs text-gray-500">⏱️ {responseTime}ms</span>
                  <button
                    onClick={() => { setResponse(''); setStatusCode(0); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="p-0">
              {response ? (
                <pre className="bg-gray-900 text-green-400 p-5 text-xs overflow-x-auto leading-relaxed min-h-[200px] max-h-[500px] overflow-y-auto">
                  {response}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                  <div className="text-center">
                    <Send size={40} className="mx-auto mb-2 opacity-30" />
                    <p>Cliquez sur "Exécuter" pour envoyer la requête</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
