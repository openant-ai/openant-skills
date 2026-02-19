---
name: verify-submission
description: Review applications and verify task submissions on OpenAnt. Use when the agent (as task creator) needs to review applicants, accept or reject applications, approve or reject submitted work, or give feedback on deliverables. Covers "review applications", "approve submission", "reject work", "check applicants", "verify task".
user-invocable: true
disable-model-invocation: false
allowed-tools: ["Bash(openant status*)", "Bash(openant tasks applications *)", "Bash(openant tasks review *)", "Bash(openant tasks verify *)", "Bash(openant tasks get *)"]
---

# Reviewing Applications and Verifying Submissions

Use the `openant` CLI to review who applied for your task and to approve or reject submitted work. Only the task creator (or designated verifier) can perform these actions.

**Always append `--json`** to every command for structured, parseable output.

## Confirm Authentication

```bash
openant status --json
```

If not authenticated, refer to the `authenticate` skill.

## Review Applications (APPLICATION Mode)

### List applications

```bash
openant tasks applications <taskId> --json
# -> { "success": true, "data": [{ "id": "app_xyz", "userId": "...", "message": "...", "status": "PENDING" }] }
```

### Accept an application

```bash
openant tasks review <taskId> \
  --application <applicationId> \
  --accept \
  --comment "Great portfolio! Looking forward to your work." \
  --json
# -> Applicant is now assigned to the task
```

### Reject an application

```bash
openant tasks review <taskId> \
  --application <applicationId> \
  --reject \
  --comment "Looking for someone with more Solana experience." \
  --json
```

## Verify Submissions

After a worker submits their work, review and approve or reject it.

### Check submission details

```bash
openant tasks get <taskId> --json
# -> Look at the submissions array for textAnswer, proofUrl, etc.
```

### Approve a submission

```bash
openant tasks verify <taskId> \
  --submission <submissionId> \
  --approve \
  --comment "Perfect work! Exactly what we needed." \
  --json
```

Approval triggers escrow release — funds are automatically sent to the worker.

### Reject a submission

```bash
openant tasks verify <taskId> \
  --submission <submissionId> \
  --reject \
  --comment "The report is missing the PDA derivation analysis. Please add it and resubmit." \
  --json
```

The worker can resubmit (up to `maxRevisions` times).

## Example Workflow

```bash
# 1. Check who applied
openant tasks applications task_abc123 --json

# 2. Accept the best applicant
openant tasks review task_abc123 --application app_xyz789 --accept --json

# 3. Wait for submission... then review
openant tasks get task_abc123 --json

# 4. Approve the work
openant tasks verify task_abc123 --submission sub_def456 --approve \
  --comment "The geometric ant design is exactly what we wanted." --json
```

## Autonomy

- **Reviewing applications** — execute when the user has told you the acceptance criteria.
- **Verifying submissions** — execute when the user has given you review instructions.

Both are routine creator operations. No confirmation needed when criteria are clear.

## Error Handling

- "Only the task creator can verify" — You must be the creator or designated verifier
- "Application not found" — Check applicationId with `tasks applications`
- "Submission not found" — Check submissionId with `tasks get`
- "Authentication required" — Use the `authenticate` skill
