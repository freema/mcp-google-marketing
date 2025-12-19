# MCP Google Marketing

[![npm](https://img.shields.io/npm/v/mcp-google-marketing)](https://www.npmjs.com/package/mcp-google-marketing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚠️ Deprecated

**This package is no longer maintained.**

We've built something better: **[Metrifyr](https://www.metrifyr.cloud)** - a hosted MCP server for Google Analytics, Search Console, and AdSense.

📖 **Documentation:** [metrifyr.cloud/docs/mcp-server](https://www.metrifyr.cloud/docs/mcp-server)

---

## 🚀 Why Metrifyr?

| Feature | This Package | Metrifyr |
|---------|--------------|----------|
| OAuth setup | Manual configuration | One-click connect |
| Claude.ai support | ❌ | ✅ |
| Claude Code support | ✅ | ✅ |
| Maintenance | ❌ Discontinued | ✅ Active |
| Updates | ❌ None | ✅ Regular |

---

## 📦 Migrate to Metrifyr

**Claude.ai:**
1. Go to **Settings** → **Connectors**
2. Add custom connector: `https://mcp.metrifyr.cloud/mcp`
3. Connect your Google account

**Claude Code:**
```bash
npx mcp-google-marketing login
claude mcp add google-marketing npx mcp-google-marketing
```

---

## 👤 Author

**Tomas Grasl** - [tomasgrasl.cz](https://www.tomasgrasl.cz/)

## 📄 License

MIT
