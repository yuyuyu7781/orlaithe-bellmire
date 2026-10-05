// Small, authored observations layered on the existing memory/rumour turns.
// Cat and human memories remain separate; Finn alone hints at continuity.
export const stayDialogue={
 day2:{baker:'昨日の荷が来たよ。今朝のパンは、いつもの厚さに戻せそうだ。',bookseller:'昨日は棚の隙間まで確かめてくれたんですね。今日は、机の上を少し空けました。',boatworker:'昨日の荷札は乾いたぞ。濡れていた円の跡だけ、まだ濃いな。',starmaker:'古い星図に、円の縁を九つの点が囲むものがあるんです。何の数なのかは、まだ分かりません。',greenBard:'昨日と同じ石でも、水が引くと違うものが見えるね。急いで名前をつけなくてもいいと思うよ。'},
 day3:{baker:'三日もいると、朝の窯の匂いが分かるようになるだろう。今日は少し、薪を変えたんだ。',bookseller:'頁に残った丸い跡は、茶の器かもしれない。古い印に似ていても、すぐには決められませんね。',boatworker:'港の古い石にも、上流と似た線がある。潮が下がると見つけやすいぞ。',starmaker:'昨日の鐘は、最後の余韻が少し違った気がします。星図の円まで、そう見えてしまうんです。',greenBard:'古い印は、消えたと思った頃にまた出てくるものだよ。今日の水辺も、ゆっくり見ていくといい。'},
 rain:{baker:'今日は石が滑るよ。パンの籠は、庇の下へ寄せておいた。',bookseller:'湿った日は、頁を急いで開かない方がいい。ここで少し乾かしていきませんか。',boatworker:'縄が重いな。雨が弱まるまで、荷ほどきは少し待つ。',starmaker:'今夜は星を待つより、古い図を直す日にしましょう。',greenBard:'雨の路地は、いつもより足音が近く聞こえるね。'},
 dawn:{baker:'まだ早いね。最初の窯だけ、先に起こしているところだよ。',bookseller:'外はまだ青いですね。棚の奥の灯りを、もう少し残しておきましょう。',boatworker:'まだ水が暗いな。杭の場所を確かめてから舟を出す。',starmaker:'夜が明け始めると、見えていた星から先に消えていくんです。',greenBard:'まだ鐘を待っている時間だね。屋根の色が変わるまで、ここにいようかな。'},
 blackout:{baker:'窯の火は残っているよ。灯りが戻るまで、足元に気をつけて。',bookseller:'油灯ひとつでも、頁は読めます。今夜は薄い本を選びましょう。',boatworker:'港の端の灯は残してきた。暗いところでは縄を踏まないようにな。',starmaker:'器具は、灯りが戻ってから動かしましょう。円の位置は覚えているので。',greenBard:'小さな灯りだと、人のいる場所がよく分かるね。急がずに帰ろう。'}
};
export function stayObservation(stay,id,{profile,index}){
 const d=stay.data;if(index%4===3)return null; // Leave the established rumour turn intact.
 if(profile==='cat')return d.currentDay>=2&&index%4===2?({baker:'今日は、昨日の袋も温かいよ。そこで眠るつもりかい。',bookseller:'棚の隙間は覚えたのかい。今度は本を落とさないでね。',boatworker:'昨日の籠より、こっちの陰が涼しいぞ。',starmaker:'また机の下に来たんですね。あの点は、光ではありませんよ。',greenBard:'今日は、そちらで歩いているんだね。昨日とは違う隙間が見つかった？'})[id]:null;
 if(['rain','dawn','blackout'].includes(d.weather)&&index%3===2)return stayDialogue[d.weather][id];
 if(d.currentDay>=2&&index%4===2){
  // Do not pretend an undiscovered book was found or an unheard delivery arrived.
  if(id==='baker'&&d.currentDay===2&&d.events['delayed-grain']?.state!=='resolved')return '今日の最初の籠は、少し小さめだよ。荷のことは、港でまた聞いてみる。';
  if(id==='bookseller'&&d.currentDay===2&&d.events['missing-folio']?.state!=='resolved')return '薄い本は、まだ探しているんです。棚の裏は、細い隙間ばかりでね。';
  return stayDialogue[d.currentDay>=3?'day3':'day2'][id];
 }return null;
}
