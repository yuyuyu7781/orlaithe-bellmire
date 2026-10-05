// A quiet line occasionally joins existing event/memory dialogue; important
// event replies retain precedence and all five portraits remain untouched.
export function connectCalendarDialogue({dialogue,townLife,stay}){
 for(const c of dialogue.characters)c.calendarReply=({profile,index})=>{if(profile!=='human'||index%3!==2)return null;const s=townLife.state;if(s.calendar.gathering&&c.id==='greenBard')return '今夜は水辺に灯りを置く日だね。急がなくても、帰り道は見えるよ。';if(s.calendar.market&&c.id==='baker')return '今日は市が立つから、いつもの籠を少し奥へ寄せたんだ。丘から布を持ってくる人もいる。';if(s.season==='autumn'&&c.id==='starmaker')return '日が低くなると、窓辺の真鍮の色も少し変わります。星図は同じ紙のままですけれど。';return null;};
 dialogue.onSpeak(({text})=>{if(text.includes('水辺に灯りを置く日'))stay.note('gathering:'+townLife.state.calendar.weekIndex,'今夜は水辺に灯りを出す日らしい。');if(text.includes('今日は市が立つ'))stay.note('weekly-market:'+townLife.state.calendar.weekIndex,'今日は市が立つ日らしい。');});
}
