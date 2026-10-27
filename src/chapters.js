import { exhibits } from './content.js';
import { assetURL } from './assets.js';
export const arrivalFrames = Array.from({length:12},(_,index)=>assetURL(`journey/arrival-${String(index).padStart(2,'0')}.jpg`));
export const chapters = {
  train: [
    { year:'1975', label:'MEMORY', title:'A familiar rhythm', image:'journey/legacy-train.jpg', caption:'The railway we remember.', text:exhibits.train.past },
    { year:'2000', label:'IN TRANSIT', title:'The in-between', image:'train-transition.png', caption:'A familiar form. A different colour.', text:'Change is rarely a clean break. An older train in a brighter livery sits between two visual worlds. The machinery remains familiar while its identity changes. This chapter is an artistic view of transition, rather than a date assigned to the photograph.' },
    { year:'2025', label:'PRESENT', title:'The present arrives', image:'journey/arrival-11.jpg', caption:'Your arrival sequence, Rīga.', text:exhibits.train.present }
  ],
  tram: [
    { year:'1975', label:'MEMORY', title:'The city on a line', image:'tram-past.png', caption:'Tracks through memory.', text:exhibits.tram.past },
    { year:'2000', label:'IN TRANSIT', title:'A thread through the city', image:'tram-past.png', caption:'The route outlives the vehicle.', text:'Buildings, passengers, and vehicles change. The line still connects familiar places. Seen as a chapter between eras, the tram is a reminder that modernisation happens along routes people already know.' },
    { year:'2025', label:'PRESENT', title:'A lower threshold', image:'tram-present.png', caption:'Contemporary low-floor design reference, Liepāja.', text:exhibits.tram.present }
  ],
  bus: [
    { year:'1975', label:'MEMORY', title:'A shared routine', image:'bus-past.png', caption:'An ordinary room, on wheels.', text:exhibits.bus.past },
    { year:'2000', label:'IN TRANSIT', title:'A city in transition', image:'trolleybus.png', caption:'A trolleybus reference from the studies.', text:'The blue-and-white trolleybus brings another kind of movement into the street. Its overhead wires connect it to the city in a different way. Here it stands beside the bus as a related part of Riga’s public-transport landscape, rather than as the same vehicle.' },
    { year:'2025', label:'PRESENT', title:'Everyday, together', image:'bus-present.png', caption:'A changing street. A shared destination.', text:exhibits.bus.present }
  ],
  station: [
    { year:'1975', label:'MEMORY', title:'A fixed point', image:'station-color.jpg', caption:'The station as a landmark in memory.', text:exhibits.station.past },
    { year:'2000', label:'IN TRANSIT', title:'A place between places', image:'departures.jpg', caption:'Lives measured in departures.', text:'A departure board turns individual plans into a shared rhythm. People arrive, wait, and leave. The station belongs to all of them for a moment. In the collage it is the constant around which the vehicles move.' },
    { year:'2025', label:'PRESENT', title:'The place we return to', image:'journey/window.jpg', caption:'The view from your seat.', text:exhibits.station.present }
  ]
};
