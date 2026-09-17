'use strict';
const nav=document.querySelector('.nav'),menu=document.querySelector('.menu-toggle');
function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Открыть меню');}
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
window.addEventListener('resize',()=>{if(innerWidth>800)closeMenu();});
const orderDialog=document.getElementById('order-dialog'),readerDialog=document.getElementById('reader-dialog');
let returnFocus,previousRecipeHash='';
function openRecipe(id,trigger,fromHash=false){
 const template=document.getElementById(id);if(!template||template.tagName!=='TEMPLATE')return false;
 if(!readerDialog.open){returnFocus=trigger;previousRecipeHash=fromHash?'':location.hash;}
 document.getElementById('reader-content').replaceChildren(template.content.cloneNode(true));readerDialog.dataset.recipe=id;
 if(!readerDialog.open)readerDialog.showModal();readerDialog.scrollTop=0;
 if(location.hash!=='#'+id)history.replaceState(null,'','#'+id);
 document.dispatchEvent(new Event('recipe-open'));return true;
}
document.addEventListener('click',event=>{
 const order=event.target.closest('[data-order]');if(order){returnFocus=order;document.getElementById('order-form').reset();document.getElementById('order-product').value=order.dataset.order;orderDialog.showModal();}
 const recipe=event.target.closest('[data-recipe]');if(recipe&&recipe!==readerDialog)openRecipe(recipe.dataset.recipe,recipe);
 if(event.target.closest('.close-dialog'))event.target.closest('dialog').close();
 const download=event.target.closest('[data-download-recipe]');if(download){const text=[...document.querySelectorAll('#reader-content .prose p')].map(x=>x.textContent).join('\n\n');const blob=new Blob([download.dataset.downloadRecipe+'\n\n'+text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=download.dataset.downloadRecipe+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 if(event.target.closest('[data-print-recipe]'))window.print();
 if(event.target.closest('[data-print-article]'))window.print();
 if(event.target.closest('[data-copy-recipe]'))copyRecipeLink();
});
async function copyRecipeLink(){const link=location.href;try{await navigator.clipboard.writeText(link);showToast('Ссылка на рецепт скопирована.');}catch{const box=document.querySelector('#reader-content .recipe-link');box.hidden=false;const input=box.querySelector('input');input.value=link;input.focus();input.select();showToast('Скопируйте выделенную ссылку.');}}
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{if(dialog===readerDialog&&location.hash.startsWith('#recipe-'))history.replaceState(null,'',location.pathname+location.search+previousRecipeHash);returnFocus?.focus();});
});
function readRecipeHash(){if(location.hash.startsWith('#recipe-')){if(!openRecipe(location.hash.slice(1),null,true))showToast('Рецепт по этой ссылке не найден.');}else if(readerDialog.open)readerDialog.close();}
window.addEventListener('hashchange',readRecipeHash);
document.addEventListener('DOMContentLoaded',readRecipeHash);
document.getElementById('order-form')?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const data=new FormData(form);const text=`Здравствуйте!\n\nИнтересует: ${data.get('product')}\nИмя: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}\n\nПисьмо подготовлено на демонстрационной версии BodreevShow.`;window.location.href='mailto:zernabor@mail.ru?subject='+encodeURIComponent('BodreevShow: '+data.get('product'))+'&body='+encodeURIComponent(text);showToast('Письмо подготовлено. Отправьте его в почтовой программе.');});
let toastTimer;
function showToast(text){const toast=document.querySelector('.toast');clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('visible');toastTimer=setTimeout(()=>toast.classList.remove('visible'),5000);}
