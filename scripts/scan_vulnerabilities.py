# scripts/scan_vulnerabilities.py
import nmap
import json
from datetime import datetime
from supabase import create_client

SUPABASE_URL = "https://…"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def scan_endpoint(host: str):
    nm = nmap.PortScanner()
    nm.scan(hosts=host, arguments='-sV --script vuln')
    return nm[host].get('hostscript', [])

def main():
    # 1) fetch all tracked endpoints
    res = supabase.table('network_endpoints').select('id,ip').execute()
    endpoints = res.data
    for ep in endpoints:
        results = scan_endpoint(ep['ip'])
        # 2) write back into scan_results
        supabase.table('network_endpoints').update({
            'last_scan': datetime.utcnow().isoformat()+'Z',
            'scan_results': json.dumps(results)
        }).eq('id', ep['id']).execute()

if __name__ == "__main__":
    main()
