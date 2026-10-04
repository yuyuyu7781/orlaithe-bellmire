import {portraitProfile} from './portrait-profiles.js';
import {periodForWeather} from './scene-settings.js';

// Stable character identities; illustrations and alternate actor/time lines
// can be added without touching the 3D town or interaction selection.
export const characters=[
  {id:'baker',name:'モイラ',role:'パン屋',portrait:null,portraitDefault:{src:'./assets/portraits/moira-default.png',alt:'モイラ — パン屋の水彩肖像',fit:'cover'},portraitHappy:null,portraitSerious:null,portraitNight:null,
    lines:{human:{default:['朝一番の窯は、街が静かなうちに火を入れるんだ。鐘が鳴るころには、最初の籠を外へ出すよ。','丸いパンをひとつ残しておくのさ。誰が取りに来るかは、日によって違うけれどね。']},cat:{}}},
  {id:'bookseller',name:'エヴァン',role:'古書店主',portrait:null,portraitDefault:{src:'./assets/portraits/evan-default.png',alt:'エヴァン — 古書店主の水彩肖像',fit:'cover'},portraitHappy:null,portraitSerious:null,portraitNight:null,
    lines:{human:{default:['古い本ほど、前の持ち主の癖が残るものですよ。この角の折り目も、私はそのままにしています。','星の本をお探しですか。奥の棚です。帰り道の本は、その隣にありますよ。']},cat:{}}},
  {id:'boatworker',name:'ブラン',role:'港',portrait:null,portraitDefault:{src:'./assets/portraits/blanc-default.png',alt:'ブラン — 港の水彩肖像',fit:'cover'},portraitHappy:null,portraitSerious:null,portraitNight:null,
    lines:{human:{default:['今日は水が静かだ。こういう日は荷ほどきが早い。終わったら、網のほつれを直さないとな。','この縄はまだ使えるよ。九つ結んだ印より、手に馴染むかどうかの方が大事さ。']},cat:{}}},
  {id:'starmaker',name:'ネリッサ',role:'天球儀店',portrait:null,portraitDefault:{src:'./assets/portraits/nerissa-default.png',alt:'ネリッサ — 天球儀店の水彩肖像',fit:'cover'},portraitHappy:null,portraitSerious:null,portraitNight:null,
    lines:{human:{default:['星は同じところにある。でも、見る人間の方が動いている。だから、この円を少しずつ直すんです。','真鍮を磨くと、指まで光ってしまって。夕方には、また布で包んでおきます。']},cat:{}}},
  {id:'greenBard',name:'フィン',role:'緑の吟遊詩人',portrait:null,portraitDefault:{src:'./assets/portraits/finn-default.png',alt:'フィン — 長い髪と深緑の外套をまとった吟遊詩人の水彩肖像',fit:'cover'},portraitHappy:null,portraitSerious:null,portraitNight:null,
    identity:{recurring:true,gender:'male',appearance:'若く中性的。年齢は定かでない。緑の外套と木の弦楽器を持つ、穏やかな旅人。'},
    lines:{human:{default:['こんにちは。今は弦を張り直しているところ。水音に負けないくらいで、ちょうどいいんだ。','ここの鐘は、歌の間に入ってくるね。少し待ってから続きを弾くと、うまく収まることがあるよ。']},cat:{}}}
];

// Merge the display/art profile into the established character identity.
for(const character of characters)character.visualProfile=portraitProfile(character);

// Defaults remain the v11.5 conversations; a small number of time-specific lines
// make the current five residents aware of the day's work without a full AI.
const timedLines={
 baker:{morning:[{text:'まだ窯が温まったばかりなんだ。最初の籠が出るまで、鐘ひとつ分ほど待っておくれ。',expression:'happy'}],night:['今日はもう粉をしまったよ。明日の朝なら、焼きたてを渡せる。']},
 bookseller:{night:[{text:'棚を閉めるところです。この頁の続きは、明るくなってからにしましょう。',expression:'serious'}]},
 boatworker:{morning:['朝の荷は、この水が明るくなる前に着くんだ。縄が濡れているから、足元に気をつけて。'],night:['今夜の荷は全部運んだよ。水音を聞いてから帰るのが、いつもの終わりさ。']},
 starmaker:{night:[{text:'今夜は道具を休ませています。星を見るには、磨いた円より暗い窓の方がいいこともあるんです。',expression:'serious'}]},
 greenBard:{night:['こんばんは。夜は少し小さな音で弾くんだ。窓の向こうで、誰かが眠っているからね。']}
};
for(const character of characters)Object.assign(character.lines.human,timedLines[character.id]);

const felineLines={
 baker:{default:['そこは粉だらけになるよ。籠の横なら、まだ温かいからね。'],night:['今夜の窯はおしまい。暖かい石の方で休んでおいで。']},
 bookseller:{default:['また本の上に乗るつもりかい。開いた頁だけは、空けておいておくれ。']},
 boatworker:{default:['魚なら今日はまだないぞ。縄で遊ぶのは、荷が下りてからだ。'],night:['もう魚籠は空だよ。桟橋の端へは行きすぎるな。']},
 starmaker:{default:['君には星より、あの小さな光の方が気になるかな。真鍮は冷たいから、鼻を近づけすぎないで。']},
 greenBard:{first:['今日は、そちらで歩いているんだね。ここなら、水音も近くに聞こえる。'],default:['この段の端は、昼間の温もりが残っているよ。少し休んでいく？'],night:['今夜は、低い音の方がよく聞こえるね。弦をひとつ、ゆるめてみようか。']}
};
for(const character of characters)Object.assign(character.lines.cat,felineLines[character.id]);

export function selectDialogueTurn(character,{profile='human',time='clear',index=0,location='town'}={}){
 const period=['morning','day','evening','night'].includes(time)?time:periodForWeather(time);
 const actor=character.lines[profile]??character.lines.human;
 const lines=index===0&&actor.first?.length?actor.first:actor[time]?.length?actor[time]:actor[period]?.length?actor[period]:actor.default?.length?actor.default:character.lines.human.default;
 const local=character.locationLines?.[location]?.[profile];
 const chosen=local?.length?[...local,...lines]:lines;
 const turn=chosen[index%chosen.length];
 if(profile==='human'&&index>0&&index%4===3&&character.rumorPool?.length)return {text:character.rumorPool[Math.floor(index/4)%character.rumorPool.length],expression:'default'};
 return typeof turn==='string'?{text:turn,expression:'default'}:{expression:'default',...turn};
}
export function selectDialogue(character,options){return selectDialogueTurn(character,options).text;}
// Extend the original flat fields; existing image strings and {src, alt} work.
// Optional portraits.periods[period][expression] and portraits.expressions allow
// future morning/evening/thinking variants without introducing another identity.
export function selectPortrait(character,{expression='default',time='day'}={}){
 const period=['morning','day','evening','night'].includes(time)?time:periodForWeather(time);
 const key={happy:'portraitHappy',serious:'portraitSerious',night:'portraitNight',default:'portraitDefault'}[expression];
 const variants=character.portraits;
 const candidate=variants?.periods?.[period]?.[expression]??(expression!=='default'?variants?.expressions?.[expression]??character[key]:null)??(period==='night'?character.portraitNight:null)??variants?.periods?.[period]?.default??variants?.expressions?.default??character.portraitDefault??character.portrait;
 if(typeof candidate==='string')return {src:candidate,alt:character.name};return candidate;
}
