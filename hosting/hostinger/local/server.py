"""LOCAL Apache/PHP harness, never a Hostinger connection or system service."""
import os, pathlib, signal, socket, subprocess, sys
root=pathlib.Path(__file__).resolve().parents[3]
runtime=pathlib.Path.home()/'.cache/ip3-hostinger-poc-runtime/root'
state=pathlib.Path.home()/'.cache/ip3-hostinger-poc-runtime/server'
state.mkdir(exist_ok=True)
document=root/'hosting/hostinger/dist-hostinger'
assert document.is_dir()
for port in [43128,43130]:
 with socket.socket() as probe:
  probe.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
  probe.bind(('127.0.0.1',port))
modules=['mpm_event','authz_core','authz_host','dir','mime','rewrite','headers','proxy','proxy_fcgi','filter','deflate','env']
config='\n'.join([
 f'ServerRoot "{state}"','Listen 127.0.0.1:43128','ServerName 127.0.0.1',
 f'PidFile "{state}/apache.pid"',f'ErrorLog "{state}/error.log"',
 *[f'LoadModule {name}_module "{runtime}/usr/lib/apache2/modules/mod_{name}.so"' for name in modules],
 'ServerTokens Prod','ServerSignature Off',f'DocumentRoot "{document}"',
 f'<Directory "{document}">','AllowOverride All','Require all granted','</Directory>',
 'TypesConfig /etc/mime.types',
 'AddType text/css .css','AddType text/javascript .js','AddType application/json .json',
 'AddType image/svg+xml .svg','AddType image/webp .webp','AddType video/mp4 .mp4',
 'ProxyFCGIBackendType GENERIC',
 '<FilesMatch "\\.php$">','SetHandler "proxy:fcgi://127.0.0.1:43130"',
 f'ProxyFCGISetEnvIf "true" SCRIPT_FILENAME "{document}/api/contact.php"','</FilesMatch>','',
])
(state/'httpd.conf').write_text(config)
env={**os.environ,'LD_LIBRARY_PATH':str(runtime/'usr/lib/x86_64-linux-gnu'),
 'CONTACT_ALLOWED_HOSTS':'127.0.0.1:43128'}
for privateKey in ['RESEND_API_KEY','CONTACT_TO','CONTACT_FROM','TURNSTILE_SECRET','IP3_CONTACT_CONFIG','CONTACT_RATE_DIR']:
 env.pop(privateKey,None)  # Local HTTP tests must never inherit usable provider credentials.
php=subprocess.Popen([str(runtime/'usr/bin/php-cgi8.5'),'-n','-b','127.0.0.1:43130'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
apache=None
def stop(*_):
 for process in [apache,php]:
  if process is not None and process.poll() is None:process.terminate()
signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
try:
 syntax=subprocess.run([str(runtime/'usr/sbin/apache2'),'-t','-f',str(state/'httpd.conf')],env=env)
 if syntax.returncode:sys.exit(syntax.returncode)
 apache=subprocess.Popen([str(runtime/'usr/sbin/apache2'),'-DFOREGROUND','-f',str(state/'httpd.conf')],env=env)
 print('IP3 LOCAL Apache http://127.0.0.1:43128 ; PHP FastCGI loopback43130',flush=True)
 apache.wait()
finally:
 stop()
 for process in [apache,php]:
  if process is not None:
   try:process.wait(timeout=5)
   except subprocess.TimeoutExpired:process.kill();process.wait()
