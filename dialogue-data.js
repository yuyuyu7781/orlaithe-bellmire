// Stable character identities; illustrations and alternate actor/time lines
// can be added without touching the 3D town or interaction selection.
export const characters=[
  {id:'baker',name:'モイラ',role:'パン屋',portrait:null,
    lines:{human:{default:['朝一番の窯は、街が静かなうちに火を入れるんだ。鐘が鳴るころには、最初の籠を外へ出すよ。','丸いパンをひとつ残しておくのさ。誰が取りに来るかは、日によって違うけれどね。']},cat:{}}},
  {id:'bookseller',name:'エヴァン',role:'古書店主',portrait:null,
    lines:{human:{default:['古い本ほど、前の持ち主の癖が残るものですよ。この角の折り目も、私はそのままにしています。','星の本をお探しですか。奥の棚です。帰り道の本は、その隣にありますよ。']},cat:{}}},
  {id:'boatworker',name:'ブラン',role:'港の荷運び',portrait:null,
    lines:{human:{default:['今日は水が静かだ。こういう日は荷ほどきが早い。終わったら、網のほつれを直さないとな。','この縄はまだ使えるよ。九つ結んだ印より、手に馴染むかどうかの方が大事さ。']},cat:{}}},
  {id:'starmaker',name:'ネッサ',role:'天球儀店の職人',portrait:null,
    lines:{human:{default:['星は同じところにある。でも、見る人間の方が動いている。だから、この円を少しずつ直すんです。','真鍮を磨くと、指まで光ってしまって。夕方には、また布で包んでおきます。']},cat:{}}},
  {id:'greenBard',name:'フィン',role:'緑の吟遊詩人',portrait:null,
    identity:{recurring:true,gender:'male',appearance:'若く中性的。年齢は定かでない。緑の外套と木の弦楽器を持つ、穏やかな旅人。'},
    lines:{human:{default:['こんにちは。今は弦を張り直しているところ。水音に負けないくらいで、ちょうどいいんだ。','ここの鐘は、歌の間に入ってくるね。少し待ってから続きを弾くと、うまく収まることがあるよ。']},cat:{}}}
];

export function selectDialogue(character,{profile='human',time='clear',index=0}={}){
  const actor=character.lines[profile]??character.lines.human;
  const lines=actor[time]?.length?actor[time]:actor.default?.length?actor.default:character.lines.human.default;
  return lines[index%lines.length];
}
