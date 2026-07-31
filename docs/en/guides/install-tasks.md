# Install Tasks

> "Work orders" for network installs: which machine installs what system with which answer file — with progress tracking.

**Docs**: [Answer Templates](answer-templates.md) | [Netboot Catalog](netboot.md) | [OS Images](os-images.md)

---

## When to Use

- Track **each machine's progress** during mass installation → task list
- Unattended installs with answer templates → select the template when creating a task
- Cancel or adjust install plans → edit/delete tasks

Entry: **Management → Install Tasks** (`/install-tasks`).

## Task 1: Create an install task

Click **New Task**, then select:

- **Distribution & version** (e.g. Ubuntu → 22.04)
- **Architecture**
- **Target host** (pick from the host list)
- **Answer file template** (optional; choosing one makes the install unattended)

## Task 2: Track status

The task list shows each machine's install state and progress; status updates when the install finishes, so results can be checked.

## Task 3: Manage tasks

- **Edit**: change task parameters (e.g. switch answer templates)
- **Delete**: cancel the task
