# 🔍️ **POKEVIEW**

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-ACTIVE-0aa86e?style=for-the-badge" />
  <img src="https://img.shields.io/badge/RUNTIME-BUN-F9D72C?style=for-the-badge&logo=bun&logoColor=000" />
  <img src="https://img.shields.io/badge/TECH-VANILLA_JS-3178C6?style=for-the-badge" />
  <img src="https://img.shields.io/badge/CACHE-INDEXEDDB-6C3CD4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/LICENSE-MIT-4c1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/CONTRIBUTIONS-CLOSED-FF7F50?style=for-the-badge" />
</p>

---

## 📘 **Overview**

**PokeView** is a fast, lightweight, and modular Pokédex viewer built with a focus on clarity, performance, and maintainable architecture.

Originally created as an academic project, it quickly expanded into a polished application featuring:

- **Structured modules**
- **Consistent UX**
- **Local caching for performance**
- **Internal state management**
- **Zero UI dependencies**

PokeView aims to demonstrate both _technical execution_ and _clean software design_.

---

## 📦 **Installation**

PokeView uses **[Bun](https://bun.sh/)** as its runtime and package manager.

### **1. Clone the repository**
```bash
git clone https://github.com/jhotiori/pokeview
```

### **2. Navigate into the project**
```bash
cd pokeview
```

### **3. Install dependencies & format code**
```bash
bun run check
```

---

## 🚀 **Development Server**

Start the development server:

```bash
bun run dev
```

Then visit:

```
http://localhost:8000
```

---

## 🏗️ **Production Build**

Build the optimized production version:

```bash
bun run build
```

Preview it locally:

```
http://localhost:8001
```

---

## 💡 **Goals & Design Principles**

PokeView was designed with the following objectives:

- **Clean and modular architecture**
- **Readable and maintainable codebase**
- **Lightweight and dependency-free UI**
- **Real-world application of soft + hard skills**
- **Optimized client-side rendering**
- **Storage-efficient local caching (IndexedDB)**

---

## 🧩 **Tech Stack**

| Layer | Technology | Notes |
|------|------------|-------|
| Runtime | **Bun** | Fast, modern, lightweight |
| Language | **Vanilla JavaScript** | No frameworks |
| Storage | **IndexedDB** | Persistent caching |
| State | **Custom State Manager** | Small and predictable |
| Build | **Bun Bundler** | Clean output, fast builds |

---

## 🤝 **Contributing**

Contributions are welcome.

If you want to improve performance, add features, refine UI, or enhance documentation:

- Open an **Issue**
- Submit a **Pull Request**

The project maintains clear structure and conventions to support collaboration.

---

## 📜 **License**

Released under the **MIT License**.
You are free to use, modify, and distribute the project with proper attribution.

---

## 📁 **Project Structure**

```bash
pokeview/
├── api/ # Data loading, caching, queries
├── components/ # Modular UI building blocks
├── controllers/ # Core app logic and orchestration
├── libs/ # Utilities: state, events, helpers
├── public/ # Assets + static files
├── styles/ # Modular CSS structure
└── index.html # Entry point
```
