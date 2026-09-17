from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
root=Path(__file__).resolve().parents[1]
assert (root/'index.html').exists(), 'Главная HTML-страница ещё не создана'
class Scan(HTMLParser):
 def __init__(self):super().__init__();self.urls=[];self.ids=set();self.noindex=False
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if d.get('id'):self.ids.add(d['id'])
  for k in ['src','href']:
   if d.get(k):self.urls.append(d[k])
  if tag=='meta' and d.get('name')=='robots':self.noindex='noindex' in d.get('content','')
errors=[];pages=list(root.glob('*.html'))+list((root/'articles').glob('*.html'));parsed={}
for p in pages:
 scan=Scan();scan.feed(p.read_text());parsed[p.resolve()]=scan
 if not scan.noindex:errors.append(f'{p.name}: нет noindex')
for p in pages:
 for url in parsed[p.resolve()].urls:
  u=urlsplit(url)
  if u.scheme or u.netloc:continue
  target=(p.parent/unquote(u.path)).resolve() if u.path else p.resolve()
  if not target.exists():errors.append(f'{p.name}: отсутствует {url}')
  if u.fragment and target in parsed and u.fragment not in parsed[target].ids:errors.append(f'{p.name}: отсутствует якорь {url}')
d=json.loads((root/'content.json').read_text())
assert len(d['products'])==10 and len(d['recipes'])==35 and len(d['merch'])==3
assert not errors, '\n'.join(errors)
print(f'OK: {len(pages)} HTML-страниц; локальные ссылки, якоря, изображения, noindex и количество товаров/рецептов проверены.')
