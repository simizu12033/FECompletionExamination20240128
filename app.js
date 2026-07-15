const state={filter:"すべて",query:"",onlyUnlearned:false,done:new Set(JSON.parse(localStorage.getItem("tokurei-fe-20240128-done")||"[]"))};
const fields=["すべて",...new Set(QUESTIONS.map(x=>x.field))];
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const box=(text,cls="")=>`<div class="v-box ${cls}">${esc(text)}</div>`;
const arrow=(label="")=>`<div class="v-arrow"><i>→</i>${label?`<small>${esc(label)}</small>`:""}</div>`;
const flow=(parts,labels=[])=>`<div class="v-flow">${parts.map((x,i)=>`${i?arrow(labels[i-1]||""):""}${box(x,i===parts.length-1?"focus":"")}`).join("")}</div>`;
const stack=(layers)=>`<div class="v-stack">${layers.map((x,i)=>`<div style="--i:${i}">${esc(x)}</div>`).join("")}</div>`;
const cycle=(items)=>`<div class="v-cycle">${items.map((x,i)=>`<div><b>${i+1}</b><span>${esc(x)}</span></div>`).join("")}</div>`;
const formula=(top,bottom,steps=[])=>`<div class="v-formula rich-formula"><strong>${esc(top)}</strong>${steps.map(s=>`<em>${esc(s)}</em>`).join("")}<span>${esc(bottom)}</span></div>`;
const compare=(leftTitle,left,rightTitle,right)=>`<div class="v-compare"><section><h4>${esc(leftTitle)}</h4>${left.map(x=>`<p>${esc(x)}</p>`).join("")}</section><b>VS</b><section class="good"><h4>${esc(rightTitle)}</h4>${right.map(x=>`<p>${esc(x)}</p>`).join("")}</section></div>`;
const matrix=(headers,rows)=>`<div class="mini-table"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const cards=(items)=>`<div class="v-cardset">${items.map((x,i)=>`<section class="${i===items.length-1?"focus":""}"><b>${esc(x[0])}</b><p>${esc(x[1])}</p></section>`).join("")}</div>`;
const layer=(items,focus)=>`<div class="v-layers">${items.map(x=>`<div class="${x===focus?"focus":""}">${esc(x)}</div>`).join("")}</div>`;
const grid=(items)=>`<div class="v-grid">${items.map(x=>`<div>${esc(x)}</div>`).join("")}</div>`;
const termFor=q=>typeof TERMS!=="undefined"?TERMS.find(t=>t.q===q.n):null;
function detailedFrame(q,visual){
  const term=termFor(q);
  const steps=(q.reasoning||[]).slice(0,3);
  const chips=Array.isArray(q.diagram)?q.diagram.slice(0,4):[];
  return `<div class="v-detail">
    <div class="v-detail-main">${visual}</div>
    <aside class="v-detail-side">
      <div class="v-detail-title">
        <span>見る順</span>
        <strong>${esc(term?.term||q.title)}</strong>
      </div>
      <ol>${steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      <div class="v-detail-cue">
        <b>覚える軸</b>
        <p>${esc(term?.cue||q.caption||q.title)}</p>
      </div>
      <div class="v-detail-trap">
        <b>注意</b>
        <p>${esc(q.trap)}</p>
      </div>
      ${chips.length?`<div class="v-detail-chips">${chips.map(x=>`<i>${esc(x)}</i>`).join("")}</div>`:""}
    </aside>
  </div>`;
}

function autoDiagram(q){
  const parts=Array.isArray(q.diagram)&&q.diagram.length?q.diagram:[q.title,q.answerText];
  if(q.field==="基礎理論"||q.field==="会計")return formula(parts[0],parts.slice(1).join(" → "));
  if(q.field==="データベース"||q.field==="ネットワーク"||q.field==="開発技術")return flow(parts);
  if(q.field==="セキュリティ"||q.field==="ストラテジ"||q.field==="マネジメント")return cards(parts.map((x,i)=>[i+1,x]));
  return flow(parts);
}

function richVisual(q){
  return autoDiagram(q);
}
window.renderRichVisual=q=>detailedFrame(q,richVisual(q));
