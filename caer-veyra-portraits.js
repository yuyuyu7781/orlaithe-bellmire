// Original supplied PNGs are preserved byte-for-byte. Crop is display-only.
// Stable actor/save IDs; optional night/expression fields use the existing UI.
const portrait=(name,role,ward,file,focusX,focusY,zoom,mobileY,intro)=>({name,role,ward,path:'./assets/portraits/'+file,focusX,focusY,zoom,mobileFocus:{focusX,focusY:mobileY,zoom:Math.max(1,zoom-.01)},nightVariant:null,expressionVariant:{},intro});
export const capitalPortraits={
 cvCedric:portrait('セドリック','外門の記録官','lowerWard','cv-cedric-default.png',50,27,1.02,25,'旅人と荷の通行記録を扱う、外門の記録官。'),
 cvLeon:portrait('レオン','門の警備・治安担当','lowerWard','cv-leon-default.png',49,27,1.02,25,'門の警備と街の日々の巡回を担う。'),
 cvMira:portrait('ミラ','宿屋兼食堂の主人','lowerWard','cv-mira-default.png',50,28,1.02,26,'旅人を迎え、宿と食堂を切り盛りする主人。'),
 cvGaren:portrait('ガレン','運河・水門の門番','canalWard','cv-garen-default.png',48,28,1.02,26,'運河と水門の仕事に慣れた、実務的な門番。'),
 cvSophia:portrait('ソフィア','運河港の女商人・帳簿役','canalWard','cv-sophia-default.png',50,27,1.02,25,'荷の順番と帳簿を確かめる、運河港の女商人。'),
 cvEdras:portrait('エドラス','記録院・公文書館の学者','civicWard','cv-edras-default.png',51,30,1.02,28,'記録の有無と、実際にあったことを分けて考える学者。'),
 cvLyune:portrait('リュネ','アーキビスト','civicWard','cv-lyune-default.png',52,20,1,18,'目録と資料を管理する、静かなアーキビスト。'),
 cvCassian:portrait('カシアン','星章の文官','civicWard','cv-cassian-default.png',50,25,1.02,23,'区画と制度の仕事を扱う、星章を着けた文官。'),
 cvOrm:portrait('オルム','鐘楼守・番人','civicWard','cv-orm-default.png',52,26,1.02,24,'鐘と、その響きの間隔を確かめる鐘楼守。'),
 cvSerena:portrait('セレナ','星読みの学者','scholarHeights','cv-serena-default.png',52,28,1.02,26,'空の方向を観測し、図と慎重に比べる星読みの学者。'),
 cvYulio:portrait('ユリオ','地図学者・測量担当','scholarHeights','cv-yulio-default.png',48,24,1.02,22,'古地図と現地の線を比べる、眼鏡の地図学者。'),
 cvNoah:portrait('ノア','学徒・研究者','scholarHeights','cv-noah-default.png',53,26,1.02,24,'図の似ているところにも、違うところにも目を向ける若い学徒。'),
 cvElda:portrait('エルダ','旧市街の老婦人','oldQuarter','cv-elda-default.png',53,31,1.02,29,'昔の呼び名で、いつもの暮らしを語る旧市街の住人。'),
 cvVal:portrait('ヴァル','石工職人','oldQuarter','cv-val-default.png',49,26,1.02,24,'古い壁も、今日の仕事として直す石工職人。')
};
export function applyCapitalPortrait(character){const p=capitalPortraits[character.id];if(!p)return character;return{...character,name:p.name,role:p.role,portraitSettings:p,portraitDefault:{src:p.path,alt:p.name+' — '+p.role+'の肖像',fit:'cover',framing:{objectPositionX:p.focusX,objectPositionY:p.focusY,zoom:p.zoom,mobile:{objectPositionX:p.mobileFocus.focusX,objectPositionY:p.mobileFocus.focusY,zoom:p.mobileFocus.zoom}}},portraitNight:p.nightVariant,portraits:{...character.portraits,expressions:{...character.portraits?.expressions,...p.expressionVariant}},visualProfile:{...character.visualProfile,intro:p.intro}};}
