// Ordinary customs seen by a visitor; meaning is deliberately left unsettled.
// Targets reference real scene objects after grounding, not guessed floor heights.
export function createInspectionTargets({culture,well,moorings,wheel,millrace,landings,details}){
  const find=name=>culture.fittings.find(o=>o.name===name),sign=name=>culture.signs.find(o=>o.name.startsWith(name));
  const specs=[
    ['well',well,'井戸','縁の円は、桶の縄よりも古い。水を汲む前に、そこへ手を置く人がいる。',[0,.24,1.02]],
    ['travel-stone',find('Traveller touchstone'),'旅立ちの石','旅立つ前に、この石へ指を触れる者が多い。九本の線は、触れられたところだけ浅くなっている。'],
    ['alley-mark',details.alley,'路地の渦巻き','雨の日には、溝だけが濃い色になる。同じ印は、遠い港にもあるという。'],
    ['shrine',find('Inn wall candle niche'),'壁際の小祠','旅人が置いた蝋燭も、朝には誰かが取り替える。誰のためかを尋ねる者は少ない。',[0,.05,.20]],
    ['bakery',sign('First Loaf'),'パン屋の木看板','最初の籠は、鐘より少し前に表へ出る。丸いパンをひとつ残しておくのが、この店の習慣らしい。',[0,-.035,.86]],
    ['bookshop',sign('Crooked Leaf'),'古書店の木看板','本の背に、小さな星が押されている。棚の順序を尋ねると、季節の話が返ってくる。',[0,-.035,.86]],
    ['moorings',moorings,'港の係留杭','縄を掛ける前に、木札を裏返す船乗りがいる。港の印には、星と円が重ねて彫られている。',[0,.2,0]],
    ['mill',wheel,'水車','上の段丘から来た水が、下の羽根を押している。粉屋は水音で、朝の仕事量を決めるという。'],
    ['leat',millrace.root,'奥の泉','奥へ続く高台の小さな泉に水が集まり、浅い流れから二段の岩縁を越えて町へ向かう。短い木の導水口には、何度も直した跡が残っている。',(millrace.upstream.sourcePoint??millrace.upstream.stonePoint).toArray()],
    ['cable-stop',landings,'ケーブルカーの停留所','荷物をひとつ、席をひとつ。小さな鐘を鳴らしてから、向こうの段丘へ綱を送る。'],
    ['orrery',sign('Orrery House'),'天球儀店の星と円','真鍮の円には、数え直したような小さな傷がある。九つ目の星には、名前を付けない人もいる。',[0,-.035,.86]],
    ['belfry-mark',details.belfry,'鐘楼への道の古い印','鐘の音を数える子どもは、今もいるらしい。九本目の溝には、いつも少し苔が残る。',[0,.45,.16]],
    ['market-wool',culture.goods.find(o=>o.name==='Square wool'),'広場の羊毛','羊毛には、丘で干した草の匂いが残っている。染める色は、家ごとに少し違う。',[0,.55,0]],
    ['star-chart',details.chart,'古い星図','円の外には、道にも似た細い線がある。旅人の書き込みは、消さずに残すらしい。']
  ];
  const catText={
    well:'縁の石はひんやりしている。桶が動くたび、底の方で音が丸く返る。',
    'travel-stone':'何人もの手の匂いが重なっている。浅い溝には、昼の温もりが少し残っている。',
    moorings:'濡れた縄と、魚籠の匂い。杭の陰は、風が弱い。',
    mill:'低い水音に、木がきしむ音が混ざる。輪の下へは、近づきすぎない方がよさそうだ。',
    'market-wool':'乾いた草と羊の匂い。籠の間には、鼻先ほどの隙間がある。'
  };
  return specs.map(([id,object,label,text,localPoint])=>{if(!object)throw Error('Missing inspect object: '+id);return {id,kind:'inspect',object,label,text,localPoint,range:id==='orrery'?4.2:3.8,profiles:catText[id]?['human','cat']:['human'],textByProfile:catText[id]?{cat:catText[id]}:undefined};});
}
