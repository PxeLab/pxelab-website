# Glossary

> Stuck on an abbreviation? Each term is explained in one sentence here. Terms are also explained inline the first time they appear in a document.

- **PXE** — A mechanism that lets a computer load its operating system directly from the network at boot time; no USB drive or optical disc required
- **iPXE** — An enhanced open-source implementation of PXE, supporting HTTP boot, scripted logic, and more — far more capable than classic PXE
- **NBP** (Network Bootstrap Program) — The first boot program a client loads over the network (e.g. `ipxe.pxe`), responsible for kicking off the rest of the boot flow
- **DHCP** — The protocol that automatically assigns IP addresses and boot information to network devices
- **ProxyDHCP** — A source of boot information layered on top of an existing DHCP server: IPs are still assigned by the existing DHCP, while PxeLab supplies the PXE boot information
- **TFTP** — A simple file transfer protocol; classic PXE uses it to transfer boot files
- **HTTP** — The web transfer protocol; iPXE uses it to load boot files and installation images much faster
- **DNS** — The domain name resolution service
- **NFS** — A network file system that lets you use a remote directory as if it were local
- **UEFI / BIOS** — The two kinds of computer firmware; they determine the shape of the boot flow
- **Secure Boot** — A UEFI security mechanism that only allows loading signed boot programs
- **Boot Menu** — The list of options a client sees after booting (install an OS, boot from local disk, etc.)
- **Profile (Boot Configuration)** — A boot configuration bound to a specific host, defining how that machine boots
- **Netboot Catalog (OS Install Catalog)** — PxeLab's built-in distribution install menu, listing the operating systems that can be installed
- **Answer File** — A configuration file that pre-fills installer questions (preseed / kickstart / autounattend.xml), enabling unattended installation
- **Arch Code (DHCP Option 93)** — The DHCP option field that identifies the client's CPU architecture; PxeLab uses it to select the matching boot file
- **WOL (Wake-on-LAN)** — Remotely waking a powered-off machine by sending a magic packet over the network
- **BMC / IPMI** — A server's out-of-band management interface for remote power on/off and power status queries
- **sanboot** — Booting directly from an iSCSI target; the client doesn't even need a disk (diskless workstations)
- **WDS** — Windows Deployment Services; PxeLab supports Windows installation in WDS scenarios
