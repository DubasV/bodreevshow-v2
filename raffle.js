'use strict';
const $=id=>document.getElementById(id);let current=null;
const status=$('raffle-status');
function textElement(tag,text,className=''){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;}
function resetRaffle(){current=null;$('draw').disabled=true;$('participants').replaceChildren();$('winners').replaceChildren();status.textContent='Параметры изменились. Нажмите «Анализировать файл».';}
['raffle-file','ticket-price','exclude-name','include-anonymous'].forEach(id=>$(id).addEventListener('change',resetRaffle));
$('analyze').addEventListener('click',async()=>{
 resetRaffle();const file=$('raffle-file').files[0];if(!file){status.textContent='Сначала выберите Excel или CSV.';return;}if(file.size>5*1024*1024){status.textContent='Файл должен быть не больше 5 МБ.';return;}
 $('analyze').disabled=true;status.textContent='Читаем файл…';
 try{if(typeof XLSX==='undefined')throw Error('Не удалось загрузить библиотеку Excel. Проверьте наличие файла assets/xlsx.full.min.js.');
 const isCSV=/\.csv$/i.test(file.name);const input=isCSV?await file.text():await file.arrayBuffer();const book=XLSX.read(input,{type:isCSV?'string':'array',cellDates:true});const rows=XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]],{header:1,raw:false,defval:''});
 current=RaffleCore.parseRows(rows,{price:Number($('ticket-price').value),exclude:$('exclude-name').value,includeAnonymous:$('include-anonymous').checked});
 const table=document.createElement('table'),head=document.createElement('thead'),hr=document.createElement('tr');['Участник','Билеты','Дата'].forEach(x=>hr.append(textElement('th',x)));head.append(hr);table.append(head);const body=document.createElement('tbody');
 current.entries.slice(0,1000).forEach(e=>{const row=document.createElement('tr');[e.name,e.start===e.end?e.start:`${e.start}–${e.end}`,e.date].forEach(x=>row.append(textElement('td',String(x))));body.append(row);});table.append(body);$('participants').append(table);
 status.textContent=`Участников: ${current.distinct}. Билетов: ${current.total}. Пропущено строк: ${current.skipped}.`+(current.entries.length>1000?' Показаны первые 1000 строк; в выборе участвуют все.':'');$('draw').disabled=current.total===0;
 }catch(error){current=null;status.textContent=error.message;}finally{$('analyze').disabled=false;}
});
function loadHistory(){try{const data=JSON.parse(localStorage.getItem('bodreev-demo-history')||'[]');return Array.isArray(data)?data:[];}catch{return [];}}
function renderHistory(){const holder=$('history');holder.replaceChildren();const history=loadHistory();if(!history.length){holder.textContent='Розыгрышей на этом устройстве пока нет.';return;}history.forEach(x=>holder.append(textElement('p',`${x.time} — ${x.name}, билет ${x.ticket}`)));}
$('draw').addEventListener('click',()=>{if(!current)return;try{const winners=RaffleCore.draw(current.entries,Number($('winner-count').value));$('winners').replaceChildren();const time=new Date().toLocaleString('ru-RU');winners.forEach((w,i)=>{const box=document.createElement('div');box.className='winner';box.append(textElement('span',`ПОБЕДИТЕЛЬ ${i+1} / БИЛЕТ ${w.ticket}`),textElement('strong',w.name),textElement('small',w.date));$('winners').append(box);});try{localStorage.setItem('bodreev-demo-history',JSON.stringify([...winners.map(w=>({...w,time})),...loadHistory()].slice(0,100)));}catch{status.textContent='Победители выбраны. Браузер не разрешил сохранить историю.';}renderHistory();}catch(e){status.textContent=e.message;}});
renderHistory();
