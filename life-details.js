// Placement/content additions use the existing contact and crowding policy.
export function addLifeDetails({THREE,culture,lit}){
  const {mesh,block,ring,line,materials:m}=culture.tools;
  const goods=[
    ['Bakery morning basket',-36.2,27.3,'bread'],
    ['Inn travellers luggage',-42.5,5.2,'luggage'],
    ['Harbor rope and net',-9.2,35.5,'net'],
    ['Orrery small instruments',7.8,1.6,'orrery'],
    ['Upper traveller stone',-5.5,-18.4,'stone']
  ].map(q=>culture.addGoods(...q));
  if(goods.some(o=>!o))throw Error('A new shop detail needs a clear placement');
  const belfry=goods.at(-1);
  const alley=culture.addMark('Alley worn traveler mark',-38.0,4.7,18.255,'spiral');
  const chart=culture.addMark('Bookshop star chart',-15.45,4.2,31.605,'star');
  culture.addMark('Inn worn knot',-37.8,7.20,2.505,'knot');
  const bindery=culture.fittings.find(o=>o.name==='Bookbinder leather and awl');
  for(let i=0;i<3;i++)block(bindery,0,.055+i*.023,0,.25-i*.015,.022,.14,m.linen);
  // A slim crate of folios is mounted on the settled display, clear of its books.
  block(bindery,0,.13,-.03,.19,.06,.10,m.wood);block(bindery,0,.19,-.03,.16,.035,.08,m.blue);
  const tavern=culture.signs.find(o=>o.name.startsWith('Copper Kettle'));
  const glow=new THREE.MeshStandardMaterial({color:0xc6a66b,emissive:0xdf9b4e,emissiveIntensity:.65,roughness:.85});lit.push(glow);
  line(tavern,[.32,.76,.86],[.55,.76,.86],m.iron,.015);line(tavern,[.52,.76,.86],[.52,.48,.86],m.iron,.015);
  mesh(new THREE.SphereGeometry(.085,7,5),glow,tavern,.52,.35,.86);block(tavern,.52,.22,.86,.21,.025,.18,m.brass);block(tavern,.52,.45,.86,.21,.025,.18,m.iron);
  for(const dx of [.42,.62])block(tavern,dx,.245,.86,.022,.20,.022,m.iron);
  return {goods,belfry,chart,alley};
}
