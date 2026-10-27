// Photographic fragments are cut with SVG geometry; the source images remain intact.
let fragmentId=0;
const fragment = (file, viewBox, points, w, h) => {
  const id=`photo-cutout-${++fragmentId}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="photo-fragment" aria-hidden="true"><defs><clipPath id="${id}"><polygon points="${points}"/></clipPath></defs><image href="/assets/${file}" width="${w}" height="${h}" clip-path="url(#${id})"/></svg>`;
};
const trainPast = () => fragment('train-past.png','80 40 290 325','89,249 108,184 129,115 148,93 193,73 252,74 260,50 279,50 291,79 332,93 339,114 347,191 365,204 356,228 348,264 345,326 301,349 177,361 128,323 100,283',531,398);
const trainNow = () => fragment('train-present.png','250 128 255 125','258,230 260,168 269,145 282,137 322,134 346,141 380,157 412,170 449,187 474,199 498,215 499,230 459,240 399,242 324,250 277,247',600,344);
const trainTransition = () => fragment('train-transition.png','55 50 423 228','60,199 62,114 70,101 71,77 87,70 128,61 159,57 189,61 222,80 240,94 303,113 377,129 446,144 477,158 478,215 446,226 414,235 330,246 246,258 198,272 146,279 80,275 76,247',478,319);
const trolleybus = () => fragment('trolleybus.png','285 192 580 290','289,447 294,298 305,232 330,217 402,205 444,206 493,212 615,229 714,247 783,263 850,277 859,369 851,404 828,429 784,440 752,438 657,458 611,472 578,474 549,470 471,471 382,464 290,451',1024,576);
const busPast = () => fragment('bus-past.png','0 42 425 220','0,204 4,111 12,91 271,50 328,44 397,51 406,62 414,161 422,185 417,230 357,244 284,251 228,241 215,258 192,261 177,240 77,224 68,237 51,238 40,219 2,210',426,300);
const busNow = () => fragment('bus-present.png','8 95 383 192','8,153 14,133 51,126 60,111 92,100 113,100 209,144 287,174 367,204 382,214 387,251 363,263 336,264 324,272 310,270 247,271 237,282 216,281 204,274 69,285 40,276 38,219 42,154 16,139',420,315);
const tramPast = () => fragment('tram-past.png','145 125 167 163','153,242 153,181 170,152 197,137 243,128 279,134 298,148 303,169 309,254 301,275 278,281 190,284 171,273 166,253',479,314);
const tramNow = () => fragment('tram-present.png','112 64 301 224','117,258 113,222 118,187 130,145 146,129 167,123 185,120 222,114 231,93 273,65 292,67 259,83 244,99 241,117 274,126 318,133 354,140 385,149 408,159 413,223 404,242 374,248 361,261 339,262 322,257 277,267 262,278 245,279 223,276 165,289 132,282 120,271',531,398);
const station = (present=false) => fragment(present?'station-color.jpg':'station.jpg','0 130 681 778','0,788 49,779 80,677 216,635 237,439 263,219 283,164 327,141 359,158 366,183 397,204 444,275 471,560 681,496 681,908 0,908',681,908);
const board=()=>fragment('departures.jpg','272 178 590 465','355,182 645,374 712,468 814,543 853,635 647,548 279,441',1210,908);
const canopy=()=>fragment('journey/arrival-11.jpg','0 0 1350 800','0,0 1350,0 1350,772 1105,726 630,450 100,105 0,65',1350,1800);
const passenger=()=>fragment('journey/arrival-11.jpg','450 660 160 390','491,677 526,666 548,685 558,723 577,742 590,798 579,849 573,894 582,947 571,1018 551,1037 535,1038 530,1020 509,1039 487,1036 482,1020 491,967 476,900 478,848 462,795 466,745 481,716',1350,1800);
const platform=()=>fragment('journey/arrival-11.jpg','0 1070 1350 530','0,1090 1125,1070 1350,1500 170,1600',1350,1800);
const clock=()=>`<svg class="photo-fragment clock-art" viewBox="0 0 220 220"><circle cx="110" cy="110" r="103" fill="#d9d2bd"/><circle cx="110" cy="110" r="93" fill="none" stroke="#68726b" stroke-width="1"/>${Array.from({length:12},(_,i)=>`<path d="M110 25V37" stroke="#343d38" stroke-width="${i%3?2:4}" transform="rotate(${i*30} 110 110)"/>`).join('')}<path class="clock-hand clock-hour" d="M110 119V63"/><path class="clock-hand clock-minute" d="M110 121V35"/><path class="clock-hand clock-second" d="M110 132V24"/><circle cx="110" cy="110" r="6" fill="#a88c64"/></svg>`;
const ticket=()=>`<svg class="photo-fragment ticket-art" viewBox="0 0 320 130"><path d="M0 0H320V48Q300 65 320 82V130H0V82Q20 65 0 48Z" fill="#d7c9ae"/><path d="M226 12V118" stroke="#80735b" stroke-dasharray="3 5"/><path d="M15 17H211M15 113H211" stroke="#80735b" stroke-width=".7"/><text x="25" y="66" font-family="Arial,sans-serif" font-size="36" letter-spacing="4" fill="#333a32">RĪGA</text><text x="26" y="90" font-family="monospace" font-size="8" letter-spacing="3" fill="#5a604e">ONE JOURNEY</text><path d="M248 34h6v61h-6m10-61h2v61h-2m7-61h5v61h-5m9-61h2v61h-2m6-61h7v61h-7" fill="#58604f"/></svg>`;
const signal=()=>`<svg class="photo-fragment" viewBox="0 0 100 340"><path d="M46 102H57V334H46Z" fill="#626e64"/><rect x="13" y="0" width="76" height="154" rx="28" fill="#222c27" stroke="#707b6e" stroke-width="2"/><circle class="signal-amber" cx="51" cy="40" r="21" fill="#a78d60"/><circle class="signal-green" cx="51" cy="108" r="21" fill="#495b4b"/><path d="M7 151H94M36 310H68" stroke="#758370" stroke-width="5"/></svg>`;

export function artwork(present = false, transition = false) {
  return `<div class="graphic-field">
    <svg class="geometry" viewBox="0 0 1000 730" preserveAspectRatio="xMidYMid meet"><defs><pattern id="stripes-${present}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V12" stroke="currentColor" stroke-width="3"/></pattern></defs>
    <circle class="sun-disc" cx="576" cy="307" r="239" fill="${present ? '#e95732' : '#d3c9b6'}"/>
    <circle cx="768" cy="109" r="78" fill="url(#stripes-${present})"/>
    <path d="M205 556L866 342L962 552L300 709Z" fill="${present ? '#81999c' : '#b5b4ac'}"/>
    <path d="M181 589L860 369M187 606L870 383" stroke="#282a27" stroke-width="3"/>
    <path d="M256 656L928 436M277 670L941 451" stroke="#282a27" stroke-width="7"/>
    <path d="M308 674L934 470" stroke="#eee9de" stroke-width="2"/>
    <path d="M360 635L369 660M410 619L420 645M460 602L470 628M510 586L521 611M560 570L571 594M610 553L622 578M660 536L673 561M710 520L724 544M760 503L775 528M810 487L826 511M860 470L877 495" stroke="#282a27" stroke-width="3"/>
    <path d="M333 129L866 590" stroke="#282a27" stroke-width="1"/><path d="M426 56L947 500" stroke="#282a27" stroke-width="1"/>
    <circle cx="257" cy="299" r="6" fill="#282a27"/><path d="M231 299h52M257 273v52" stroke="#282a27"/>
    <text x="903" y="301" fill="#282a27" font-family="Arial,sans-serif" font-size="16" font-weight="700" transform="rotate(90 903 301)" letter-spacing="5">KUSTĪBA / MOTION</text>
    <text x="250" y="182" fill="${present ? '#e95732' : '#282a27'}" font-family="Arial,sans-serif" font-size="97" font-weight="900" transform="rotate(-18 250 182)">↗</text>
    </svg>
    <div class="glass-plane glass-plane-back"></div>
    <div class="piece piece-clock" data-reveal="clock"><div class="piece-inner">${clock()}</div></div>
    <div class="piece piece-canopy" data-reveal="canopy"><div class="piece-inner">${canopy()}</div></div>
    <div class="piece piece-board" data-reveal="board"><div class="piece-inner">${board()}</div></div>
    <div class="piece piece-station" data-reveal="station"><div class="piece-inner">${station(present)}</div></div>
    <div class="piece piece-signal" data-reveal="signal"><div class="piece-inner">${signal()}</div></div>
    <div class="piece piece-tram" data-reveal="tram"><div class="piece-inner">${present ? tramNow() : tramPast()}</div></div>
    <div class="piece piece-platform" data-reveal="platform"><div class="piece-inner">${platform()}</div></div>
    <div class="piece piece-train ${present ? transition ? 'transition-train' : 'modern-train' : ''}" data-reveal="train"><div class="piece-inner">${present ? transition ? trainTransition() : trainNow() : trainPast()}</div></div>
    <div class="piece piece-bus" data-reveal="bus"><div class="piece-inner">${present ? transition ? trolleybus() : busNow() : busPast()}</div></div>
    <div class="piece piece-passenger" data-reveal="passenger"><div class="piece-inner">${passenger()}</div></div>
    <div class="piece piece-ticket" data-reveal="ticket"><div class="piece-inner">${ticket()}</div></div>
    <svg class="foreground-wires" viewBox="0 0 1000 730"><path d="M-30 284Q530 438 1050 140M-30 291Q530 445 1050 147" fill="none" stroke="#9b9c8255" stroke-width=".8"/></svg>
    <div class="glass-plane glass-plane-front"></div>
    <div class="type-stamp">${present ? transition ? 'IN BETWEEN' : 'UZ PRIEKŠU' : 'ATMIŅAS'}<span>${present ? 'FORWARD, TOGETHER.' : 'MEMORIES IN MOTION.'}</span></div>
  </div>`;
}
