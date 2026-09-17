# Boot Flow & Custom iPXE

> The full chain from PXE ROM to boot menu, the DHCP parameters each mode passes (server vs proxy), and the two ways to customize iPXE booting — editing `autoexec.ipxe` vs compiling an embedded `embedd.ipxe`.

**Docs**: [DHCP Modes](dhcp-modes.md) | [Boot Architecture & Diskless](boot-architecture.md) | [Boot Config](boot-config.md) | [Custom iPXE Build](../development/ipxe-build.md)

---

## 1. The Complete Boot Chain

PxeLab uses a two-stage boot architecture that escalates the limited PXE ROM into a full-featured iPXE:

```
Stage 1:  PXE ROM ──TFTP──► iPXE binary (NBP)
           DHCP yields the NBP filename (architecture-mapped)

Stage 2:  iPXE ──HTTP──► /boot/ipxe/script ──► boot menu
           iPXE re-runs DHCP → gets script URL → menu is generated
```

With the non-embedded iPXE build, the full request sequence is:

```
① PXE ROM starts
     │
     ├─ DHCP Discover (Option 60 = PXEClient, Option 93 = architecture)
     │
② PxeLab answers with an Offer (server / proxy params below)
     │  └─ BootFileName = NBP (e.g. ipxe.efi / ipxe.pxe, architecture-mapped)
     │
③ Client downloads the NBP over TFTP → iPXE starts
     │
④ iPXE runs its own DHCP (ignores PXE ROM cached data)
     │  └─ Server recognizes an iPXE client (Option 60 = "iPXE")
     │     └─ Replies with a script URL (Option 175.178) + BootFileName = script URL
     │
⑤ iPXE auto-downloads autoexec.ipxe (non-embedded convention) or runs its
   embedded script directly (embedded build)
     │  └─ chain http://<server>:8080/boot/ipxe/script?mac=<mac>
     │
⑥ Server generates the boot menu (decision tree: custom script → Profile
   → OS catalog → default menu)
     │
⑦ Client picks a menu entry → boots the OS
```

> **Key point**: step ② returns the NBP (boot loader); after step ④ iPXE re-runs DHCP itself, and the server now recognizes an iPXE client and switches to returning a script URL — that is the two-stage handoff.

---

## 2. Server Mode: Boot Logic & Passed Parameters

In server mode PxeLab is the **only DHCP server** on the network and answers every client. PXE and non-PXE clients take different branches.

### PXE ROM clients (step ② Offer)

| Field / Option | Value | Description |
|----------------|-------|-------------|
| `yiaddr` | IP from the pool | PxeLab owns the whole DHCP lifecycle |
| `siaddr` | PxeLab interface IP | Used as the TFTP server address |
| Option 54 (Server Identifier) | PxeLab interface IP | — |
| Option 1 (Subnet Mask) | Subnet mask | Derived from the subnet CIDR |
| Option 3 (Router) | Subnet gateway | From subnet config |
| Option 6 (DNS) | Subnet DNS | Comma-separated, multiple allowed |
| Option 51 (Lease Time) | Lease seconds | Default 3600 |
| Option 43 (PXE Discovery Control) | `{6,1,0x0C}` | Sub-option 6 = disable PXE server discovery + no user prompt |
| Option 66 (TFTP Server Name) | PxeLab IP | Implicitly provided via siaddr |
| Option 67 (Boot File Name) | NBP filename | Architecture-mapped, see below |
| Option 175.177 | `0x01` | Feature flags: BootFileName via HTTP instead of TFTP |
| Option 175.178 | Script URL | `http://<server>:8080/boot/ipxe/script?mac=<mac>` |

### iPXE clients (step ④ Offer/Ack)

| Field / Option | Value | Description |
|----------------|-------|-------------|
| `yiaddr` | IP from the pool | Same as a regular DHCP client |
| Option 1/3/6/51 | Standard network config | Same as the table above |
| BootFileName | **Script URL** | No longer an NBP — the script address directly |
| Option 175.177 | `0x01` | HTTP mode |
| Option 175.178 | Script URL | `http://<server>:8080/boot/ipxe/script?mac=<mac>` |

### Non-PXE clients

Get a standard DHCP response (IP + subnet mask + gateway + DNS + lease time) with **no PXE options** — they just go online normally.

---

## 3. Proxy Mode: Boot Logic & Passed Parameters

In proxy mode PxeLab **only answers PXE/iPXE clients**; IP addresses come from the existing DHCP server on the network. PxeLab's response strictly follows ProxyDHCP semantics: **`yiaddr=0.0.0.0` throughout, and no gateway/DNS/lease-time options**.

### PXE ROM clients (step ② Offer)

| Field / Option | Value | Description |
|----------------|-------|-------------|
| `yiaddr` | `0.0.0.0` | **Critical**: iPXE `dhcp_offer()` uses this to identify ProxyDHCP and store it in the `proxydhcp` scope |
| `siaddr` | PxeLab interface IP | Stored by iPXE as `proxydhcp/next-server` |
| Option 60 (Vendor Class) | `"PXEClient"` | **UEFI PXE Base Code requires this echo before it accepts a PXE OFFER** |
| Option 54 (Server Identifier) | PxeLab interface IP | — |
| Option 66 (TFTP Server Name) | PxeLab IP | Explicit text form |
| Option 67 (Boot File Name) | NBP filename | Architecture-mapped |
| Option 43 (PXE Discovery Control) | `{6,1,0x0C}` | Disable PXE server discovery + no user prompt |
| Option 175.178 | Script URL | `http://<server>:8080/boot/ipxe/script?mac=<mac>` |

**Not sent**: Option 1 (mask), Option 3 (gateway), Option 6 (DNS), Option 51 (lease time) — strict ProxyDHCP semantics.

### iPXE clients (step ④ Offer/Ack)

| Field / Option | Value | Description |
|----------------|-------|-------------|
| `yiaddr` | `0.0.0.0` | Kept throughout |
| Option 60 | `"PXEClient"` | Same as above |
| `siaddr` | PxeLab IP | `proxydhcp/next-server` |
| BootFileName | **Script URL** | Script address directly |
| Option 175.178 | Script URL | `http://<server>:8080/boot/ipxe/script?mac=<mac>` |

### Non-PXE clients

**Completely ignored — no reply**, so the existing DHCP server's address allocation is never disturbed.

### Whitelist behavior under proxy

The whitelist check (global / subnet) runs **before** the DHCP-mode branch, so **proxy mode is equally subject to the whitelist** — MACs outside the whitelist get no PXE options even through proxy.

---

## 4. Server vs Proxy Parameter Comparison

| Parameter | server | proxy |
|-----------|--------|-------|
| Assigns IP (`yiaddr`) | ✅ from the pool | ❌ always `0.0.0.0` |
| `siaddr` / Option 66 | ✅ PxeLab IP | ✅ PxeLab IP (`proxydhcp/next-server`) |
| Option 60 = PXEClient | ⚠️ optional (not relied on) | ✅ **required** (key for UEFI) |
| Option 1 subnet mask | ✅ | ❌ |
| Option 3 gateway | ✅ | ❌ |
| Option 6 DNS | ✅ | ❌ |
| Option 51 lease time | ✅ | ❌ |
| Option 43 Discovery Control | ✅ `{6,1,0x0C}` | ✅ `{6,1,0x0C}` |
| Option 67 NBP filename | ✅ architecture-mapped | ✅ architecture-mapped |
| Option 175.177/178 (script URL) | ✅ | ✅ |
| Non-PXE clients | ✅ normal IP assignment | ❌ ignored |

---

## 5. NBP Architecture Mapping

The NBP filename returned at step ② is chosen automatically from the client architecture (Option 93):

| Client architecture | AL code | NBP |
|---------------------|---------|-----|
| BIOS x86 | 0 | `ipxe.pxe` / `undionly.kpxe` |
| EFI IA32 | 6 | `ipxe32.efi` |
| EFI x64 | 7, 9 | `ipxe.efi` |
| EFI ARM64 | 11 | `ipxe-arm64.efi` |
| EFI RISCV64 | 27 | `ipxe-riscv64.efi` |

Full mapping: [Architecture Mapping & Secure Boot](../reference/boot-settings.md).

---

## 6. autoexec.ipxe vs embedd.ipxe

Both files are iPXE **boot entry scripts**; the difference is whether the script is compiled into the iPXE binary.

| | `boot/autoexec.ipxe` | `boot/embedd.ipxe` |
|--|----------------------|--------------------|
| Applies to | **Non-embedded** builds (default ipxe.pxe / ipxe.efi) | **Embedded** builds (self-compiled with `EMBED=`) |
| When it runs | Auto-downloaded from next-server after iPXE starts (iPXE v2.0.0+ convention) | Compiled into the binary, runs immediately at start |
| How changes take effect | Edit the file only (no iPXE recompile) | Recompile iPXE + repackage PxeLab |
| Extra network round-trip | One extra TFTP/HTTP download | None (script is already in the firmware) |

### Execution flow comparison

**autoexec.ipxe** (non-embedded):

```ipxe
:netboot
dhcp net0 || goto dhcp_failed

# Prefer the script URL injected via DHCP Option 175
isset ${script-url} && chain ${script-url} || goto use_nextserver
exit   # must exit after a successful chain to avoid falling into the failsafe below

:use_nextserver
# Three-level fallback to determine the PxeLab address
isset ${next-server} && set pxelab-server ${next-server}
isset ${proxydhcp/next-server} && set pxelab-server ${proxydhcp/next-server}
isset ${pxelab-server} || set pxelab-server ${dhcp-server}
set pxelab-url http://${pxelab-server}:8080/boot/ipxe/script?mac=${net0/mac}
chain ${pxelab-url} || goto failsafe
exit
```

**embedd.ipxe** (embedded) has the same structure but no `script-url` branch — it derives the server address from DHCP directly:

```ipxe
:netboot
dhcp net0 || goto dhcp_failed
isset ${next-server} && set pxelab-server ${next-server}
isset ${proxydhcp/next-server} && set pxelab-server ${proxydhcp/next-server}
isset ${pxelab-server} || set pxelab-server ${dhcp-server}
set pxelab-url http://${pxelab-server}:8080/boot/ipxe/script?mac=${net0/mac}
chain ${pxelab-url} || goto failsafe
exit
```

> **iPXE pitfall**: iPXE labels do not break execution flow. If a successful `chain` falls through into the next label (e.g. `:failsafe`), the Failsafe menu wrongly appears — for instance picking "Boot from local disk" from the menu `exit`s and then pops up the Failsafe menu instead. **Always `exit` explicitly after every successful chain.**

---

## 7. Customizing iPXE Booting

Two approaches; pick by your needs.

### Approach 1: Edit autoexec.ipxe (recommended, no compilation)

For deployments using the default non-embedded NBP. **Changes take effect immediately**, no compilation involved.

The **runtime boot directory** is what TFTP/HTTP actually serve (default `<data-dir>/boot/`). Edit `autoexec.ipxe` there directly and it applies immediately (no service restart).

To keep the repo in sync, edit the repo's `boot/autoexec.ipxe` and then:

```bash
# Sync into bootdist (the embedded directory inside the binary)
go generate ./cmd/pxelab/
# Rebuild PxeLab
go build -o bin/pxelab ./cmd/pxelab/
```

> Editing `autoexec.ipxe` is right for: adjusting menu/chain-loading logic, adding debug output, changing the failsafe fallback policy, customizing the `script-url` priority/fallback logic.

### Approach 2: Compile an embedded iPXE (build chain required)

For scenarios that need to change **the iPXE firmware itself**. Before compiling, ask: **compile only if the default NBP cannot do what you need.**

#### When you need to compile the embedded build

| Requirement | Default NBP enough? | Need to compile |
|-------------|--------------------:|-----------------|
| Adjust boot menu / chain logic | ✅ edit autoexec | ❌ |
| Adjust failsafe fallback menu | ✅ edit autoexec | ❌ |
| HTTPS downloads for kernel/initrd | ❌ default lacks `DOWNLOAD_PROTOCOL_HTTPS` | ✅ |
| Native NIC drivers (full-driver build) | ⚠️ default undionly uses the PXE ROM stack | ✅ |
| Secure Boot signing | ❌ default ipxe.efi is unsigned | ✅ |
| Eliminate one TFTP round-trip | ⚠️ optional optimization | ✅ |
| Custom build options (protocol/driver trimming) | ❌ | ✅ |

**Typical scenario**: your netboot catalog or Profile references `https://github.com/...` to download install images — you must compile an embedded iPXE with HTTPS enabled.

#### Build steps (summary)

```bash
git clone --depth 1 https://github.com/ipxe/ipxe.git
cd ipxe/src
# Enable HTTPS
echo '#define DOWNLOAD_PROTOCOL_HTTPS' >> config/general.h
# Build with the repo-provided script
make bin-x86_64-efi/ipxe.efi EMBED=/path/to/PxeLab/boot/embedd.ipxe
```

Copy the artifacts to both locations:

```bash
cp bin-x86_64-efi/ipxe.efi /path/to/PxeLab/boot/                    # runtime dir
cp bin-x86_64-efi/ipxe.efi /path/to/PxeLab/cmd/pxelab/bootdist/     # embedded bootdist
go build -o bin/pxelab ./cmd/pxelab/                                # rebuild PxeLab
```

Full build guide (multi-arch, HTTPS config, Makefile shortcuts): [Custom iPXE Build](../development/ipxe-build.md).

### The bootdist sync mechanism

`cmd/pxelab/bootdist/` is the copy of the boot directory embedded in the binary (`go:embed all:bootdist`); it is released to the runtime boot directory on first start. **After changing boot-dir files you must sync to bootdist and rebuild**, or upgrades/re-deploys will revert to the old content.

```
boot/ (repo source) ──go:generate──► cmd/pxelab/bootdist/ (embedded) ──go:embed──► binary
                                                                             │ released on first start
                                                                             ▼
                                                                  <data-dir>/boot/ (runtime, served by TFTP/HTTP)
```

---

## 8. The Failsafe Menu Mechanism

With **Settings → Boot Menu → Failsafe Prompt** enabled, `/boot/ipxe/script` no longer returns the menu directly. Instead it returns an **autoexec wrapper** that first chains to `/boot/ipxe/menu` (with retry on failure):

```
/boot/ipxe/script (failsafe on)
    └─► autoexec wrapper: chain /boot/ipxe/menu?mac=...
          └─ failure ──► Failsafe menu (local boot / manual network config / retry / debug shell / reboot)
                │
                └─► retry → chain /boot/ipxe/menu again
```

The `Boot from local drive` fallback entry `exit`s iPXE, letting the client fall back to its local disk.

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Picking "Boot from local disk" opens the Failsafe menu | Script lacks `exit` after a successful chain, falls into the next label | Check every `chain` in autoexec.ipxe / embedd.ipxe has a following `exit` |
| UEFI client receives no PXE Offer | Proxy mode missing Option 60 = PXEClient | Confirm PxeLab version (older builds needed a temporary IP for UEFI; newer builds uniformly use yiaddr=0) |
| Whitelist "not working" in proxy mode | — | Whitelist runs before the mode branch, so proxy is equally constrained; check global/subnet whitelist config |
| Custom bootdist reverts after reinstall | Only the runtime dir was edited, bootdist wasn't synced | Follow the bootdist sync mechanism and rebuild |
| HTTPS kernel download fails | Default iPXE lacks the HTTPS protocol | Compile an embedded build with `DOWNLOAD_PROTOCOL_HTTPS` |
| autoexec edits have no effect | Wrong file edited | The runtime file is `<data-dir>/boot/autoexec.ipxe`, not the repo file |
