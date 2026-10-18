"""HTTP acceptance against the actual loopback Apache/PHP harness, no external requests."""
import datetime, hashlib, json, pathlib, re, urllib.request, urllib.error
root=pathlib.Path(__file__).resolve().parents[3]
out=root/'hosting/hostinger/evidence';out.mkdir(exist_ok=True)
inventory=json.loads((out/'build-inventory.json').read_text())
base='http://127.0.0.1:43128'
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):return None
opener=urllib.request.build_opener(NoRedirect)
checks=[]
def request(route,method='GET',body=None,headers=None):
 req=urllib.request.Request(base+route,data=body,method=method,headers=headers or {})
 try:r=opener.open(req,timeout=15)
 except urllib.error.HTTPError as e:r=e
 with r:return r.status,dict((k.lower(),v)for k,v in r.headers.items()),r.read()
def check(name,ok,**details):checks.append(dict(name=name,passed=bool(ok),**details))
for item in inventory['inventory']:
 f=item['file']
 if f.startswith('api/') or f=='.htaccess':continue
 route='/' if f=='index.html' else '/'+(f[:-5]if f.endswith('.html')else f)
 status,headers,body=request(route)
 check('public:'+route,status==200 and hashlib.sha256(body).hexdigest()==item['sha256'],status=status,bytes=len(body))
 if f.endswith('.html'):
  check('headers:'+route,all(headers.get(k)==v for k,v in {
   'x-content-type-options':'nosniff','x-frame-options':'SAMEORIGIN',
   'referrer-policy':'strict-origin-when-cross-origin',
   'permissions-policy':'camera=(), microphone=(), geolocation=()'}.items()))
  text=body.decode()
  check('canonical:'+route,f'href="https://ip3-bd.org{route}"'in text or f=='404.html')
for rule in json.loads((root/'vercel.json').read_text())['redirects']:
 status,headers,body=request(rule['source'])
 location=headers.get('location','')
 expected=base+rule['destination']
 check('baseline-redirect:'+rule['source'],status==308 and location==expected,status=status,location=location)
 status,headers,body=request(rule['source']+'?utm_source=local')
 destination=urllib.parse.urlsplit(headers.get('location',''))
 target=urllib.parse.urlsplit(rule['destination'])
 check('baseline-query:'+rule['source'],status==308 and destination.path==target.path and destination.fragment==target.fragment and urllib.parse.parse_qs(destination.query).get('utm_source')==['local'],status=status,location=headers.get('location'))
for route in ['/about/','/about.html','/sectors/','/sectors/climate-energy-resilience.html']:
 status,headers,body=request(route)
 expected=base+route.rstrip('/').removesuffix('.html')
 check('clean-url:'+route,status==308 and headers.get('location')==expected,status=status,location=headers.get('location'))
status,headers,body=request('/ip3-local-missing-page-20261017')
check('genuine404',status==404 and body==(root/'dist/404.html').read_bytes(),status=status)
for route in ['/.env','/.git/config','/api/contact-lib.php','/wp-config.php']:
 status,headers,body=request(route)
 check('private-denied:'+route,status in [403,404] and b'<?php'not in body,status=status)
status,headers,body=request('/assets/video/city.mp4',headers={'Range':'bytes=0-15'})
check('video-range',status==206 and len(body)==16 and 'content-range'in headers,status=status)
status,headers,body=request('/api/contact')
check('contact-method',status==405 and 'application/json'in headers.get('content-type',''),status=status)
status,headers,body=request('/api/contact',method='POST',body=b'{}',headers={'Origin':'https://evil.example','Content-Type':'application/json'})
check('contact-cross-origin',status==403,status=status)
status,headers,body=request('/api/contact',method='POST',body=b'{}',headers={'Origin':base,'Content-Type':'application/json'})
check('contact-invalid-fields',status==400,status=status)
valid=json.dumps(dict(name='Local test',email='tester@example.org',message='Local only',startedAt=int(datetime.datetime.now().timestamp()*1000),turnstileToken='mock')).encode()
status,headers,body=request('/api/contact',method='POST',body=valid,headers={'Origin':base,'Content-Type':'application/json'})
check('contact-unconfigured-fails-closed',status==503 and b'not configured'in body,status=status)
if inventory['legacyPreview']:
 for rule in json.loads((root/'hosting/hostinger/confirmed-legacy-preview.json').read_text()):
  route=rule['source']
  if rule.get('has'):route+='?page_id='+rule['has'][0]['value']+'&utm_source=local'
  status,headers,body=request(route)
  location=headers.get('location','');dest=urllib.parse.urlsplit(location)
  target=urllib.parse.urlsplit(rule['destination'])
  ok=status==308 and dest.path==target.path and dest.fragment==target.fragment and dest.netloc=='127.0.0.1:43128'
  if rule.get('has'):ok=ok and urllib.parse.parse_qs(dest.query).get('utm_source')==['local']
  check('candidate-redirect:'+route,ok,status=status,location=location)
 for route in ['/?page_id=6281&p=17320','/?page_id=6281&paged=2','/?page_id=3632','/?page_id=999999']:
  status,headers,body=request(route)
  check('candidate-excluded:'+route,status==200 and 'location'not in headers,status=status)
data=dict(observedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),server='Local Apache2.4/PHP FastCGI; not Hostinger LiteSpeed',
 legacyPreview=inventory['legacyPreview'],passed=sum(r['passed']for r in checks),failed=sum(not r['passed']for r in checks),checks=checks)
label='legacy'if inventory['legacyPreview']else'baseline'
(out/f'http-{label}.json').write_text(json.dumps(data,indent=2))
print(json.dumps({k:v for k,v in data.items()if k!='checks'},indent=2))
for row in checks:
 if not row['passed']:print(json.dumps(row))
if data['failed']:raise SystemExit(1)
