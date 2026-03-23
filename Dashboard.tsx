import { useState, useEffect, useCallback } from 'react';
import * as ArticleController from '../api/controllers/ArticleController';
import type { Article, CreateArticleDTO } from '../api/models/Article';
import { Plus, Trash2, Edit3, Search, RefreshCw, X } from 'lucide-react';

const emptyForm: CreateArticleDTO = {
  titre: '',
  contenu: '',
  auteur: '',
  categorie: '',
  tags: []
};

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateArticleDTO>({ ...emptyForm });
  const [tagsInput, setTagsInput] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [statsData, setStatsData] = useState<{ totalArticles: number; categories: { nom: string; count: number }[]; auteurs: { nom: string; count: number }[] } | null>(null);

  const loadArticles = useCallback(() => {
    const result = ArticleController.getAll();
    if (result.data) setArticles(result.data);
    const s = ArticleController.stats();
    setStatsData(s.data);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      loadArticles();
      return;
    }
    const result = ArticleController.search(searchTerm);
    if (result.data) setArticles(result.data);
    showNotif('success', result.message);
  };

  const handleCreate = () => {
    const dto: CreateArticleDTO = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(t => t)
    };
    const result = ArticleController.create(dto);
    if (result.success) {
      showNotif('success', result.message);
      setShowForm(false);
      setForm({ ...emptyForm });
      setTagsInput('');
      loadArticles();
    } else {
      showNotif('error', result.message);
    }
  };

  const handleUpdate = () => {
    if (editingId === null) return;
    const dto = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(t => t)
    };
    const result = ArticleController.update(editingId, dto);
    if (result.success) {
      showNotif('success', result.message);
      setEditingId(null);
      setShowForm(false);
      setForm({ ...emptyForm });
      setTagsInput('');
      loadArticles();
    } else {
      showNotif('error', result.message);
    }
  };

  const handleDelete = (id: number) => {
    const result = ArticleController.remove(id);
    if (result.success) {
      showNotif('success', result.message);
      loadArticles();
    } else {
      showNotif('error', result.message);
    }
  };

  const startEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({
      titre: article.titre,
      contenu: article.contenu,
      auteur: article.auteur,
      categorie: article.categorie,
      tags: article.tags
    });
    setTagsInput(article.tags.join(', '));
    setShowForm(true);
  };

  const handleReset = () => {
    ArticleController.reset();
    loadArticles();
    showNotif('success', 'Base de données réinitialisée');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-6 rounded-xl mb-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-1">📊 Dashboard - Gestion des Articles</h2>
        <p className="text-teal-200 text-sm">Interface CRUD complète pour gérer les articles du blog</p>
      </div>

      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-indigo-600">{statsData.totalArticles}</div>
            <div className="text-xs text-gray-500 mt-1">Articles total</div>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600">{statsData.categories.length}</div>
            <div className="text-xs text-gray-500 mt-1">Catégories</div>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-orange-600">{statsData.auteurs.length}</div>
            <div className="text-xs text-gray-500 mt-1">Auteurs</div>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Par catégorie</div>
            {statsData.categories.map(c => (
              <div key={c.nom} className="flex justify-between text-xs">
                <span className="text-gray-700">{c.nom}</span>
                <span className="font-bold text-indigo-600">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Rechercher dans titre ou contenu..."
              className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-teal-300 focus:outline-none"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Rechercher
          </button>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }); setTagsInput(''); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={16} /> Nouvel article
        </button>
        <button
          onClick={() => { setSearchTerm(''); loadArticles(); }}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={handleReset}
          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm transition-colors"
          title="Réinitialiser la BDD"
        >
          🔄 Reset
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white border-2 border-teal-300 rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">
              {editingId ? `✏️ Modifier l'article #${editingId}` : '➕ Créer un nouvel article'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Titre *</label>
              <input
                type="text"
                value={form.titre}
                onChange={e => setForm({ ...form, titre: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-300 focus:outline-none"
                placeholder="Titre de l'article"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Auteur *</label>
              <input
                type="text"
                value={form.auteur}
                onChange={e => setForm({ ...form, auteur: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-300 focus:outline-none"
                placeholder="Nom de l'auteur"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Catégorie *</label>
              <input
                type="text"
                value={form.categorie}
                onChange={e => setForm({ ...form, categorie: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-300 focus:outline-none"
                placeholder="Ex: Technologie, Développement..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Tags (séparés par virgule)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-300 focus:outline-none"
                placeholder="nodejs, express, api"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Contenu *</label>
            <textarea
              value={form.contenu}
              onChange={e => setForm({ ...form, contenu: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-300 focus:outline-none"
              placeholder="Contenu de l'article..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              {editingId ? '💾 Enregistrer les modifications' : '✅ Créer l\'article'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des articles */}
      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border">
            <p className="text-gray-400 text-lg">Aucun article trouvé</p>
          </div>
        ) : (
          articles.map(article => (
            <div key={article.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">#{article.id}</span>
                    <h4 className="font-bold text-gray-800 text-lg">{article.titre}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.contenu}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                      👤 {article.auteur}
                    </span>
                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-semibold">
                      📁 {article.categorie}
                    </span>
                    <span className="text-gray-400">
                      📅 {article.date}
                    </span>
                    {article.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(article)}
                    className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
