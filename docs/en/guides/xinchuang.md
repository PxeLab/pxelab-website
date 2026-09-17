# Domestic OS Installation (openEuler / Kylin / UOS)

> Install Chinese domestic operating systems over the network via PxeLab Hub's "Xinchuang OS content packs": openEuler works out of the box; Kylin V10 and UOS are two-stage packs that require your own installation media.

**Related**: [Netboot Catalog](netboot.md) | [Install Tasks](install-tasks.md) | [Answer Templates](answer-templates.md) | [Files](files.md)

---

## Content packs at a glance

| OS | Architectures | Image source | Answer mechanism | Verification |
|---|---|---|---|---|
| openEuler 24.03 LTS SP3 | x86_64 / aarch64 | Public (repo.openeuler.org) | kickstart (optional) | Official images, URLs verified |
| Kylin V10 SP3 | x86_64 / aarch64 | **Bring your own** (not publicly distributed) | kickstart | Community-contributed, untested |
| UOS Server V20 | x86_64 / aarch64 | **Bring your own** (not publicly distributed) | kickstart | Community-contributed, untested |

Kylin and UOS both use the anaconda installer, so unattended installation goes through kickstart (`inst.ks=`).

## openEuler: import and install

1. Open the **PxeLab Hub** (store) page, find **openEuler**, and click Import.
2. The distro appears in the **Netboot Catalog**, and a ready-to-assign Profile is created.
3. PXE-boot a client and pick openEuler-24.03-LTS-SP3 — the menu automatically filters versions by the client architecture (x86_64/aarch64).

Kernel and initrd are fetched directly from `repo.openeuler.org` (HTTP 302 to a CDN), and the `inst.repo=` cmdline points anaconda at the official repository — no manual configuration needed. For isolated networks, override the kernel/initrd/repository URLs to a local mirror via the catalog Overlay.

## Kylin / UOS: two-stage packs

The images are not publicly distributable, so the pack only ships the **boot configuration** and a **kickstart answer template**. On import the UI warns that you must supply your own installation media and takes you to the Netboot Catalog; the imported kickstart template is available on the **Answer Templates** page (select it when creating an install task).

To complete the pack (Kylin x86_64 example — substitute the aarch64 directory names as needed):

1. **Extract boot files** — From the Kylin V10 SP3 installation ISO, extract `images/pxeboot/vmlinuz` and `images/pxeboot/initrd.img`. Note that Kylin keeps its PXE boot files under `images/pxeboot/` (slightly different from CentOS-style layouts); do not use the kernel from `isolinux/`.
2. **Upload kernel/initrd** — In **Files**, upload both files to `netboot/kylin/v10sp3-x86_64/` (`netboot/uos/v20-x86_64/` for UOS). The catalog versions reference these local paths by default.
3. **Provide the install source** — Extract the full ISO contents (including `.treeinfo`, `Packages`, `repodata`) to an HTTP- or NFS-reachable path (PxeLab's own NFS/HTTP services work), then in the catalog **Overlay** for this distro append `inst.repo=<that path>` to the version cmdline.
4. **Create an install task** — On the **Install Tasks** page, pick the distro version and attach the imported kickstart answer template. The version's `answer_param` (<code v-pre>inst.ks={{.AnswerURL}}</code>) injects the answer-file URL into the kernel cmdline automatically — no overlay answer configuration needed.

Until the files are in place, the catalog entry carries a "Local image required" badge; PXE boot will fail without them, so complete the steps above first.

## LoongArch boot notes

- PxeLab ships LoongArch iPXE binaries (`ipxe-loong64.efi`, plus a Secure Boot-signed `ipxe-loong64-sb.efi`). The default architecture map covers IANA architecture types **37 (EFI LoongArch32)** and **39 (EFI LoongArch64)**, so DHCP hands LoongArch clients the right bootloader automatically.
- LoongArch clients only support **UEFI network boot** (no BIOS/pxelinux path) — make sure the client firmware is set to UEFI PXE.
- openEuler, Kylin and UOS all publish loong64 images, but the store packs currently ship x86_64/aarch64 entries only; loong64 images are mostly distributed through vendor channels. Follow the same "bring your own image" flow as Kylin/UOS: fill in the loong64 kernel/initrd URLs and `inst.repo` in the version Overlay.
- Some LoongArch firmware has limited iPXE driver compatibility. If iPXE cannot bring up the NIC, switch to `snponly-loong64.efi` (SNP driver) under **Settings → Architecture Map**.
