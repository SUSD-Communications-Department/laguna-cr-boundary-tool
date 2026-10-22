const E=BoundaryEngine,$=id=>document.getElementById(id);
let features=[],layer,map,pin,request=0,abort;
const initial=$('result').innerHTML;
const schoolWebsites={
 'Desert Canyon Elementary':'https://desertcanyones.susd.org/',
 'Desert Canyon Middle':'https://desertcanyonms.susd.org/',
 'Redfield Elementary':'https://redfield.susd.org/',
 'Anasazi Elementary':'https://anasazi.susd.org/',
 'Mountainside Middle':'https://mountainside.susd.org/',
 'Desert Mountain High':'https://desertmountain.susd.org/'
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function status(text){$('search-status').className='status';$('search-status').textContent=text;}
function cancel(){request++;abort?.abort();$('search-button').disabled=false;$('candidates').replaceChildren();status('');}
function showRule(grid,context,review=false){
 const rule=E.ruleFor(grid);$('grid').value=rule?grid:'';
 if(!rule){$('result').innerHTML='<div class="result-head"><h2>Looking for your neighborhood school?</h2><p>'+esc(context)+'</p></div><p>This location is outside the Laguna Prep and Copper Ridge School boundaries covered by this tool. To find your neighborhood school, please use the <a href="https://schoollocator.susd.org/HomeSchool/" target="_blank" rel="noopener noreferrer">SUSD School Locator<span class="sr-only"> (opens in a new tab)</span></a>.</p>';return;}
 const r=rule[1];
 $('result').innerHTML='<div class="result-head"><div class="eyebrow">2027–2028 · Grid '+esc(grid)+'</div><h2>'+esc(r.name)+'</h2><p>'+esc(context)+'</p></div>'+(review?'<div class="notice"><strong>Boundary review needed.</strong> This point is within 25 meters of a grid edge. The path below is the rule for the containing grid, not a confirmed address assignment.</div>':'')+[['K–5',r.elementary],['6–8',r.middle],['9–12',r.high]].map(([grade,name])=>'<div class="school"><span class="grade">'+grade+'</span><strong><a class="school-link" href="'+esc(schoolWebsites[name])+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(name)+' website (opens in a new tab)">'+esc(name)+' <span aria-hidden="true">↗</span></a></strong></div>').join('')+'<p class="fine">Based on the supplied reassignment table. Review preview; final district confirmation pending.</p>';
}
function highlight(grid){layer.eachLayer(l=>{const r=E.ruleFor(l.feature.properties.grid);l.setStyle({weight:l.feature.properties.grid===grid?3:1,color:l.feature.properties.grid===grid?'#173d42':(r?.[1].color||'#aebdb8'),fillOpacity:l.feature.properties.grid===grid?.5:(r?.26:.025)});});}
function choosePoint(lon,lat,context){
 if(pin)pin.remove();pin=L.circleMarker([lat,lon],{radius:7,color:'#fff',weight:3,fillColor:'#173d42',fillOpacity:1}).addTo(map);
 const found=E.locate([lon,lat],features);
 if(found.hits.length>1||(!found.hit&&found.near.length)){
  $('grid').value='';highlight(null);$('result').innerHTML='<div class="result-head"><h2>Boundary review needed</h2><p>'+esc(context)+'</p></div><div class="notice">This point falls on or near a grid edge where we cannot select one grid reliably. Nearby grids: '+esc([...new Set(found.near.map(f=>f.properties.grid))].join(', '))+'. Choose a grid to inspect its rule; confirm the address before relying on an assignment.</div>';return;
 }
 const grid=found.hit?.properties.grid;highlight(grid);showRule(grid,context,found.needsReview);
}
async function init(){
 const response=await fetch('data/grids.geojson');if(!response.ok)throw Error('Grid data could not load.');features=(await response.json()).features;
 map=L.map('map',{scrollWheelZoom:false}).setView([33.625,-111.835],12);
 L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri — Sources: Esri, HERE, Garmin, USGS, NGA, EPA, NPS'}).addTo(map);
 layer=L.geoJSON(features,{style:f=>{const r=E.ruleFor(f.properties.grid);return {color:r?.[1].color||'#aebdb8',weight:1,fillColor:r?.[1].color||'#bcc8c1',fillOpacity:r?.26:.025};},onEachFeature:(f,l)=>l.bindTooltip('Grid '+f.properties.grid+(E.ruleFor(f.properties.grid)?' · '+E.ruleFor(f.properties.grid)[1].name:' · Not included in this boundary-change lookup'))}).addTo(map);
 for(const [key,g] of Object.entries(E.groups)){const optgroup=document.createElement('optgroup');optgroup.label=g.name+' ('+g.grids.length+' grids)';for(const grid of g.grids){const option=document.createElement('option');option.value=grid;option.textContent='Grid '+grid;optgroup.append(option);} $('grid').append(optgroup);}
 map.on('click',event=>{cancel();choosePoint(event.latlng.lng,event.latlng.lat,'Selected map location · '+event.latlng.lat.toFixed(5)+', '+event.latlng.lng.toFixed(5));});
 $('grid').addEventListener('change',()=>{cancel();const grid=$('grid').value;if(!grid){reset();return;}const f=features.find(f=>f.properties.grid===grid);if(pin)pin.remove();highlight(grid);showRule(grid,'Grid selected directly; no address has been checked.');map.fitBounds(L.geoJSON(f).getBounds(),{padding:[50,50],maxZoom:15});});
 $('search').addEventListener('submit',search);$('reset').addEventListener('click',reset);
 status('Ready · 58 reassignment grids loaded.');
}
function reset(){cancel();$('address').value='';$('grid').value='';$('result').innerHTML=initial;if(pin)pin.remove();highlight(null);map.setView([33.625,-111.835],12);}
async function search(event){
 event.preventDefault();cancel();const serial=request;const address=$('address').value.trim();if(address.length<6){status('Enter a complete street address, city, and ZIP code.');return;}
 $('result').innerHTML=initial;$('grid').value='';highlight(null);if(pin)pin.remove();$('search-button').disabled=true;status('Looking for matching street addresses…');abort=new AbortController();const timer=setTimeout(()=>abort.abort(),15000);
 try{
  const url=new URL('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates');url.search=new URLSearchParams({SingleLine:address,f:'json',outFields:'Addr_type,Match_addr',maxLocations:'5',countryCode:'USA',location:'-111.85,33.62',searchExtent:'-112.05,33.45,-111.65,33.78',outSR:'4326',forStorage:'false'});
  const response=await fetch(url,{signal:abort.signal});if(!response.ok)throw Error('Address service unavailable');const json=await response.json();if(serial!==request)return;
  const matches=(json.candidates||[]).filter(c=>c.score>=90&&['PointAddress','StreetAddress','Subaddress'].includes(c.attributes?.Addr_type));
  if(!matches.length){status('No precise street-address match. Add the city and ZIP, or select your location on the map.');return;}
  status('Confirm the matched address below before viewing its school path.');
  for(const candidate of matches){const button=document.createElement('button');button.className='candidate';button.textContent=candidate.address+' →';button.addEventListener('click',()=>{cancel();$('address').value=candidate.address;choosePoint(candidate.location.x,candidate.location.y,'Matched address: '+candidate.address);map.setView([candidate.location.y,candidate.location.x],15);status('Address match selected. Check the map marker is on the correct property.');});$('candidates').append(button);}
 }catch(error){if(serial===request)status(error.name==='AbortError'?'Address search timed out. Try again, choose a grid, or use the map.':'Address search is unavailable. You can still choose a grid or click the map.');}
 finally{clearTimeout(timer);if(serial===request)$('search-button').disabled=false;}
}
init().catch(error=>{status('The preview could not load: '+error.message);$('search-button').disabled=true;});
