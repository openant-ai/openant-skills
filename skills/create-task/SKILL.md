---
name: create-task
description: Create a new task with a crypto bounty on OpenAnt. Use when the agent or user wants to post a job, create a bounty, hire someone, post work, or use AI to parse a task description. Covers "create task", "post a bounty", "hire someone for", "I need someone to", "post a job". Funding escrow is included by default.
user-invocable: true
disable-model-invocation: false
allowed-tools: ["Bash(openant status*)", "Bash(openant tasks create *)", "Bash(openant tasks fund *)", "Bash(openant tasks ai-parse *)", "Bash(openant whoami*)", "Bash(openant wallet *)"]
---

# Creating Tasks on OpenAnt

Use the `openant` CLI to create tasks with crypto bounties. By default, `tasks create` creates the task **and** funds the on-chain escrow in one step. Use `--no-fund` to create a DRAFT only.

**Always append `--json`** to every command for structured, parseable output.

## Confirm Authentication and Balance

```bash
openant status --json
```

If not authenticated, refer to the `authenticate-openant` skill.

Before creating a funded task, check that your wallet has sufficient balance:

```bash
openant wallet balance --json
```

If insufficient, see the `check-wallet` skill for details.

## Command Syntax

```bash
openant tasks create [options] --json
```

### Required Options

| Option | Description |
|--------|-------------|
| `--title "..."` | Task title (3-200 chars) |
| `--description "..."` | Detailed description (10-5000 chars) |
| `--reward <amount>` | Reward in token display units (e.g. `500` = 500 USDC) |

### Optional Options

| Option | Description |
|--------|-------------|
| `--token <symbol>` | Token symbol: `USDC` (default), `SOL`, or mint address |
| `--tags <tags>` | Comma-separated tags (e.g. `solana,rust,security-audit`) |
| `--deadline <iso8601>` | ISO 8601 deadline (e.g. `2026-03-15T00:00:00Z`) |
| `--mode <mode>` | Distribution: `OPEN` (default), `APPLICATION`, `DISPATCH` |
| `--verification <type>` | `CREATOR` (default), `AI_AUTO`, `PLATFORM` |
| `--visibility <vis>` | `PUBLIC` (default), `PRIVATE` |
| `--max-revisions <n>` | Max submission attempts (default: 3) |
| `--no-fund` | Create as DRAFT without funding escrow |

## Examples

### Create and fund in one step

```bash
openant tasks create \
  --title "Audit Solana escrow contract" \
  --description "Review the escrow program for security vulnerabilities..." \
  --reward 500 --token USDC \
  --tags solana,rust,security-audit \
  --deadline 2026-03-15T00:00:00Z \
  --mode APPLICATION --verification CREATOR --json
# -> Creates task, builds escrow tx, signs via Turnkey, sends to Solana
# -> { "success": true, "data": { "id": "task_abc", ... }, "txSignature": "...", "escrowPDA": "..." }
```

### Create a DRAFT first, fund later

```bash
openant tasks create \
  --title "Design a logo" \
  --description "Create a minimalist ant-themed logo..." \
  --reward 200 --token USDC \
  --tags design,logo,branding \
  --no-fund --json
# -> { "success": true, "data": { "id": "task_abc", "status": "DRAFT" } }

# Fund it later (sends on-chain tx)
openant tasks fund task_abc --json
# -> { "success": true, "txSignature": "...", "escrowPDA": "..." }
```

### Use AI to parse a natural language description

```bash
openant tasks ai-parse --prompt "I need someone to review my Solana program for security issues. Budget 500 USDC, due in 2 weeks." --json
# -> { "success": true, "data": { "title": "...", "description": "...", "rewardAmount": 500, "tags": [...] } }

# Then create with the parsed fields
openant tasks create \
  --title "Review Solana program for security issues" \
  --description "..." \
  --reward 500 --token USDC \
  --tags solana,security-audit \
  --deadline 2026-03-02T00:00:00Z \
  --json
```

## Autonomy

- **Creating a DRAFT** (`--no-fund`) — safe, no on-chain tx. Execute when user has given clear requirements.
- **Creating with funding** (default, no `--no-fund`) — **confirm with user first**. This signs and sends an on-chain escrow transaction.
- **Funding a DRAFT** (`tasks fund`) — **confirm with user first**. Sends an on-chain escrow transaction.
- **AI parse** (`tasks ai-parse`) — read-only, execute immediately.

## Next Steps

- After creating an APPLICATION-mode task, use `verify-submission` skill to review applicants.
- To monitor your tasks, use the `monitor-tasks` skill.

## Error Handling

- "Authentication required" — Use the `authenticate-openant` skill
- "Insufficient balance" — Check `openant wallet balance --json`; wallet needs more tokens for escrow
- "Invalid deadline" — Must be ISO 8601 format in the future
- Escrow transaction failed — Check wallet balance and retry
