# AuditForge Basic

A local-first playground for exploring and auditing Solidity contracts.

## What’s inside

- File explorer + local persistence
- Monaco editor (configurable font + editor options)
- Analyzer panel with model/provider selection (Ollama / OpenAI) and a structured audit report UI
- Settings page for Editor + Analyzer configuration

## Development

```bash
npm install
npm run dev
```

## Configuration

- OpenAI: set `VITE_OPEN_API_KEY` in `.env.local` (optional if you provide a key in Settings).
- Ollama: run Ollama locally (default `http://localhost:11434`) and configure the host in Settings if needed.

