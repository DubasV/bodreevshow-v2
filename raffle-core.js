(function(root){
'use strict';
const normal=value=>String(value??'').trim().toLocaleLowerCase('ru');
function parseRows(rows,options){
 const price=Number(options.price);if(!Number.isFinite(price)||price<=0)throw Error('Цена билета должна быть больше нуля.');
 if(!rows.length)throw Error('Файл пуст.');
 const headers=rows[0].map(normal), nameIndex=headers.findIndex(x=>['имя пользователя','имя','name','участник'].includes(x)), amountIndex=headers.findIndex(x=>['сумма, rub','сумма','amount','сумма rub'].includes(x)),dateIndex=headers.findIndex(x=>['дата и время','дата','date'].includes(x));
 if(nameIndex<0||amountIndex<0)throw Error('Не найдены колонки «Имя пользователя» и «Сумма, RUB» (или «Имя» и «Сумма»).');
 const entries=[];let total=0,skipped=0;
 rows.slice(1).forEach(row=>{const name=String(row[nameIndex]??'').trim(),amount=Number(String(row[amountIndex]??'').replace(/\s/g,'').replace(',','.'));
 if(!name||!Number.isFinite(amount)||amount<price||(!options.includeAnonymous&&['аноним','anonymous'].includes(normal(name)))||(options.exclude&&normal(name)===normal(options.exclude))){skipped++;return;}
 const count=Math.floor((Math.round(amount*100))/(Math.round(price*100)));
 if(!Number.isSafeInteger(count)||count<1||total+count>10000000)throw Error('Слишком много билетов: максимум 10 000 000. Проверьте суммы и цену.');
 entries.push({name,start:total+1,end:total+count,count,date:dateIndex>=0?String(row[dateIndex]??''):''});total+=count;
 });return {entries,total,skipped,distinct:new Set(entries.map(e=>normal(e.name))).size};
}
function randomInt(max){const range=4294967296,limit=Math.floor(range/max)*max,array=new Uint32Array(1);do{crypto.getRandomValues(array);}while(array[0]>=limit);return array[0]%max;}
function draw(entries,count,pick=randomInt){
 const distinct=new Set(entries.map(e=>normal(e.name))).size;if(!Number.isInteger(count)||count<1||count>distinct)throw Error('Число победителей должно быть от 1 до количества уникальных участников.');
 let remaining=[...entries];const winners=[];
 for(let i=0;i<count;i++){const total=remaining.reduce((s,e)=>s+e.count,0);let offset=pick(total);if(!Number.isInteger(offset)||offset<0||offset>=total)throw Error('Ошибка случайного выбора.');
 for(const entry of remaining){if(offset<entry.count){winners.push({name:entry.name,ticket:entry.start+offset,date:entry.date});remaining=remaining.filter(e=>normal(e.name)!==normal(entry.name));break;}offset-=entry.count;}}
 return winners;
}
const api={parseRows,draw};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RaffleCore=api;
})(typeof window!=='undefined'?window:globalThis);
