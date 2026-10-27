# Run on your server's public IP

Copy and extract the complete website ZIP onto the VM. Install Node.js LTS there.

## Windows VM

Stop the existing website launcher with Ctrl+C, then double-click START-PUBLIC.cmd.

In an Administrator PowerShell window on the VM, allow the application's port:

```powershell
New-NetFirewallRule -DisplayName "Change in Progress TCP 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

In your hosting provider's firewall/security-group settings, allow inbound TCP port 3000. To share publicly, the source is Any IPv4 / 0.0.0.0/0.

Then open http://YOUR_SERVER_PUBLIC_IP:3000 from another computer. Replace YOUR_SERVER_PUBLIC_IP with the public IPv4 shown by your hosting provider. Use http, and include :3000.

## Linux VM

From the extracted project folder:

```sh
HOST=0.0.0.0 PORT=3000 node server.mjs --production
```

Allow inbound TCP 3000 in the VM firewall and the hosting provider's firewall/security group. Keep the process running while the installation is in use.

## Network setup

For a VM behind a router or a hypervisor's NAT network, forward external TCP 3000 to the VM's TCP 3000. A cloud VM with an assigned public IP normally uses the provider firewall instead of your home router.

If http://127.0.0.1:3000 works inside the VM but the public URL does not, check the provider firewall, the VM firewall and any NAT/port-forwarding rule.

For the address without :3000, use a reverse proxy listening on port 80 and forwarding to the app's port 3000.

START.cmd remains the local-only launcher. The public launcher changes the host only for its own process. Neither launcher changes firewall settings automatically.
