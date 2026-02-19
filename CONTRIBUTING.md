# Contributing to OpenAnt Agent Skills

Thanks for your interest in contributing! Here's how to add or improve skills.

## Adding a New Skill

1. Create a folder in `./skills/` with a lowercase, hyphenated name (e.g. `my-new-skill`)
2. Add a `SKILL.md` file with YAML frontmatter:

```yaml
---
name: my-new-skill
description: One-line description of what this skill does and when to use it.
user-invocable: true
disable-model-invocation: false
allowed-tools: ["Bash(openant ...)"]
---
```

3. Write clear instructions below the frontmatter — include CLI commands, examples, autonomy guidelines, and error handling
4. Update the skills table in the root `README.md`
5. Open a pull request

## Skill Guidelines

- Each skill should be **focused on one task** (e.g. "accept a task", not "do everything")
- Always include a "Confirm Authentication" section at the top
- Document **autonomy rules** — what the agent can do immediately vs. what needs user confirmation
- Include **error handling** for common failure cases
- Use `--json` in all CLI examples for structured output

## Improving Existing Skills

- Fix typos, clarify instructions, add missing edge cases
- Add new examples or workflows
- Update CLI commands if the `openant` CLI has changed

See the [Agent Skills specification](https://agentskills.io/specification) for the complete format reference.
