const human={baker:'また来たんだね。最初の籠は、もう表に出したよ。',bookseller:'またいらしたんですね。今日は、机のそばが空いていますよ。',boatworker:'お、また港へ来たのか。足元の縄には気をつけてな。',starmaker:'また来てくれたんですね。今日はこの円を直しているところです。',greenBard:'また会えたね。少し、ここで休んでいく？'};
const cat={baker:'また来たのかい。粉の袋には乗らないでおくれ。',bookseller:'また君かい。机の下なら、静かに通れるよ。',boatworker:'また魚籠を見に来たのか。今日は、まだ空だぞ。',starmaker:'またあの光を見に来たのかな。小さな歯車は、触らないでね。',greenBard:'そこは暖かいね。今日は、ゆっくり歩いているんだね。'};
export function rememberedDialogue(stay,character,{profile,index}){
 if(!stay)return null;const id=character.id,d=stay.data,m=d.memories[id]??{},mode=m[profile];
 if(id==='greenBard'&&profile==='human'&&m.cat?.visits>0&&m.cat.lastDay<d.currentDay&&d.flags.finnLowViewDay!==d.currentDay){d.flags.finnLowViewDay=d.currentDay;stay.note('finn-low-view:'+d.currentDay,'フィンは、昨日の低い景色を知っているような言い方をした。',{kind:'person'});return '昨日は、ずいぶん低いところから街を見ていたね。今日は、鐘の音が少し近いかな。';}
 if(!mode?.visits)return null;
 if(mode.lastDay<d.currentDay)return profile==='cat'?cat[id]:({baker:'おはよう。また顔を見られてうれしいよ。今朝も、窯はもう温まっている。',bookseller:'おはようございます。昨日の頁の続きは、今日もここにありますよ。',boatworker:'おはよう。水の具合は、昨日とは少し違うな。',starmaker:'おはようございます。昨夜の星図を、今朝もう一度確かめていたんです。',greenBard:'おはよう。ひと晩たつと、同じ路地も少し違って見えるね。'})[id];
 return index===1?(profile==='cat'?cat[id]:human[id]):null;
}
export function rememberConversation(stay,character,profile){if(!stay)return;const d=stay.data,m=d.memories[character.id]??={};const previous=m[profile];m[profile]={visits:(previous?.visits??0)+1,firstDay:previous?.firstDay??d.currentDay,lastDay:d.currentDay};stay.note('met:'+character.id+':'+profile,profile==='cat'?character.name+'のそばへ、低い足音で寄った。':character.name+'と、街の暮らしについて少し話した。',{kind:'person',playerMode:profile});stay.changed();}
