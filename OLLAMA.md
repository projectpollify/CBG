# OLLAMA.md — Local LLM Agent Setup Guide
## Dolphin-Qwen 3B + OpenClaw Integration

**Goal:** Add a third OpenClaw agent powered by a local Ollama model (no cloud API cost, runs fully offline).

---

## OVERVIEW

```
Ollama (local LLM runtime)
    ↓ OpenAI-compatible API (port 11434)
OpenClaw Gateway (port 18898)
    ↓ routes to agent
New Local Agent (dolphin-qwen 3B)
    ↓ (later)
Telegram Bot
```

---

## STEP 1 — Install Ollama on WSL2

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Verify installation:
```bash
ollama --version
```

---

## STEP 2 — Start Ollama Service

Ollama needs to be running before OpenClaw can use it.

**Start manually (foreground, for testing):**
```bash
ollama serve
```

**Start in background:**
```bash
ollama serve &
```

**Check it's running:**
```bash
curl http://localhost:11434
# Should return: "Ollama is running"
```

---

## STEP 3 — Pull the Model

> ⚠️ Requires WiFi — do this when home. Model is ~1.9GB.

```bash
ollama pull dolphin-qwen3:3b
```

**Verify pull was successful:**
```bash
ollama list
# Should show: dolphin-qwen3:3b
```

**Test the model directly:**
```bash
ollama run dolphin-qwen3:3b "Hello, who are you?"
```

> **Note:** If `dolphin-qwen3:3b` doesn't resolve, check the exact tag at https://ollama.com/cognitivecomputations
> Alternative names to try:
> - `dolphin3.0-qwen2.5:3b`
> - `dolphin-qwen2.5:3b`
> - `cognitivecomputations/dolphin3.0-qwen2.5-3b`

---

## STEP 4 — Add the Agent to OpenClaw

OpenClaw model ID format for Ollama: `ollama/<model-name>`

```bash
openclaw agents add penny \
  --model "ollama/dolphin-qwen3:3b" \
  --workspace ~/.openclaw/workspace-penny \
  --non-interactive
```

> Replace `penny` with whatever name you want for this agent.

**Verify agent was created:**
```bash
openclaw agents list
```

---

## STEP 5 — Create Agent Identity Files

OpenClaw looks for identity files in the agent dir. First, find where the agent dir was created:

```bash
openclaw agents list
# Note the "Agent dir" path shown for the new agent
# e.g. ~/.openclaw/agents/penny/agent
```

Create the project-side identity files (mirrors pattern of jarvis/alfred):

```bash
mkdir -p /home/shawn/projects/cbgwebapp/agents/penny
```

Create `IDENTITY.md`:
```bash
cat > /home/shawn/projects/cbgwebapp/agents/penny/IDENTITY.md << 'EOF'
# Identity: Penny

You are Penny — a local, private AI assistant running entirely on-device.

- Powered by Dolphin-Qwen 3B (local, no cloud)
- Fast, private, zero API cost
- General purpose task assistant
- Part of the CBG AI agent network
EOF
```

Create `SOUL.md`:
```bash
cat > /home/shawn/projects/cbgwebapp/agents/penny/SOUL.md << 'EOF'
# Penny — Core Values

- Privacy first: everything stays local
- Direct and efficient
- Honest about limitations (small model)
- Helpful for quick tasks, lookups, and drafting
EOF
```

---

## STEP 6 — Link Identity to OpenClaw Agent Dir

Copy or symlink the identity files into the OpenClaw agent workspace:

```bash
# Check where the agent dir is
AGENT_DIR=$(openclaw agents list --json 2>/dev/null | grep -A5 '"id":"penny"' | grep "agentDir" | cut -d'"' -f4)
echo $AGENT_DIR

# Copy identity files in
cp /home/shawn/projects/cbgwebapp/agents/penny/IDENTITY.md ~/.openclaw/agents/penny/agent/
cp /home/shawn/projects/cbgwebapp/agents/penny/SOUL.md ~/.openclaw/agents/penny/agent/
```

---

## STEP 7 — Configure Ollama Model in OpenClaw Config

OpenClaw needs to know Ollama is running locally. Check your config:

```bash
cat ~/.openclaw/openclaw.json | grep -A5 "ollama"
```

If Ollama isn't auto-detected, manually set the base URL:

```bash
openclaw config set models.providers.ollama.baseUrl "http://localhost:11434/v1"
```

---

## STEP 8 — Test the Agent

Send a test message directly via CLI:

```bash
openclaw agent --agent penny "Hello, introduce yourself"
```

---

## STEP 9 — Make Ollama Auto-Start (Optional but Recommended)

So you don't have to manually start Ollama every WSL session:

**Option A — Add to ~/.bashrc or ~/.zshrc:**
```bash
echo 'pgrep -x ollama > /dev/null || ollama serve > /dev/null 2>&1 &' >> ~/.bashrc
```

**Option B — Systemd service (WSL2 with systemd enabled):**
```bash
# Check if systemd is enabled
systemctl --version

# If yes, enable the ollama service
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

---

## STEP 10 — Add Telegram Binding (Do This Later)

When you have a new bot token ready:

```bash
# Add the bot token to openclaw config
openclaw config set channels.telegram.accounts.penny.botToken "YOUR_BOT_TOKEN_HERE"
openclaw config set channels.telegram.accounts.penny.dmPolicy "allowlist"
openclaw config set channels.telegram.accounts.penny.allowFrom "[YOUR_TELEGRAM_USER_ID]"
openclaw config set channels.telegram.accounts.penny.groupPolicy "disabled"

# Add routing binding
# Edit ~/.openclaw/openclaw.json directly to add:
# { "agentId": "penny", "match": { "channel": "telegram", "accountId": "penny" } }
# to the bindings array

# Restart gateway to pick up changes
openclaw gateway restart
```

**Verify routing:**
```bash
openclaw agents list --bindings
```

---

## QUICK REFERENCE — Commands

```bash
# Start Ollama
ollama serve &

# Check Ollama is up
curl http://localhost:11434

# List local models
ollama list

# Pull model (WiFi required)
ollama pull dolphin-qwen3:3b

# Test model directly
ollama run dolphin-qwen3:3b

# List all OpenClaw agents
openclaw agents list

# Send test message to local agent
openclaw agent --agent penny "test"

# Restart gateway after config changes
openclaw gateway restart

# Check gateway health
openclaw health
```

---

## CURRENT STATE (as of 2026-02-24)

| Item | Status |
|------|--------|
| OpenClaw installed | ✅ v2026.2.1 |
| Alfred agent (Gemini) | ✅ Running |
| Jarvis agent (Claude) | ✅ Running |
| Ollama installed | ⏳ Pending (WiFi needed) |
| dolphin-qwen3:3b pulled | ⏳ Pending (WiFi needed) |
| Penny agent created | ⏳ Pending (after Ollama install) |
| Telegram bot for Penny | ⏳ Later |

---

## HARDWARE NOTES (WSL2)

- dolphin-qwen3:3b requires ~2GB RAM during inference
- WSL2 shares host RAM — ensure Windows has at least 8GB free
- CPU inference is fine for 3B models (slower than GPU but works)
- If GPU passthrough is available: Ollama auto-detects CUDA/ROCm

---

## TROUBLESHOOTING

**"connection refused" on port 11434:**
```bash
# Ollama isn't running
ollama serve &
```

**Model not found by OpenClaw:**
```bash
# Confirm model name exactly matches
ollama list
# Use exact name from list in OpenClaw config
```

**Agent not routing correctly:**
```bash
openclaw doctor
openclaw agents list --bindings
```

**Gateway not seeing Ollama:**
```bash
# Confirm Ollama API is accessible
curl http://localhost:11434/v1/models
# Should list available models
```
