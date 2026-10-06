// Stable identities extend the existing save whitelist and shared simulation.
export const lunmereLayout={entry:[-400,6.16,20],square:[-430,6.16,22],pier:[-418,6.16,-2],visitingCharacterIds:['greenBard'],bounds:{minX:-469,maxX:-393,minZ:-28,maxZ:59},road:[[-308,6.04,-17],[-309,6.04,0],[-322,6.08,12],[-347,6.12,13],[-373,6.16,15],[-392,6.16,20],[-408,6.16,20]],houses:[[-455,8],[-455,24],[-455,42],[-430,48],[-411,47],[-404,34],[-427,-1],[-447,-1]]};
const hours={morning:'open',day:'open',evening:'open',night:'open'};
export const lunmereShops=[
 {id:'lun-inn',name:'柳の宿',center:[-422,34],size:[8,7],characterId:'lunHost',restable:true,type:'lodging'},
 {id:'lun-diner',name:'湖窓の食堂',center:[-438,5],size:[8,7],type:'dining'},
 {id:'lun-boats',name:'テヴの舟小屋',center:[-413,4],size:[7,6],characterId:'lunBoat',type:'workshop'},
 {id:'lun-store',name:'岸辺の小商店',center:[-443,32],size:[7,6],type:'supplies'}
].map(s=>({...s,hours:{...hours,...(['workshop','supplies'].includes(s.type)?{night:'closed'}:{})},palette:{wall:0xd2d5c7,wood:0x716553,accent:0x82938b},description:s.name+' — 湖と暮らす小さな場所'}));
export const lunmereCharacters=[
 {id:'lunHost',name:'イーラ',role:'柳の宿の主人',lines:{human:{default:['靴は入口で乾かしておいで。湖から来る道は、晴れていても湿っているから。','今朝の客は、霧が薄くなるまで食卓にいたよ。急がなくてもいい。']},cat:{default:['窓の下なら暖かいよ。干してある布には乗らないでね。']}}},
 {id:'lunBoat',name:'テヴ',role:'舟小屋の人',lines:{human:{default:['舟底の継ぎ目を直している。今日は漕ぐより、乾かす日だな。','Lake Lunの桟橋まで、縄を届けてくる。帰りには水位を見ておこう。']},cat:{default:['魚の籠は奥だよ。縄を爪でほどかないでおくれ。']}}},
 {id:'lunWatcher',name:'マレン',role:'湖岸の住民',lines:{human:{default:['岸の石が出ているね。毎年こういう日がある。昨日と同じ岸でも、少し違って見えるよ。','霧は珍しくないよ。対岸を見ようとするより、近い杭を見た方が道が分かる。']},cat:{default:['草の下を歩くんだね。露がついたら、石の上で乾かしておいで。']}}}
];
export const lakeTownEvents=[
 ['lake-parcel','湖畔の小包','湖畔の石に、小包がひとつ。紐には宿の布と似た色が混じっている。','次の朝、小包はなくなっていた。石の上には乾いた跡が残る。','lake:parcel','lunHost',1],
 ['lake-knot','緩んだ結び目','舟の縄が少し緩んでいる。桟橋の杭に、結び直した跡が重なっている。','結び目が新しくなった。舟は同じ静かな水に浮かんでいる。','lake:knot','lunBoat',1],
 ['lake-morning-wood','朝の木片','岸に薄い木片がある。水で磨かれた縁に、半円のような傷が残っている。',null,'lake:morning-wood','lunWatcher',0],
 ['lun-skiff-repair','修理中の舟','舟底の継ぎ目には、まだ濃い木の色が残る。','舟底の板が揃った。削り屑だけが、舟小屋の脇に残っている。','lun:repair','lunBoat',2],
 ['lun-wet-net','乾かない網','網の先から、小さなしずくが落ちる。風の向きが変わるまで、そのままにしておくらしい。',null,'lun:net','lunBoat',0],
 ['lun-guest-bag','宿の忘れ物','小さな袋が、受付の脇に残っている。持ち主は湖岸まで歩いていったようだ。','袋はなくなっている。宿帳の端に、短い礼が書き足されていた。','lun:bag','lunHost',1],
 ['lun-late-goods','遅れている荷','商店の空の籠には、果実の葉だけが残っている。','空だった籠に、乾いた果実の包みが届いていた。','lun:goods','lunHost',1],
 ['lun-low-water','水位の跡','岸の平たい石に、途切れた円が見える。濡れたところだけ、線が少し濃い。',null,'lun:water-mark','lunWatcher',0]
].map(([id,label,text,resolvedText,source,person,settlesAfter])=>({id,label,text,resolvedText,source,area:id.startsWith('lake')?'Lake Lun':'Lunmere',kind:'daily',priority:-.15,enabled:true,rumorIds:[person],rumor:text,settlesAfter,...(id==='lake-morning-wood'?{periods:['morning']}:{})}));
