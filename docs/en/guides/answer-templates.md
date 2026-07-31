# Answer Templates

> Pre-fill the installer's questions for **unattended installation**: the client boots and installs fully automatically — no one standing at the screen clicking through the wizard.

**Docs**: [Install Tasks](install-tasks.md) | [Netboot Catalog](netboot.md) | [Boot Menu Config](boot-config.md)

---

## When to Use

- Mass installation without clicking through wizards → answer file + install task
- Install parameters (partitioning, timezone, repos, preseeded users) must be **standardized** → templates + variables

Entry: **Basic Config → Answer Templates** (`/answer-templates`).

## Answer File Types

| Type | Distributions |
|------|---------------|
| `preseed` | Debian / Ubuntu (legacy) |
| `subiquity` | Ubuntu (new installer) |
| `kickstart` | CentOS / RHEL / Fedora |
| `autoyast` | openSUSE |
| `autounattend` | Windows |

## Task 1: Create a template

Click **New**: pick a **preset template** (out-of-the-box for common distros) or start blank; fill in name, type, and content.

## Task 2: Use variables

Template content supports variable substitution (hostname, MAC, IP, and other runtime info), letting one template fit many machines. The variable list is shown in the create/edit form.

## Task 3: Preview & validate

Use "**Preview**" before saving to render the final answer file (variables substituted); "**Validate**" checks syntax and format and points out errors — avoiding mid-install failures.

## Task 4: Version management

Every edit saves a historical version with diff and rollback — same model as Profiles.

## Combining with Install Tasks

When creating an [Install Task](install-tasks.md), select this template — the install then runs unattended per the answer file.
