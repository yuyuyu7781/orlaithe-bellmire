export const lodgingFacilities=[
 {id:'cv-civic-inn',name:'朝鐘の宿',ward:'civicWard',type:'lodging',offset:[-7.5,-29],size:[8,9],characterId:'cvTessa',restType:'inn'},
 {id:'cv-scholar-house',name:'高台の共同下宿',ward:'scholarHeights',type:'lodging',offset:[22,-22],size:[10,10],characterId:'cvAven',restType:'residency'}
].map(s=>({...s,restable:true,lodging:true,hours:{morning:'open',day:'open',evening:'open',night:'open'}}));
const person=(id,name,role,ward,mainLocation,age,height,width,hair,lines)=>({id,name,role,ward,mainLocation,lodging:true,region:'caer-veyra',profile:{age,height,width,hair},visualProfile:{intro:role,palette:{cloth:'#778077',hair:'#'+hair.toString(16),wash:'#c1b89d'}},portrait:null,portraits:{periods:{},expressions:{}},lines:{human:{default:lines},cat:{default:['椅子の下は空いているよ。寝床は人が使うから、窓辺で休んでおいで。']}},schedule:Object.fromEntries(['morning','day','evening','night'].map(p=>[p,mainLocation]))});
export const lodgingCharacters=[
 person('cvTessa','テッサ','中央区の宿主','civicWard','cv-civic-inn',46,1.65,1.08,0x645a50,['朝一番なら記録院はまだ空いてるよ。荷物は受付の横へ。','許可証待ちの客が今週は多いね。朝食は早く用意するから。','明日の書類は共同机で揃えておくといい。夜は静かにね。']),
 person('cvAven','アヴェン','共同下宿の主人','scholarHeights','cv-scholar-house',53,1.74,1.04,0x969180,['共同机の紙は、持ち主が戻るまでそのままにしておいて。','帰りが遅くても、湯と夜食は残してあるよ。','長い滞在の部屋と、今夜だけの部屋がある。外套は入口の横で乾かせる。']),
 person('cvIsel','イセル','旅の学者','scholarHeights','cv-scholar-house',39,1.78,.94,0x554f46,['今日は北側の道を見てきた。数週間のつもりが、まだここにいる。','古い地図は、描いた人の癖まで見ないとね。歩いて比べると、合わない線も見えてくる。','靴が泥だらけでね。今日は食事を忘れる前に戻ってきた。','道が崩れていて、方角を取り直した。明日は別の道を歩くよ。','地図の写しが古かった。今夜は紙を乾かすだけにしておこう。','夕飯はまだ残っているかな。雨で予定を変えたんだ。'])
];
export function iselPresent({period,weather,dayIndex}){return period==='night'?(dayIndex%7!==0||!['clear','dawn','night'].includes(weather)):period==='evening'&&['rain','blackout'].includes(weather);}
export function iselReply(data,index){const d=data.discoveries??{};if(index%4!==3)return null;if((d['crown:visit']||d['region:hollow-crown'])&&Math.floor(index/4)%3===2)return '空白？ 地図では、空白は何もない場所とは限らない。現地で何が見えたのか、聞かせて。';if((d['ring:visit']||d['region:the-ring'])&&Math.floor(index/4)%3===1)return '輪の形は、用途より先に残ることがある。何のためだったかは、形だけからは分からない。';if(d['region:nine-stones']||d['nine:visit'])return Math.floor(index/4)%2?'配置まで似ているなら、少し話は変わるけど。向きと間隔も残しておきたい。':'石の並び？ 円形そのものは珍しくないよ。まずは、違うところも比べたい。';return null;}
const civicRoles=['地方の役人','商人','建築申請の職人','家系記録を調べる市民','書記志望の旅人'],scholarRoles=['学生','測量師','地方の教師','観測者','地図写し','旅の記録者'];
export function lodgingHostReply(id,state,index){
 const lines=id==='cvTessa'?{morning:['記録院へ行くなら今のうちだよ。朝食の器は食堂へ。','出発前の荷物は受付横で確認してね。'],day:['書類は共同机で揃えておくといいよ。','許可証待ちの客が今週は多いね。'],evening:['明日の書類を揃えたら、食堂で休んでおいで。'],night:['明日の朝は早い人が多いからね。今は片付けているところ。','夜は静かに。湯はまだ残してあるよ。']}:id==='cvAven'?{morning:['朝食を済ませた人から出かけていくよ。紙は置いたままでいい。'],day:['また遅くなるって言ってたよ。机の紙はそのままにね。'],evening:['雨の日はみんな帰りが早い。外套は入口横へ。'],night:['夜食は共同机へ。観測から戻る人の分も残してある。','滞在の長い人も、帰る時刻は日によって違うよ。']}:null;
 return lines?lines[state.period][index%lines[state.period].length]:null;
}
export function lodgingGuests(id,state){
 const academic=id==='cv-scholar-house',roles=academic?scholarRoles:civicRoles,p=state.period;
 const count=academic?(p==='night'?3+state.dayIndex%2:p==='evening'?(['rain','blackout'].includes(state.weather)?3:2):p==='morning'?2:1):(p==='night'?1+state.dayIndex%2:p==='day'?2+state.dayIndex%3:p==='morning'?3:2);
 const ordinary=academic?['明日は測量に出る。靴を乾かしておこう。','この紙、乾かないな。机を少し借りてもいい？','観測は雲が切れてからだって。','夕飯、残ってる？ 今日はずいぶん歩いた。','地図の写しは明日にするよ。今夜は遅いから。','高台の風は冷たい。湯があると助かる。']:['記録院は午後から混むと聞いた。明日は早く出るつもり。','昨日は水路区で荷が足止めされた。ここで一晩待つよ。','申請の写しを揃えている。机を少し借りてもいいかな。','朝食が早いから助かる。荷物もまとめておこう。'];
 return Array.from({length:count},(_,i)=>{const key=(state.dayIndex+i)%roles.length;return {key,role:roles[key],text:ordinary[(state.dayIndex+i)%ordinary.length]};});
}
