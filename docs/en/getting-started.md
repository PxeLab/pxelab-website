# Getting Started

> Goal: from downloading PxeLab to your first network install in 15 minutes.

**Docs**: [Glossary](glossary.md) | [Tutorial 1: Install Ubuntu on a Bare Metal Machine](tutorials/install-ubuntu.md) | [Troubleshooting](troubleshooting.md)

---

## What Is PXE?

PXE (Preboot eXecution Environment) is a mechanism that lets a computer **load its operating system directly from the network at boot time** — no USB drive, no optical drive, not even a system on the local disk.

A typical scenario: 20 bare metal machines arrive in the server room, and all of them need systems installed within half a day. Installing them one by one with USB drives is not realistic. PXE lets every machine fetch its system image from the network automatically at power-on, turning mass installation into a manageable task.

PxeLab packages the five network services PXE needs — **DHCP, TFTP, HTTP, DNS, NFS** — into a single zero-dependency binary and manages the whole flow from a web UI. Want the technical details? See the [Glossary](glossary.md) and [Boot Architecture & Diskless](guides/boot-architecture.md).

---

## System Requirements

| Item | Requirement |
|------|-------------|
| **OS** | Windows 10+ / Linux / macOS 12+ |
| **Architecture** | amd64 / arm64 |
| **RAM / Disk** | ≥ 512 MB / ≥ 1 GB |
| **Network** | Admin/root rights needed to run DHCP (port 67) |

No other dependencies — one file, download and run.

---

## Download & Install

### Option 1: Download a Release (recommended)

Grab the binary for your platform from GitHub Releases (asset names include the version — `v0.1.0` used below as an example):

```bash
# Linux amd64
wget https://github.com/PxeLab/pxelab/releases/download/v0.1.0/pxelab_v0.1.0_linux_amd64.tar.gz
tar xzf pxelab_v0.1.0_linux_amd64.tar.gz

# macOS arm64
wget https://github.com/PxeLab/pxelab/releases/download/v0.1.0/pxelab_v0.1.0_darwin_arm64.tar.gz
tar xzf pxelab_v0.1.0_darwin_arm64.tar.gz
```

Windows: download `pxelab_v0.1.0_windows_amd64.zip` and extract `pxelab.exe`.

> Release assets follow the naming pattern `pxelab_<version>_<os>_<arch>` (zip on Windows, tar.gz elsewhere). Check the [Releases](https://github.com/PxeLab/pxelab/releases) page for the latest version and replace `v0.1.0` in the example URLs accordingly.

### Option 2: Package Manager

```bash
# Debian / Ubuntu (deb package)
sudo apt install ./pxelab_v0.1.0_linux_amd64.deb

# RHEL / Rocky / AlmaLinux (rpm package)
sudo rpm -Uvh pxelab_v0.1.0_linux_amd64.rpm

# macOS (Homebrew)
brew tap pxelab/homebrew-tap
brew install pxelab
```

The deb / rpm packages register the systemd service `pxelab.service` and write the config to `/etc/pxelab/config.yaml` on install.

### Option 3: Build from Source

```bash
git clone https://github.com/PxeLab/pxelab.git
cd pxelab
make build          # produces bin/pxelab
```

### Option 4: Docker

Container images are on the roadmap — not available yet.

---

## First Launch

```bash
# Linux / macOS (DHCP port 67 needs root)
sudo ./pxelab

# Windows (run as administrator)
pxelab.exe
```

Once started, open **`http://localhost:8080`** in a browser — you'll see the dashboard:

![PxeLab dashboard](/screenshots/dashboard.png)

The **service status bar** at the top shows each service's state: HTTP runs by default; DHCP and ProxyDHCP also try to start automatically in fallback mode (listening on `0.0.0.0:67` / `0.0.0.0:4011`, needs root, no addresses assigned until subnets are configured); TFTP / DNS / NFS are stopped by default and turn green once you configure and start them.

> **Windows**: PxeLab runs in the system tray by default — the tray icon offers open browser, open data directory, and quit.

---

## Your First Network Install (5 Steps)

Get a computer that supports network boot (bare metal or an existing machine — either works) and follow along:

**Step 1: Create an interface and subnet**
Go to **Basic Config → Service Config → DHCP**, click **Add Interface** in the top-right corner, fill in the interface name, IP address, and in "Subnet 1" set the network (`192.168.50.0/24`), address pool, gateway, DNS — keep the DHCP mode at **server**. Save, then start the DHCP service from the service status bar.

**Step 2: Make sure the OS Install Catalog is enabled**
Go to **Basic Config → Service Config → OS Install Catalog** and confirm the "enabled" toggle is on (default). It decides which operating systems clients see after booting.

**Step 3: Boot the client and enter network boot**
Power the client on and enter its boot menu (common keys: F12 / F11 / Esc — varies by vendor), then choose **network boot (PXE Boot / Network Boot)**.

**Step 4: Pick a system in the boot menu**
When the menu appears, choose **[OS] Netboot OS Install Catalog** → Ubuntu → pick a version → start the install.

**Step 5: Verify**
Back on the dashboard: the new host shows up in the "Online hosts" list; **Management → Install Tasks** shows the install record for this machine. After the install finishes, the client boots normally from its local disk.

> Want every detail? See [Tutorial 1: Install Ubuntu on a Bare Metal Machine](tutorials/install-ubuntu.md).

---

## Next Steps

- **Tutorials**: [Install Ubuntu on a Bare Metal Machine](tutorials/install-ubuntu.md) · [Layer PXE onto an Existing DHCP Network](tutorials/add-pxe-to-existing-dhcp.md) · [Build a Diskless Workstation](tutorials/diskless-workstation.md)
- **Guides**: go deep per feature ([DHCP Config](guides/dhcp.md), [Boot Menu Config](guides/boot-config.md), [Host Management](guides/host-management.md)…)
- **API automation**: [REST API Quick Start](development/api-quickstart.md) · [Automation & CI Integration](development/automation.md)
- **Stuck?**: [Troubleshooting](troubleshooting.md) · [FAQ](faq.md)
