# TP-INF-222
# Blog API Backend

## 📌 Description
Ce projet est une API backend développée avec Node.js et Express dans le cadre du cours INF222 (Développement Backend).  
Elle permet de gérer un blog simple en manipulant des articles (création, lecture, modification, suppression).

---

## 🚀 Technologies utilisées
- Node.js
- Express
- SQLite (base de données)
- Swagger (documentation API)
- Postman (tests)

---

## 📁 Structure du projet
blog_api/  
├── controllers/       (Logique métier)  
├── models/            (Base de données)  
├── routes/            (Routes API)  
├── swagger/           (Documentation)  
├── index.js           (Serveur principal)  
├── package.json  

---

## ⚙️ Installation

1. Se placer dans le dossier du projet :
cd blog_api

2. Installer les dépendances :
npm install

3. Lancer le serveur :
npx nodemon index.js

---

## 🌐 Accès à l'application
- API : http://localhost:3000  
- Swagger : http://localhost:3000/api-docs  

---

## 📌 Endpoints

### 🔹 Créer un article
POST /api/articles  

Body JSON :
{
  "titre": "Mon article",
  "contenu": "Contenu du blog",
  "auteur": "Nom",
  "date": "2026-03-23",
  "categorie": "Tech",
  "tags": "Node.js"
}

---

### 🔹 Lire tous les articles
GET /api/articles  

---

### 🔹 Lire un article par ID
GET /api/articles/:id  

---

### 🔹 Modifier un article
PUT /api/articles/:id  

---

### 🔹 Supprimer un article
DELETE /api/articles/:id  

---

## 🧪 Tests
- Postman  
- Swagger UI  

---

## ✅ Bonnes pratiques
- Validation des données (titre et auteur obligatoires)  
- Utilisation des codes HTTP (200, 201, 400, 404, 500)  
- Organisation du projet en MVC  

---

## 👤 Auteur
Nom : [Ton nom]  
Filière : [Ta filière]  
UE : INF222  

---

## 📌 Conclusion
Ce projet m’a permis de comprendre le fonctionnement d’une API backend, la gestion des routes, l’utilisation d’une base de données ainsi que la documentation avec Swagger.
