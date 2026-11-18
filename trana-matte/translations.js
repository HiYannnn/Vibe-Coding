const translations = {
  sv: {
    title: 'Rymdäventyr',
    camp: 'Träna multiplikation',
    hero: 'Mot multiplikationsplaneten!',
    intro: 'Samla en stjärna för varje rätt svar. Svara på 10 frågor och se hur lång tid det tog.',
    ready: 'Redo för start',
    nickname: 'Ditt smeknamn',
    placeholder: 'Till exempel Alex',
    choose: 'Vilken tabell vill du öva på?',
    start: '🚀 Starta utmaningen',
    records: 'Övningshistorik',
    storage: 'Historiken sparas i den här webbläsaren. Du kan exportera en kopia.',
    readError: 'Webbläsaren kan inte läsa övningshistoriken just nu.',
    empty: 'När du har spelat en omgång visas resultatet här.',
    name: 'Smeknamn',
    time: 'Tid',
    score: 'Rätt svar',
    scope: 'Tabell',
    finished: 'Slutförd',
    total: 'Antal frågor',
    seconds: 'Tid (sekunder)',
    language: 'Språk',
    progress: 'Framsteg',
    next: 'Nästa fråga →',
    seeResult: 'Visa resultat →',
    quit: 'Avsluta omgången',
    confirmQuit: 'Vill du avsluta omgången? Oavslutade omgångar sparas inte.',
    again: 'Spela igen ↻',
    mixed: 'Blandat · 1–10',
    table: n => `${n}:ans tabell`,
    question: (n, total) => `Fråga ${n} av ${total}`,
    correct: 'Rätt! Du fick en stjärna.',
    incorrect: n => `Rätt svar är ${n}.`,
    enterName: 'Skriv ditt smeknamn.',
    saved: 'Resultatet har sparats i övningshistoriken.',
    saveError: 'Resultatet kunde inte sparas. Du kan exportera det som CSV innan du stänger sidan.',
    perfect: '🏆 Du fick tio stjärnor!',
    complete: '🚀 Utmaningen är klar!',
    export: 'Exportera CSV',
    filename: 'multiplikation-ovningshistorik.csv',
    duration: (minutes, seconds) => `${minutes ? minutes + ' min ' : ''}${seconds} sek`
  },
  en: {
    title: 'Space Adventure',
    camp: 'Multiplication practice',
    hero: 'Blast off to Multiplication Planet!',
    intro: 'Earn a star for every correct answer. Finish 10 questions and see how long it took.',
    ready: 'Ready for liftoff',
    nickname: 'Your nickname',
    placeholder: 'For example, Alex',
    choose: 'Which times table will you practice?',
    start: '🚀 Start challenge',
    records: 'Practice history',
    storage: 'History is saved in this browser. You can export a copy.',
    readError: 'The browser can’t read your practice history right now.',
    empty: 'Your results will appear here after your first round.',
    name: 'Nickname',
    time: 'Time',
    score: 'Correct',
    scope: 'Times table',
    finished: 'Completed',
    total: 'Total questions',
    seconds: 'Time (seconds)',
    language: 'Language',
    progress: 'Progress',
    next: 'Next question →',
    seeResult: 'See results →',
    quit: 'End round',
    confirmQuit: 'End this round? Unfinished rounds won’t be saved.',
    again: 'Play again ↻',
    mixed: 'Mixed · 1–10',
    table: n => `${n} times table`,
    question: (n, total) => `Question ${n} of ${total}`,
    correct: 'Correct! You earned a star.',
    incorrect: n => `The correct answer is ${n}.`,
    enterName: 'Enter your nickname.',
    saved: 'Your result was saved to your practice history.',
    saveError: 'Your result couldn’t be saved. You can export it as CSV before closing this page.',
    perfect: '🏆 You earned ten stars!',
    complete: '🚀 Challenge complete!',
    export: 'Export CSV',
    filename: 'multiplication-practice-history.csv',
    duration: (minutes, seconds) => `${minutes ? minutes + ' min ' : ''}${seconds} sec`
  },
  'zh-CN': {
    title: '太空冒险',
    camp: '乘法训练营',
    hero: '向乘法星球出发！',
    intro: '每答对一题收集一颗星。完成 10 题，看看这次用了多久。',
    ready: '准备起飞',
    nickname: '你的昵称',
    placeholder: '例如：小宇',
    choose: '练习哪一表？',
    start: '🚀 开始挑战',
    records: '练习记录',
    storage: '记录保存在当前浏览器，可导出备份。',
    readError: '浏览器暂时无法读取练习记录。',
    empty: '完成第一轮挑战后，这里就会显示成绩。',
    name: '昵称',
    time: '用时',
    score: '答对',
    scope: '练习范围',
    finished: '完成时间',
    total: '总题数',
    seconds: '用时（秒）',
    language: '语言',
    progress: '答题进度',
    next: '下一题 →',
    seeResult: '查看成绩 →',
    quit: '结束本轮',
    confirmQuit: '要结束这轮挑战吗？未完成的练习不会计入记录。',
    again: '再玩一轮 ↻',
    mixed: '混合练习 · 1–10',
    table: n => n + ' 的乘法表',
    question: (n, total) => `第 ${n} / ${total} 题`,
    correct: '答对了！收集到一颗星。',
    incorrect: n => '正确答案是 ' + n + '。',
    enterName: '请输入昵称。',
    saved: '这轮成绩已保存到练习记录。',
    saveError: '浏览器无法保存这轮成绩。关闭页面前可以导出 CSV。',
    perfect: '🏆 十颗星到手！',
    complete: '🚀 挑战完成！',
    export: '导出 CSV',
    filename: '乘法练习记录.csv',
    duration: (minutes, seconds) => `${minutes ? minutes + ' 分 ' : ''}${seconds} 秒`
  }
};

const adventureCopy = {
  sv: {
    bonusTitle:'Blixtbanan', bonusRules:'Skriv svaren på 12 uppgifter från tabellerna 6–12. Minst 11 rätt på 45 sekunder.',
    bonusLocked:'🔒 Besegra stjärnväktaren för att låsa upp banan.', bonusReady:'🏅 Belöning: Blixtmedaljen', bonusEarned:'🏅 Blixtmedaljen vunnen',
    bonusStart:'Starta blixtbanan', bonusWon:'🏅 Du vann Blixtmedaljen!', bonusRepeat:'Blixtbanan klar igen!',
    brand:'Rymdäventyr', adventureTitle:'Rymdäventyr', adventureIntro:'Besök fyra världar, samla stjärnor och möt stjärnväktaren.',
    explore:'Öppna stjärnkartan ↓', map:'Stjärnkarta', free:'Fri träning', freeDesc:'Välj en tabell och öva i din egen takt.', practiceStart:'Öva',
    mapPrompt:'Skriv ditt smeknamn för att se dina upplåsta världar.', mapProgress:(name,n,total)=>`${name} · ${n} av ${total} världar klarade`,
    current:'Redo', locked:'🔒 Låst', cleared:'✓ Klarad', launch:'Spela →', replay:'Spela igen →',
    back:'Till stjärnkartan', retry:'Försök igen ↻', nextWorld:'Nästa värld →', fire:'Skicka svar', answer:'Ditt svar', answerPrompt:'Skriv ett heltal.',
    goal:(score,total)=>`Mål: ${score} rätt av ${total}`, remaining:n=>`⏳ ${n}`, lives:n=>`Sköldar: ${n}`, missing:'Hitta talet som saknas.',
    outcome:'Resultat', lost:'Försök igen', passed:'Klarad', timeUp:'Tiden tog slut!', shieldsLost:'Sköldarna tog slut!',
    unlocked:name=>`${name} är nu upplåst!`, allCleared:'Du har klarat alla fyra världar!', missionWon:'🌟 Uppdraget är klart!',
    missionLost:'Gör ett nytt försök!', roundScore:(score,total,answered)=>`${score}/${total} rätt (${answered} besvarade)`,
    worlds:[
      ['Månbasen','Starta raketen med 4 rätt av 6 från tabellerna 1–5.'],
      ['Asteroidbältet','Få 6 rätt av 8 från tabellerna 2–7 på 60 sekunder. Skriv svaren själv.'],
      ['Kristallvalvet','Hitta talet som saknas i minst 6 av 8 uppgifter från tabellerna 4–9.'],
      ['Stjärnväktaren','Få minst 8 rätt av 10. Varje fel kostar en av dina tre sköldar.']
    ]
  },
  en: {
    bonusTitle:'Lightning Run', bonusRules:'Type your answers to 12 problems from the 6–12 times tables. Get at least 11 right in 45 seconds.',
    bonusLocked:'🔒 Defeat the Star Guardian to unlock this run.', bonusReady:'🏅 Reward: Lightning Medal', bonusEarned:'🏅 Lightning Medal earned',
    bonusStart:'Start Lightning Run', bonusWon:'🏅 You earned the Lightning Medal!', bonusRepeat:'Lightning Run cleared again!',
    brand:'Space Adventure', adventureTitle:'Space Adventure', adventureIntro:'Visit four worlds, collect stars, and face the Star Guardian.',
    explore:'Open the star map ↓', map:'Star map', free:'Free practice', freeDesc:'Pick a times table and practice at your own pace.', practiceStart:'Practice',
    mapPrompt:'Enter your nickname to see your unlocked worlds.', mapProgress:(name,n,total)=>`${name} · ${n} of ${total} worlds cleared`,
    current:'Ready', locked:'🔒 Locked', cleared:'✓ Cleared', launch:'Play →', replay:'Replay →',
    back:'Back to star map', retry:'Try again ↻', nextWorld:'Next world →', fire:'Submit answer', answer:'Your answer', answerPrompt:'Enter a whole number.',
    goal:(score,total)=>`Goal: ${score} of ${total} correct`, remaining:n=>`⏳ ${n}`, lives:n=>`Shields: ${n}`, missing:'Find the missing number.',
    outcome:'Result', lost:'Try again', passed:'Cleared', timeUp:'Time ran out!', shieldsLost:'You ran out of shields!',
    unlocked:name=>`${name} is now unlocked!`, allCleared:'You cleared all four worlds!', missionWon:'🌟 Mission cleared!',
    missionLost:'Give it another try!', roundScore:(score,total,answered)=>`${score}/${total} correct (${answered} answered)`,
    worlds:[
      ['Moon Base','Launch the rocket with 4 of 6 correct from tables 1–5.'],
      ['Asteroid Belt','Type your answers. Get 6 of 8 right from tables 2–7 in 60 seconds.'],
      ['Crystal Vault','Find the missing number in at least 6 of 8 problems from tables 4–9.'],
      ['Star Guardian','Get 8 of 10 right. Every mistake costs one of your three shields.']
    ]
  },
  'zh-CN': {
    bonusTitle:'闪电赛道', bonusRules:'练习 6–12 的乘法表。45 秒内自己输入 12 题的答案，至少答对 11 题。',
    bonusLocked:'🔒 击败星际守卫后解锁。', bonusReady:'🏅 奖励：闪电勋章', bonusEarned:'🏅 已获得闪电勋章',
    bonusStart:'开始闪电挑战', bonusWon:'🏅 你赢得了闪电勋章！', bonusRepeat:'再次闯过闪电赛道！',
    brand:'太空冒险', adventureTitle:'太空冒险', adventureIntro:'探索四个星球，收集星星，挑战星际守卫。',
    explore:'打开星图 ↓', map:'星图', free:'自由练习', freeDesc:'选一张乘法表，按自己的节奏练习。', practiceStart:'开始练习',
    mapPrompt:'输入昵称，查看你已解锁的关卡。', mapProgress:(name,n,total)=>`${name} · 已通过 ${n} / ${total} 关`,
    current:'可以挑战', locked:'🔒 未解锁', cleared:'✓ 已通关', launch:'开始 →', replay:'重玩 →',
    back:'返回星图', retry:'再试一次 ↻', nextWorld:'前往下一关 →', fire:'提交答案', answer:'你的答案', answerPrompt:'请输入一个整数。',
    goal:(score,total)=>`目标：${total} 题至少答对 ${score} 题`, remaining:n=>`⏳ ${n}`, lives:n=>`护盾：${n}`, missing:'找出缺失的数字。',
    outcome:'结果', lost:'未通关', passed:'已通关', timeUp:'时间到了！', shieldsLost:'护盾用完了！',
    unlocked:name=>`已解锁「${name}」！`, allCleared:'四个关卡全部通过！', missionWon:'🌟 闯关成功！',
    missionLost:'再挑战一次吧！', roundScore:(score,total,answered)=>`答对 ${score} / ${total}（已答 ${answered} 题）`,
    worlds:[
      ['月球基地','练习 1–5 的乘法表，6 题至少答对 4 题，启动飞船。'],
      ['小行星带','60 秒内自己输入答案，练习 2–7 的乘法表，8 题至少答对 6 题。'],
      ['水晶宝库','练习 4–9 的乘法表，8 题至少答对 6 题，补全缺失的因数。'],
      ['星际守卫','10 题至少答对 8 题。你有 3 个护盾，每答错一次消耗一个。']
    ]
  }
};

const portalCopy = {
  sv: {
    portalTitle:'Träna Matte',
    subjectsTitle:'Välj räknesätt', addition:'Addition', subtraction:'Subtraktion',
    multiplication:'Multiplikation', division:'Division', comingSoon:'Kommer snart',
    playMultiplication:'Spela Rymdäventyr →'
  },
  en: {
    portalTitle:'Practice Math',
    subjectsTitle:'Choose an operation', addition:'Addition', subtraction:'Subtraction',
    multiplication:'Multiplication', division:'Division', comingSoon:'Coming soon',
    playMultiplication:'Play Space Adventure →'
  },
  'zh-CN': {
    portalTitle:'练习数学',
    subjectsTitle:'选择运算', addition:'加法', subtraction:'减法',
    multiplication:'乘法', division:'除法', comingSoon:'即将推出',
    playMultiplication:'开始太空冒险 →'
  }
};

const crosswordCopy = {
  sv: {
    medalTitle:'Korsordsmedaljer', bronze:'Brons', silver:'Silver', gold:'Guld', medalEarned:'Vunnen', medalLocked:'Inte vunnen', medalPrompt:'Skriv ditt smeknamn för att se dina medaljer.', medalProgress:n=>n===3?'🏆 Alla tre medaljer är dina!':n+' av 3 medaljer', medalWon:name=>'Ny medalj: '+name+'!',
    crossTitle:'Mattekorsord', crossIntro:'Fyll i tal så att alla vågräta och lodräta beräkningar stämmer.',
    crossPlay:'Spela mattekorsord →', difficulty:'Svårighetsgrad', easy:'Lätt', medium:'Medel', hard:'Svår',
    easyInfo:'Ental med addition och subtraktion. Tre tomma rutor.',
    mediumInfo:'Addition och subtraktion med större tal, plus multiplikation. Fyra tomma rutor.',
    hardInfo:'Alla fyra räknesätten. Tal upp till tre siffror och fem tomma rutor.',
    newPuzzle:'Starta korsord', another:'Nytt korsord', check:'Kontrollera', emptyBoxes:'Fyll i alla tomma rutor.',
    tryAgain:'Rätta de markerade rutorna och försök igen.', solved:'🏅 Korsordet är löst!',
    crossSaveError:'Resultatet kunde inte sparas i den här webbläsaren.',
    square:(row,col)=>`Tom ruta, rad ${row}, kolumn ${col}`
  },
  en: {
    medalTitle:'Crossword medals', bronze:'Bronze', silver:'Silver', gold:'Gold', medalEarned:'Earned', medalLocked:'Not earned yet', medalPrompt:'Enter your nickname to see your medals.', medalProgress:n=>n===3?'🏆 You collected all three medals!':n+' of 3 medals', medalWon:name=>'New medal: '+name+'!',
    crossTitle:'Math Crosswords', crossIntro:'Fill in the numbers to make every equation across and down work.',
    crossPlay:'Play Math Crosswords →', difficulty:'Difficulty', easy:'Easy', medium:'Medium', hard:'Hard',
    easyInfo:'Single-digit addition and subtraction. Three blanks.',
    mediumInfo:'Larger addition and subtraction, plus multiplication. Four blanks.',
    hardInfo:'All four operations, numbers up to three digits, and five blanks.',
    newPuzzle:'Start puzzle', another:'New puzzle', check:'Check answers', emptyBoxes:'Fill in every blank.',
    tryAgain:'Fix the marked squares and try again.', solved:'🏅 Crossword solved!',
    crossSaveError:'Your result could not be saved in this browser.',
    square:(row,col)=>`Blank, row ${row}, column ${col}`
  },
  'zh-CN': {
    medalTitle:'填字勋章', bronze:'铜牌', silver:'银牌', gold:'金牌', medalEarned:'已获得', medalLocked:'待解锁', medalPrompt:'输入昵称，查看你的勋章。', medalProgress:n=>n===3?'🏆 三枚勋章全部集齐！':'已收集 '+n+' / 3 枚勋章', medalWon:name=>'获得新勋章：'+name+'！',
    crossTitle:'数学填字', crossIntro:'把数字填进空格，让横向和纵向算式都成立。',
    crossPlay:'玩数学填字 →', difficulty:'难度', easy:'简单', medium:'进阶', hard:'困难',
    easyInfo:'一位数加减，填 3 个空格。',
    mediumInfo:'较大数字的加减与乘法，填 4 个空格。',
    hardInfo:'加减乘除混合，数字最多三位，填 5 个空格。',
    newPuzzle:'开始填字', another:'换一题', check:'检查答案', emptyBoxes:'请填完所有空格。',
    tryAgain:'改一改标出的格子，再试一次。', solved:'🏅 填字挑战成功！',
    crossSaveError:'这次成绩无法保存在当前浏览器。',
    square:(row,col)=>`空格，第 ${row} 行，第 ${col} 列`
  }
};

const leaderboardCopy = {
  sv:{
    rankEyebrow:'Stjärnornas liga',rankTitle:'Topplista',rankIntro:'Varje övning tar dig längre. Dina poäng samlas för alltid.',
    rankAll:'Alla upptäckare',rankRefresh:'Uppdatera',rankPosition:'Plats',rankPoints:'Poäng',rankRounds:'Omgångar',
    rankRules:'Så får du poäng',rankRuleAnswers:'Addition, subtraktion och multiplikation: 1 poäng per rätt svar.',
    rankRuleWorld:'Första gången du klarar en värld: 10 bonuspoäng.',
    rankRuleBonus:'Klarad Blixtbana: 20 bonuspoäng varje gång.',
    rankRuleCrossword:'Löst mattekorsord: 5 poäng på lätt, 10 på medel, 15 på svår.',
    rankLoading:'Hämtar stjärnpoäng…',rankEmpty:'Bli den första upptäckaren! Slutför en övning för att ta plats här.',
    rankError:'Topplistan kunde inte hämtas. Försök uppdatera igen.',rankLifetime:'Totala poäng',
    rankPlay:'Börja ett äventyr →'
  },
  en:{
    rankEyebrow:'League of stars',rankTitle:'Leaderboard',rankIntro:'Every practice takes you further. Your points keep adding up.',
    rankAll:'All explorers',rankRefresh:'Refresh',rankPosition:'Rank',rankPoints:'Points',rankRounds:'Rounds',
    rankRules:'How to earn points',rankRuleAnswers:'Addition, subtraction and multiplication: 1 point per correct answer.',
    rankRuleWorld:'First clear of each world: 10 bonus points.',
    rankRuleBonus:'Clear Lightning Run: 20 bonus points every time.',
    rankRuleCrossword:'Solved crossword: 5 points for easy, 10 for medium, 15 for hard.',
    rankLoading:'Collecting star points…',rankEmpty:'Be the first explorer! Complete a practice round to appear here.',
    rankError:'Could not load the leaderboard. Try refreshing.',rankLifetime:'Lifetime points',
    rankPlay:'Start an adventure →'
  },
  'zh-CN':{
    rankEyebrow:'星际探险联盟',rankTitle:'星光排行榜',rankIntro:'每一次练习，都让你走得更远。总积分持续累积。',
    rankAll:'全体探险家',rankRefresh:'刷新',rankPosition:'名次',rankPoints:'积分',rankRounds:'练习次数',
    rankRules:'如何获得积分',rankRuleAnswers:'加法、减法和乘法练习：每答对一题得 1 分。',
    rankRuleWorld:'每个星球首次通关，额外获得 10 分。',
    rankRuleBonus:'闪电赛道每次挑战成功，额外获得 20 分。',
    rankRuleCrossword:'数学填字完成：简单 5 分、进阶 10 分、困难 15 分。',
    rankLoading:'正在收集星光积分…',rankEmpty:'成为第一位探险家！完成一次练习，就能登上排行榜。',
    rankError:'暂时无法加载排行榜，请点击刷新重试。',rankLifetime:'累计总积分',
    rankPlay:'开启冒险 →'
  }
};

const additionCopy = {
 sv:{
  addTitle:'Energistationen',addIntro:'Ladda rymdstationen med addition. Välj två, tre eller fyra siffror.',
  digits2:'Tvåsiffriga tal',digits3:'Tresiffriga tal',digits4:'Fyrsiffriga tal',addMode:'Spelläge',
  addPractice:'Öva i egen takt',addChallenge:'Tidsutmaning',addStart:'Starta uppdraget →',
  addRules:(seconds,timed)=>'10 uppgifter med tiotalsövergång. 1 poäng per rätt svar.'+(timed?' Minst 8 rätt inom '+seconds+' sekunder ger en energimedalj.':' Din tid mäts utan tidsgräns.'),
  addWon:'🏅 Energimedaljen är din!',addDone:'Uppdraget är klart!',addRetry:'Försök igen och ladda mer energi!',
  addValid:'Skriv ett heltal.',addBadge:'Medaljen finns sparad i din övningshistorik.',addPoints:n=>n+' poäng till topplistan när resultatet har synkats.'
 },
 en:{
  addTitle:'Energy Station',addIntro:'Power the space station with addition. Choose two, three or four digits.',
  digits2:'Two-digit numbers',digits3:'Three-digit numbers',digits4:'Four-digit numbers',addMode:'Mode',
  addPractice:'Practice at your own pace',addChallenge:'Timed challenge',addStart:'Start mission →',
  addRules:(seconds,timed)=>'10 problems including carrying. 1 point per correct answer.'+(timed?' Get at least 8 right in '+seconds+' seconds to earn an energy medal.':' Your time is tracked without a time limit.'),
  addWon:'🏅 Energy medal earned!',addDone:'Mission complete!',addRetry:'Try again to collect more energy!',
  addValid:'Enter a whole number.',addBadge:'Your medal is recorded in practice history.',addPoints:n=>n+' points for the leaderboard when the result syncs.'
 },
 'zh-CN':{
  addTitle:'太空能源站',addIntro:'用加法为太空站充能，选择两位数、三位数或四位数。',
  digits2:'两位数加法',digits3:'三位数加法',digits4:'四位数加法',addMode:'模式',
  addPractice:'自由练习',addChallenge:'限时挑战',addStart:'启动任务 →',
  addRules:(seconds,timed)=>'每轮 10 题，包含进位，每答对一题获得 1 积分。'+(timed?'在 '+seconds+' 秒内答完，至少答对 8 题赢得能源勋章。':'计时记录用时，可以按自己的节奏完成。'),
  addWon:'🏅 赢得能源勋章！',addDone:'任务完成！',addRetry:'再挑战一次，为能源站充能！',
  addValid:'请输入一个整数。',addBadge:'能源勋章已记录在这轮练习成绩中。',addPoints:n=>'同步成功后，排行榜增加 '+n+' 积分。'
 }
};

const subtractionCopy = {
 sv:{
  addTitle:'Månverkstaden',addIntro:'Reparera månbasen med subtraktion. Välj två, tre eller fyra siffror.',
  addRules:(seconds,timed)=>'10 uppgifter med växling. Svaren är noll eller positiva. 1 poäng per rätt svar.'+(timed?' Minst 8 rätt inom '+seconds+' sekunder ger en månmedalj.':' Din tid mäts utan tidsgräns.'),
  addWon:'🏅 Månmedaljen är din!',addDone:'Månbasen är reparerad!',addRetry:'Försök igen och hjälp månbasen!',
  addBadge:'Månmedaljen finns sparad i din övningshistorik.'
 },
 en:{
  addTitle:'Moon Workshop',addIntro:'Repair the moon base with subtraction. Choose two, three or four digits.',
  addRules:(seconds,timed)=>'10 problems including borrowing. Answers are zero or positive. 1 point per correct answer.'+(timed?' Get at least 8 right in '+seconds+' seconds to earn a moon medal.':' Your time is tracked without a time limit.'),
  addWon:'🏅 Moon medal earned!',addDone:'Moon mission complete!',addRetry:'Try again and help the moon base!',
  addBadge:'Your moon medal is recorded in practice history.'
 },
 'zh-CN':{
  addTitle:'月球维修站',addIntro:'用减法修复月球基地，选择两位数、三位数或四位数。',
  addRules:(seconds,timed)=>'每轮 10 题，包含退位，答案为零或正数。每答对一题获得 1 积分。'+(timed?'在 '+seconds+' 秒内答完，至少答对 8 题赢得月球勋章。':'计时记录用时，可以按自己的节奏完成。'),
  addWon:'🏅 赢得月球勋章！',addDone:'月球任务完成！',addRetry:'再挑战一次，帮助修复月球基地！',
  addBadge:'月球勋章已记录在这轮练习成绩中。'
 }
};
