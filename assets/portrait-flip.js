/* Flip the portrait without interfering with the existing idle float/tilt. */
(()=>{"use strict";
  const portrait=document.querySelector(".portrait-card");
  const button=portrait?.querySelector(".portrait-card__flip-button");
  const front=portrait?.querySelector(".portrait-card__face--front");
  const back=portrait?.querySelector(".portrait-card__face--back");
  if(!portrait||!button||!front||!back)return;

  const setFlipped=(flipped)=>{
    portrait.classList.toggle("is-flipped",flipped);
    button.setAttribute("aria-pressed",String(flipped));
    button.setAttribute("aria-label",flipped?
      "Show Fiqri's portrait again":"Flip Fiqri's portrait to read a personal note");
    front.setAttribute("aria-hidden",String(flipped));
    back.setAttribute("aria-hidden",String(!flipped));
  };
  setFlipped(false);
  portrait.classList.add("is-flippable");
  button.addEventListener("click",()=>setFlipped(!portrait.classList.contains("is-flipped")));
})();