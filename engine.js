/* Pure boundary rules. Geometry: PDF vectors, not hand-traced approximations. */
(function(root){
const groups = {
 copper:{name:'Copper Ridge',elementary:'Desert Canyon Elementary',middle:'Desert Canyon Middle',high:'Desert Mountain High',color:'#b65b37',grids:'83A 83B 83C 84A 84B 85A 86A 86C 87A 87C 87D 88A 88B 88C 89A 89B 90A 91A 91B 91C 91D 92A 92B 92C 92D 93A 94A 95A'.split(' ')},
 redfield:{name:'Laguna → Redfield',elementary:'Redfield Elementary',middle:'Desert Canyon Middle',high:'Desert Mountain High',color:'#7160a6',grids:'49A 49B 49C 49D 50A 50B'.split(' ')},
 anasazi:{name:'Laguna → Anasazi',elementary:'Anasazi Elementary',middle:'Mountainside Middle',high:'Desert Mountain High',color:'#237e86',grids:'50C 50D 51A 51B 51C 51D 52A 52B 52C 52D 53A 53B 53C 53D 54A 54B 54C 54D 55A 55B 55C 55D 63C 63D'.split(' ')}
};
const ruleFor = grid => Object.entries(groups).find(([,v])=>v.grids.includes(grid));
function inside(p,ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function distance(p,ring){let min=Infinity;const sx=111320*Math.cos(p[1]*Math.PI/180),sy=111320;for(let i=1;i<ring.length;i++){const a=[(ring[i-1][0]-p[0])*sx,(ring[i-1][1]-p[1])*sy],b=[(ring[i][0]-p[0])*sx,(ring[i][1]-p[1])*sy];const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,-(a[0]*dx+a[1]*dy)/(dx*dx+dy*dy||1)));min=Math.min(min,Math.hypot(a[0]+t*dx,a[1]+t*dy));}return min;}
function locate(point,features){
 const hits=features.filter(f=>inside(point,f.geometry.coordinates[0]));
 const near=features.filter(f=>distance(point,f.geometry.coordinates[0])<=25);
 const nearbyRules=new Set(near.map(f=>ruleFor(f.properties.grid)?.[0]||'outside-scope'));
 const hit=hits.length===1?hits[0]:null;
 const rule=hit?ruleFor(hit.properties.grid):null;
 // Review any near-edge location, including exterior edges and PDF rounding seams.
 return {hits,hit,rule,near,needsReview:near.length>0,conflictingRules:nearbyRules.size>1};
}
const api={groups,ruleFor,inside,distance,locate};root.BoundaryEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
