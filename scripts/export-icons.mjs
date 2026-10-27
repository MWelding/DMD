import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {artwork} from '../src/artwork.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'../Exported Icons');
const manifest=[];
const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const svg=(body,color='#eeede8')=>`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
async function save(category,name,content){
  const relative=`${category}/${name}.svg`;
  await mkdir(resolve(output,category),{recursive:true});
  await writeFile(resolve(output,relative),content,'utf8');
  manifest.push({name,category,file:relative});
}

const speaker='<path d="M10 5L5 9H2V15H5L10 19Z" fill="currentColor" stroke-width="1"/>';
const ui={
  'sound-on':svg(speaker+'<path d="M14 8Q18 12 14 16M17 5Q24 12 17 19"/>','#f3cf8e').replace('<svg ','<svg color="#f3cf8e" '),
  'sound-off':svg(speaker+'<path d="M15 9L21 15M21 9L15 15"/>','#a5aba5').replace('<svg ','<svg color="#a5aba5" '),
  'about-info':svg('<circle cx="12" cy="5" r="1" fill="#eeede8" stroke="none"/><path d="M10 10H13L10.7 18Q10.3 20 13.5 18.5"/>'),
  'fullscreen-enter':svg('<path d="M4 9V4H9M15 4H20V9M20 15V20H15M9 20H4V15"/>'),
  'fullscreen-exit':svg('<path d="M9 4V9H4M20 9H15V4M15 20V15H20M4 15H9V20"/>'),
  'close':svg('<path d="M6 6L18 18M18 6L6 18"/>'),
  'hotspot-plus':svg('<path d="M6 12H18M12 6V18"/>'),
  'hotspot-marker':svg('<circle cx="12" cy="12" r="10" stroke-opacity=".7"/><path d="M8 12H16M12 8V16"/>'),
  'arrow-right':svg('<path d="M4 12H20M14 6L20 12L14 18"/>'),
  'arrow-up-right':svg('<path d="M5 19L19 5M7 5H19V17"/>','#baa184'),
  'replay-journey':svg('<path d="M4 11A8 8 0 1 1 7 19M4 5V11H10"/>'),
  'timeline-carriage':svg('<path d="M4 5H20V18H4Z M8 5V18M12 5V18M16 5V18M7 18V20M17 18V20"/>'),
  'cursor-dot':svg('<circle cx="12" cy="12" r="2.5" fill="#dfd4bf" stroke="none"/>'),
  'colour-lens-ring':svg('<circle cx="12" cy="12" r="10" stroke-opacity=".45"/>'),
};
for(const [name,content]of Object.entries(ui))await save('Interface',name,content);
await save('Interface','favicon',await readFile(resolve(root,'public/assets/favicon.svg'),'utf8'));

async function standalone(markup){
  let result=markup.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"\s+xmlns="http:\/\/www.w3.org\/2000\/svg"/,'xmlns="http://www.w3.org/2000/svg"');
  const viewBox=result.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  result=result.replace('<svg ',`<svg width="${viewBox[2]}" height="${viewBox[3]}" `);
  for(const match of [...result.matchAll(/href="(\/assets\/[^\"]+)"/g)]){
    const path=resolve(root,'public'+match[1]);
    const data=await readFile(path);
    result=result.replace(match[0],`href="data:${mime[extname(path)]};base64,${data.toString('base64')}"`);
  }
  // SVG exports carry their own clock styling instead of requiring website CSS.
  for(const [hand,angle,width,color]of [['hour',300,6,'#333d37'],['minute',60,3.8,'#333d37'],['second',0,1.5,'#b17d45']]){
    result=result.replace(`class="clock-hand clock-${hand}"`,`class="clock-hand clock-${hand}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" transform="rotate(${angle} 110 110)"`);
  }
  result=result.replace('class="photo-fragment clock-art"','class="photo-fragment clock-art"');
  return result;
}
for(const [era,present,transition]of [['Past',false,false],['Present',true,false],['Transition',true,true]]){
  const html=artwork(present,transition);
  const pieces=[...html.matchAll(/<div class="piece [^"]+" data-reveal="([^"]+)"><div class="piece-inner">([\s\S]*?<\/svg>)<\/div><\/div>/g)];
  for(const [,name,markup]of pieces){
    if(era==='Transition'&&!['train','bus'].includes(name))continue;
    await save(`Collage/${era}`,name,await standalone(markup));
  }
}

await writeFile(resolve(output,'manifest.json'),JSON.stringify(manifest,null,2));
const cards=manifest.map(item=>`<a href="${item.file}" download><img src="${item.file}" alt="${item.name}"><span>${item.category} / ${item.name}</span></a>`).join('');
await writeFile(resolve(output,'Preview.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Installation icon exports</title><style>body{margin:40px;background:#101516;color:#eee9de;font:14px Arial}h1{font-size:25px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px}a{display:flex;flex-direction:column;justify-content:space-between;text-decoration:none;color:inherit;background:#1d2525;border:1px solid #ffffff19;padding:18px;border-radius:8px;min-height:180px}img{width:100%;height:145px;object-fit:contain}span{font-size:11px;color:#c5baa5;margin-top:15px}p{color:#aab2a8;margin-bottom:30px}</style><h1>Installation icons & collage objects</h1><p>Standalone SVG files with transparent backgrounds. Select a card to export its SVG.</p><main>${cards}</main></html>`);
await writeFile(resolve(output,'README.txt'),`INSTALLATION ICON EXPORTS

Open Preview.html to browse the complete set.

Interface/: 15 interface symbols, including both sound states, arrows, replay, close, fullscreen, hotspot, cursor and favicon.
Collage/Past/: 11 original collage objects in their past appearance.
Collage/Present/: 11 collage objects in their colour/current appearance.
Collage/Transition/: the intermediate train and trolleybus cutouts.

All SVGs are standalone. Photographs are embedded, so no asset folder or website is needed. Backgrounds are transparent; the favicon deliberately retains its red square. The preview uses dark tiles so light interface icons are easy to see.

The collage objects are exported upright, without the composition's tilt, shadows or cursor effects. The clock is a static 10:10 export. Live clock motion, elastic deformation and signal pulsing belong to the website.

The sound symbols and collage artwork come from the installation. Text-glyph interface symbols have editable vector-path equivalents. The ticket retains editable text using common system fonts.

Original photographs remain unchanged. These exports retain the source-image rights and permissions.

Recreate exports with: node scripts/export-icons.mjs (from the website folder).
`);
console.log(`Exported ${manifest.length} standalone SVGs to ${output}`);
