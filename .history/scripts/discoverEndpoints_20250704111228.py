# scripts/discoverEndpoints.py

import nmap
import json
import socket
from datetime import datetime

# === CONFIGURATION ===
# Adjust this to your LAN CIDR (e.g. "10.0.0.0/24")
CIDR_RANGE = "10.0.0.0/24"
OUTPUT_FILE = "config/networkEndpoints.json"


def scan_network(cidr: str):
    nm = nmap.PortScanner()
    nm.scan(hosts=cidr, arguments='-sn')  # ping scan
    endpoints = []
    for host, result in nm._scan_result.get("scan", {}).items():
    if result.get("status", {}).get("state") != "up":
        continue
        info = {"ip": host}

        # try reverse DNS
        try:
            info["hostname"] = socket.gethostbyaddr(host)[0]
        except socket.herror:
            info["hostname"] = None

        # port scan top 100
        ps = nm.scan(host, '1-1024')
        open_ports = []
        for proto in ps['scan'][host]['tcp']:
            if ps['scan'][host]['tcp'][proto]['state'] == 'open':
                open_ports.append(proto)
        info["open_tcp_ports"] = open_ports

        # timestamp
        info["last_seen"] = datetime.utcnow().isoformat() + "Z"
        endpoints.append(info)
    return endpoints


def main():
    eps = scan_network(CIDR_RANGE)
    with open(OUTPUT_FILE, "w") as f:
        json.dump({"scanned_at": datetime.utcnow().isoformat() + "Z", "endpoints": eps}, f, indent=2)
    print(f"Wrote {len(eps)} endpoints to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
