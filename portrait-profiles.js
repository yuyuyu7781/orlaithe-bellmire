// Display/art direction only. Existing character identities, dialogue and 3D
// actors remain in dialogue-data.js. These are provisional cards, not final art.
const profiles={
 baker:{mood:'親しみと朝の温もり',impression:'働き者の、穏やかな包容力',intro:'窯の温もりを袖に残したパン屋。',portraitDirection:'40代前後。丸みのある顔、そばかす、栗色〜赤茶の髪。生成りのブラウスとくすんだ赤茶のエプロン。健康的で親しみやすく、パン屋らしい生活感。胸上、朝の窯の柔らかな反射。',palette:{paper:'#e7dbc0',wash:'#c19a76',cloth:'#95654c',hair:'#685247',ink:'#514438'},motif:'loaf'},
 bookseller:{mood:'静かで思慮深い',impression:'古い頁と過ごす、控えめな親切',intro:'頁の折り目まで覚えている古書店主。',portraitDirection:'40代半ば。細めの顔、やや長い鼻、灰褐色〜焦げ茶の髪と少し寝癖、眼鏡も可。痩せ型、茶・灰・深緑の服。古書店主らしい静けさと生活感。胸上、紙色の余白と低い琥珀の灯り。',palette:{paper:'#e1dcc9',wash:'#9ba99e',cloth:'#526b65',hair:'#625b50',ink:'#454d47'},motif:'book'},
 boatworker:{mood:'実直で気さく',impression:'潮風に慣れた、頼もしい働き手',intro:'縄と荷物を扱う、港の働き手。',portraitDirection:'30代後半〜40代前半。日焼けした肌、骨太、短めの暗褐色髪、薄い無精ひげ。青灰・革・生成りの仕事着と縄。港で働く現場の人として、勇者や美形を強調しない。半身、港の水を背景へ薄く溶かす。',palette:{paper:'#ded9c4',wash:'#91a5a7',cloth:'#5a7277',hair:'#615349',ink:'#424d50'},motif:'rope'},
 starmaker:{mood:'落ち着いた好奇心',impression:'手仕事と星を、同じ眼差しで見る',intro:'天体と機械に親しむ、天球儀店の店主。',portraitDirection:'ネリッサ。30代前半〜半ば。知的だがシャープすぎず、静かだが冷たくない。長い黒髪ストレート、深紺の服、控えめな真鍮の天体モチーフ。天体・機械に親しむ店主で、星占い師ではない。フィンの髪型・雰囲気とは区別する。胸上、細い筆跡と星図の余白、作業灯の反射。',palette:{paper:'#e4dcc2',wash:'#97a8a0',cloth:'#35485f',hair:'#514b45',ink:'#444f47'},motif:'circle'},
 greenBard:{mood:'穏やかで自然体',impression:'全体の調和に宿る、静かな美しさ',intro:'緑の外套と木の弦楽器を持つ旅人。',portraitDirection:'胸上〜半身。若く見える男性、中性的で静かな美しさ。顔の特徴を誇張せず、柔らかな線と余白、深緑の外套で全体の調和を作る。木の弦楽器は控えめ。特別な光やオーラは使わない。',palette:{paper:'#e2dfcb',wash:'#9fae90',cloth:'#416651',hair:'#665a4b',ink:'#465144'},motif:'strings'}
};
export function portraitProfile(character){
 const defaults={paper:'#e4ddc9',wash:'#a3ae98',cloth:'#63765f',hair:'#685c4c',ink:'#4d5145'},direction=profiles[character.id]??{},existing=character.visualProfile??{};
 return {displayName:character.name,role:character.role,subjectKind:'person',...direction,...existing,palette:{...defaults,...direction.palette,...existing.palette}};
}
