/* FQ / Colour grade before-after, inside the project video dialog.
 * Shown only for projects listed in assets/grades/grades.json, using frames
 * the owner exported (raw / log and graded). A native range input covers the
 * frame, so it works with mouse, touch and keyboard. See assets/grades/README.md. */
(()=>{"use strict";
  const dialog=document.getElementById("video-dialog");
  const figure=document.getElementById("grade-compare");
  if(!dialog||!figure)return;
  const before=figure.querySelector(".grade-compare__before");
  const after=figure.querySelector(".grade-compare__after");
  const range=figure.querySelector(".grade-compare__range");
  const frame=figure.querySelector(".grade-compare__frame");
  const labels=[figure.querySelector(".grade-compare__label--before"),figure.querySelector(".grade-compare__label--after")];
  let grades={};
  const ready=fetch("assets/grades/grades.json",{cache:"no-cache"}).then(r=>r.ok?r.json():{}).then(j=>{grades=j&&typeof j==="object"&&!Array.isArray(j)?j:{}}).catch(()=>{});
  const setPos=v=>frame.style.setProperty("--pos",v+"%");
  range.addEventListener("input",()=>setPos(range.value));
  function update(){
    if(!dialog.open){figure.hidden=true;return}
    ready.then(()=>{
      const entry=grades[dialog.dataset.project||""];
      if(!entry||!entry.before||!entry.after){figure.hidden=true;return}
      const name=document.getElementById("video-dialog-title")?.textContent||"this project";
      after.src=entry.after;after.alt="Graded frame from "+name;
      before.src=entry.before;before.alt="Raw frame from "+name;
      if(Array.isArray(entry.labels)){labels[0].textContent=entry.labels[0]||"Raw";labels[1].textContent=entry.labels[1]||"Graded"}
      else{labels[0].textContent="Raw";labels[1].textContent="Graded"}
      range.value=50;setPos(50);figure.hidden=false;
    });
  }
  new MutationObserver(update).observe(dialog,{attributes:true,attributeFilter:["open","data-project"]});
})();
