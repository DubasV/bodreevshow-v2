'use strict';
const SAVE_KEY='bodreev-v2-recipes';
function readSaved(){try{const value=JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');return new Set(Array.isArray(value)?value.filter(x=>typeof x==='string'&&/^recipe-\d+$/.test(x)):[]);}catch{return new Set();}}
let saved=readSaved(),recipeFilter=location.hash==='#saved'?'saved':'all',kitFilter='all';
function updateSavedUI(){
 document.querySelectorAll('[data-saved-count]').forEach(x=>x.textContent=saved.size);
 document.querySelectorAll('[data-save-recipe]').forEach(button=>{const active=saved.has(button.dataset.saveRecipe);button.setAttribute('aria-pressed',String(active));button.classList.toggle('is-saved',active);button.textContent=button.classList.contains('save-recipe')?(active?'♥':'♡'):(active?'♥ Сохранено':'♡ Сохранить');if(button.classList.contains('save-recipe')){const name=button.closest('.recipe-card')?.querySelector('h3')?.textContent.trim()||'';button.setAttribute('aria-label',(active?'Удалить из сохранённых: ':'Сохранить рецепт ')+name);}});
}
function applySearch(input){const query=input.value.toLocaleLowerCase('ru').trim();const cards=[...document.querySelectorAll(input.dataset.searchTarget)];let shown=0;
 cards.forEach(card=>{let match=card.dataset.search.includes(query);if(card.classList.contains('recipe-card'))match=match&&(recipeFilter==='all'||recipeFilter==='new'&&card.dataset.new==='true'||recipeFilter==='saved'&&saved.has(card.dataset.id));if(card.classList.contains('product-card'))match=match&&(kitFilter==='all'||kitFilter===card.dataset.category);card.hidden=!match;if(match)shown++;});
 const empty=input.closest('section')?.querySelector('.empty-state');if(empty)empty.hidden=shown>0;const count=document.getElementById('kit-results');if(count&&input.dataset.searchTarget==='.product-card')count.textContent=`Найдено наборов: ${shown}`;
}
function setRecipeFilter(value){recipeFilter=value;document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});const input=document.querySelector('[data-search-target=".recipe-card"]');if(input)applySearch(input);}
function setKitFilter(value){kitFilter=value;document.querySelectorAll('[data-kit-filter]').forEach(b=>{const active=b.dataset.kitFilter===value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});const input=document.querySelector('[data-search-target=".product-card"]');if(input)applySearch(input);}
document.querySelectorAll('[data-search-target]').forEach(input=>input.addEventListener('input',()=>applySearch(input)));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{setRecipeFilter(button.dataset.filter);history.replaceState(null,'',location.pathname+location.search+(recipeFilter==='saved'?'#saved':''));}));
document.querySelectorAll('[data-kit-filter]').forEach(button=>button.addEventListener('click',()=>setKitFilter(button.dataset.kitFilter)));
document.querySelectorAll('[data-preset]').forEach(link=>link.addEventListener('click',()=>{const search=document.querySelector('[data-search-target=".product-card"]');if(search)search.value='';setKitFilter(link.dataset.preset);}));
document.addEventListener('click',event=>{const button=event.target.closest('[data-save-recipe]');if(!button)return;const id=button.dataset.saveRecipe;if(saved.has(id))saved.delete(id);else saved.add(id);try{localStorage.setItem(SAVE_KEY,JSON.stringify([...saved]));showToast(saved.has(id)?'Рецепт сохранён в этом браузере.':'Рецепт убран из сохранённых.');}catch{showToast('Браузер запретил сохранение. Избранное доступно до закрытия страницы.');}updateSavedUI();const input=document.querySelector('[data-search-target=".recipe-card"]');if(input)applySearch(input);});
document.addEventListener('recipe-open',updateSavedUI);
window.addEventListener('hashchange',()=>{if(location.hash==='#saved')setRecipeFilter('saved');});
window.addEventListener('storage',event=>{if(event.key===SAVE_KEY){saved=readSaved();updateSavedUI();setRecipeFilter(recipeFilter);}});
updateSavedUI();setRecipeFilter(recipeFilter);
