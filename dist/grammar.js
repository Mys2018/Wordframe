const grammarExercise = (id, sentence, cue, answers, explanation) => ({ id, sentence, cue, answers, explanation });

const grammarTopics = [
  {
    id: 'present-simple',
    group: 'Времена',
    title: 'Present Simple',
    level: 'A1',
    rule: 'Используй Present Simple для привычек, расписаний и фактов. С he, she и it добавляй к глаголу -s или -es. После do и does глагол остаётся в начальной форме.',
    examples: [
      ['Mia works from home on Fridays.', 'По пятницам Мия работает из дома.'],
      ["He doesn't drink coffee.", 'Он не пьёт кофе.']
    ],
    exercises: [
      grammarExercise('present-simple-walk', 'Nina usually ___ to work.', 'walk', ['walks'], 'Usually указывает на привычку. С Nina добавляем -s.'),
      grammarExercise('present-simple-watch', 'Tom ___ TV every evening.', 'watch', ['watches'], 'С Tom у глагола watch появляется окончание -es.'),
      grammarExercise('present-simple-like', 'I ___ very sweet tea.', 'not / like', ['do not like', "don't like"], 'После I ставим do not и начальную форму like.')
    ]
  },
  {
    id: 'present-continuous',
    group: 'Времена',
    title: 'Present Continuous',
    level: 'A1',
    rule: 'Используй am, is или are и форму на -ing, чтобы описать действие в процессе сейчас. Эта форма также подходит для временной ситуации, которая длится в текущий период.',
    examples: [
      ["I'm making dinner right now.", 'Я сейчас готовлю ужин.'],
      ["They're staying with friends this week.", 'На этой неделе они живут у друзей.']
    ],
    exercises: [
      grammarExercise('present-continuous-sleep', 'Please be quiet. The baby ___ right now.', 'sleep', ['is sleeping'], 'Речь о действии в момент разговора. С the baby ставим is.'),
      grammarExercise('present-continuous-wait', 'Look! They ___ for us outside.', 'wait', ['are waiting'], 'Ожидание происходит сейчас. С they ставим are waiting.'),
      grammarExercise('present-continuous-write', 'I ___ an email at the moment.', 'write', ['am writing'], 'С I нужна форма am. Перед -ing у write выпадает конечная e.')
    ]
  },
  {
    id: 'present-perfect',
    group: 'Времена',
    title: 'Present Perfect',
    level: 'A2',
    rule: 'Ставь have или has и третью форму глагола, когда сообщаешь об опыте до настоящего момента или о результате, который важен сейчас. С указанием законченного времени вроде yesterday используй Past Simple.',
    examples: [
      ["I've lost my key. Can you let me in?", 'Я потерял ключ. Можешь меня впустить?'],
      ['Have you ever tried sushi?', 'Ты когда-нибудь пробовал суши?']
    ],
    exercises: [
      grammarExercise('present-perfect-see', 'This is the best film I ___ so far this year.', 'see', ['have seen'], 'So far this year означает «с начала года до сих пор». Третья форма see — seen.'),
      grammarExercise('present-perfect-know', 'I first met Leo in 2018 and I ___ him ever since.', 'know', ['have known'], 'Знакомство началось раньше и продолжается сейчас. Для know употребляется форма have known.'),
      grammarExercise('present-perfect-break', 'Someone ___ the window. There is glass all over the floor.', 'break', ['has broken'], 'По осколкам виден результат сейчас. С someone нужны has и третья форма broken.')
    ]
  },
  {
    id: 'present-perfect-continuous',
    group: 'Времена',
    title: 'Present Perfect Continuous',
    level: 'B1',
    rule: 'Форма have или has been + глагол на -ing подчёркивает процесс до настоящего момента. Она часто показывает, как долго идёт действие, или объясняет видимые последствия недавно закончившегося действия.',
    examples: [
      ["I've been looking for my glasses all morning.", 'Я всё утро ищу очки.'],
      ['Your hands are dirty. Have you been gardening?', 'У тебя грязные руки. Ты работал в саду?']
    ],
    exercises: [
      grammarExercise('present-perfect-continuous-study', 'You ___ for hours and you are still at your desk. Take a break!', 'study', ['have been studying'], 'Подчёркиваем, что учёба длится уже несколько часов и ещё продолжается.'),
      grammarExercise('present-perfect-continuous-run', 'Why are you out of breath? — I ___.', 'run', ['have been running'], 'Действие до настоящего момента объясняет, почему говорящий запыхался.'),
      grammarExercise('present-perfect-continuous-rain', 'It ___ since dawn, and it is still raining now.', 'rain', ['has been raining'], 'Дождь начался на рассвете и всё ещё идёт. С it ставим has been raining.')
    ]
  },
  {
    id: 'past-simple',
    group: 'Времена',
    title: 'Past Simple',
    level: 'A1',
    rule: 'Используй Past Simple для завершённых действий в прошлом, особенно когда известно, когда они произошли. У правильных глаголов добавляй -ed, а у неправильных используй вторую форму. После did нужна начальная форма.',
    examples: [
      ['We visited the museum yesterday.', 'Мы вчера посетили музей.'],
      ['Did you find your keys?', 'Ты нашёл свои ключи?']
    ],
    exercises: [
      grammarExercise('past-simple-go', 'We ___ to the cinema last Saturday.', 'go', ['went'], 'Last Saturday указывает на завершённое прошлое. Вторая форма go — went.'),
      grammarExercise('past-simple-stop', 'The rain ___ an hour ago.', 'stop', ['stopped'], 'An hour ago требует Past Simple. В stopped удваивается p.'),
      grammarExercise('past-simple-hear', 'I ___ the phone last night.', 'not / hear', ['did not hear', "didn't hear"], 'В отрицании прошедшее время выражает did. Hear остаётся в начальной форме.')
    ]
  },
  {
    id: 'past-continuous',
    group: 'Времена',
    title: 'Past Continuous',
    level: 'A2',
    rule: 'Ставь was или were и глагол на -ing, чтобы показать, что действие шло в определённый момент в прошлом. Эта форма часто задаёт фон для короткого события в Past Simple.',
    examples: [
      ['I was reading when you called.', 'Я читал, когда ты позвонил.'],
      ['At six, they were still having dinner.', 'В шесть они всё ещё ужинали.']
    ],
    exercises: [
      grammarExercise('past-continuous-sleep', 'I ___ when the alarm went off.', 'sleep', ['was sleeping'], 'К моменту, когда сработал будильник, сон уже продолжался. С I ставим was.'),
      grammarExercise('past-continuous-play', 'When I opened the door, the children ___ chess.', 'play', ['were playing'], 'К моменту открытия двери дети уже играли. С the children ставим were.'),
      grammarExercise('past-continuous-listen', 'He missed the announcement because he ___ to the radio at the time.', 'not / listen', ['was not listening', "wasn't listening"], 'At the time указывает на тот момент в прошлом. С he ставим was not listening.')
    ]
  },
  {
    id: 'past-perfect',
    group: 'Времена',
    title: 'Past Perfect',
    level: 'B1',
    rule: 'Ставь had и третью форму глагола, чтобы показать, что одно действие уже произошло к другому моменту в прошлом. Позднее событие обычно стоит в Past Simple.',
    examples: [
      ['When I got to the station, the train had already left.', 'Когда я пришёл на вокзал, поезд уже ушёл.'],
      ["The shop was closed because the owner had gone home.", 'Магазин был закрыт, потому что владелец ушёл домой.']
    ],
    exercises: [
      grammarExercise('past-perfect-eat', 'By the time I arrived, everyone ___ dinner and was ready to leave.', 'already / eat', ['had already eaten'], 'Ужин закончился до моего прихода. Третья форма eat — eaten.'),
      grammarExercise('past-perfect-see', 'It was her first time at the sea. Until then, she ___ the ocean.', 'never / see', ['had never seen'], 'Until then задаёт точку в прошлом. До неё у героини не было такого опыта.'),
      grammarExercise('past-perfect-forget', 'When we reached the hotel, I realised that I ___ my passport at home.', 'forget', ['had forgotten'], 'Сначала паспорт остался дома, а позже я это заметил. Используем had forgotten.')
    ]
  },
  {
    id: 'past-perfect-continuous',
    group: 'Времена',
    title: 'Past Perfect Continuous',
    level: 'B2',
    rule: 'Форма had been + глагол на -ing показывает, как долго действие шло до определённого момента в прошлом. Она также помогает объяснить состояние человека или вещи в этот момент.',
    examples: [
      ['The ground was wet because it had been raining all night.', 'Земля была мокрой, потому что всю ночь шёл дождь.'],
      ["I'd been waiting for an hour when the bus finally came.", 'Я ждал уже час, когда автобус наконец приехал.']
    ],
    exercises: [
      grammarExercise('past-perfect-continuous-work', 'Before she finally rested, she ___ without a break for ten hours.', 'work', ['had been working'], 'Десятичасовая работа шла до того, как она наконец отдохнула.'),
      grammarExercise('past-perfect-continuous-rain', 'The ground was soaked because it ___ all night and was still raining at sunrise.', 'rain', ['had been raining'], 'Подчёркиваем длительность дождя до указанного момента в прошлом.'),
      grammarExercise('past-perfect-continuous-drive', 'He was exhausted. He ___ non-stop since five that morning.', 'drive', ['had been driving'], 'Длительный процесс до того момента объясняет, почему он был уставшим.')
    ]
  },
  {
    id: 'future-simple',
    group: 'Времена',
    title: 'Future Simple',
    level: 'A2',
    rule: 'После will или will not ставь начальную форму глагола. Will подходит для предсказания, обещания, предложения помощи и решения, принятого в момент разговора.',
    examples: [
      ["I'll open the window.", 'Я открою окно.'],
      ["I think the exam will be easy.", 'Думаю, экзамен будет лёгким.']
    ],
    exercises: [
      grammarExercise('future-simple-carry', "That box looks heavy. Don't worry, I ___ it for you.", 'carry', ['will carry', "'ll carry"], 'Говорящий предлагает помощь в момент разговора. Здесь подходит will carry.'),
      grammarExercise('future-simple-be', 'I think the weather ___ better tomorrow.', 'be', ['will be'], 'I think вводит прогноз. После will используем начальную форму be.'),
      grammarExercise('future-simple-tell', 'I promise I ___ anyone.', 'not / tell', ['will not tell', "won't tell"], 'В обещании с отрицанием используем will not или его сокращение won’t.')
    ]
  },
  {
    id: 'future-continuous',
    group: 'Времена',
    title: 'Future Continuous',
    level: 'B1',
    rule: 'Форма will be + глагол на -ing подчёркивает действие, которое будет происходить в определённый момент в будущем.',
    examples: [
      ["This time tomorrow, we'll be flying to Rome.", 'Завтра в это время мы будем лететь в Рим.'],
      ["Don't call at nine. I'll be driving.", 'Не звони в девять. Я буду за рулём.']
    ],
    exercises: [
      grammarExercise('future-continuous-sleep', 'Please be quiet when you get home at midnight. I ___ then.', 'sleep', ['will be sleeping', "'ll be sleeping"], 'Когда собеседник вернётся, сон уже будет идти.'),
      grammarExercise('future-continuous-work', 'At three tomorrow, we ___ on the report together.', 'work', ['will be working', "'ll be working"], 'At three tomorrow задаёт момент, в который работа будет в процессе.'),
      grammarExercise('future-continuous-drive', 'Do not call us at ten. We ___ through the mountains then.', 'drive', ['will be driving', "'ll be driving"], 'В десять поездка будет в процессе. Ставим will be driving.')
    ]
  },
  {
    id: 'future-perfect',
    group: 'Времена',
    title: 'Future Perfect',
    level: 'B2',
    rule: 'Используй will have и третью форму глагола, когда смотришь из будущего на результат, который уже будет достигнут к определённому сроку. Срок часто вводит by.',
    examples: [
      ["By Friday, we'll have sent all the invitations.", 'К пятнице мы уже разошлём все приглашения.'],
      ['By the time you get here, the shop will have closed.', 'К тому моменту, как ты сюда доберёшься, магазин уже закроется.']
    ],
    exercises: [
      grammarExercise('future-perfect-finish', 'By the time you get home, we ___ dinner and washed the dishes.', 'finish', ['will have finished', "'ll have finished"], 'К моменту возвращения оба действия завершатся. Will have относится и к finished, и к washed.'),
      grammarExercise('future-perfect-read', 'At the end of the month, I ___ all twelve chapters.', 'read', ['will have read', "'ll have read"], 'Речь о количестве уже прочитанных глав к концу месяца.'),
      grammarExercise('future-perfect-save', 'By December, they ___ enough money to move.', 'save', ['will have saved', "'ll have saved"], 'К декабрю накопленная сумма уже будет достаточной для переезда.')
    ]
  },
  {
    id: 'future-perfect-continuous',
    group: 'Времена',
    title: 'Future Perfect Continuous',
    level: 'B2',
    rule: 'Форма will have been + глагол на -ing показывает, сколько времени будет длиться процесс к выбранному моменту в будущем. Здесь важна длительность действия.',
    examples: [
      ["By July, I'll have been working here for five years.", 'К июлю исполнится пять лет с тех пор, как я здесь работаю.'],
      ['At noon, they will have been hiking for six hours.', 'К полудню они будут идти уже шесть часов.']
    ],
    exercises: [
      grammarExercise('future-perfect-continuous-study', 'By the time the library closes, she ___ for six hours straight.', 'study', ['will have been studying', "'ll have been studying"], 'Отсчитываем шесть часов непрерывной учёбы к моменту закрытия библиотеки.'),
      grammarExercise('future-perfect-continuous-wait', 'When the next bus comes, we ___ in the cold for an hour.', 'wait', ['will have been waiting', "'ll have been waiting"], 'Продолжительность ожидания измеряется к будущему моменту приезда автобуса.'),
      grammarExercise('future-perfect-continuous-drive', 'At noon, I ___ without a break for four hours.', 'drive', ['will have been driving', "'ll have been driving"], 'К полудню вождение будет длиться уже четыре часа.')
    ]
  },
  {
    id: 'zero-conditional',
    group: 'Условные предложения',
    title: 'Zero Conditional',
    level: 'A2',
    rule: 'Для закономерностей, привычных результатов и фактов ставь Present Simple в обеих частях. If можно заменить на when, если имеется в виду «всякий раз, когда».',
    examples: [
      ['If water freezes, it turns into ice.', 'Когда вода замерзает, она превращается в лёд.'],
      ['If I work late, I take the bus home.', 'Когда я работаю допоздна, я еду домой на автобусе.']
    ],
    exercises: [
      grammarExercise('zero-conditional-melt', 'If you heat ice, it ___.', 'melt', ['melts'], 'Это общий факт. С it ставим melts в Present Simple.'),
      grammarExercise('zero-conditional-turn', 'Whenever this room gets hot, the fan ___ on automatically.', 'turn', ['turns'], 'Whenever обозначает привычный результат. У глагола появляется окончание -s.'),
      grammarExercise('zero-conditional-get', 'If plants ___ enough light, they often grow slowly.', 'not / get', ['do not get', "don't get"], 'Это закономерность. С plants в отрицании используем do not get.')
    ]
  },
  {
    id: 'first-conditional',
    group: 'Условные предложения',
    title: 'First Conditional',
    level: 'A2',
    rule: 'Для реального будущего условия обычно ставь Present Simple после if и will + начальную форму в части с результатом. If обозначает условие, о котором ещё неизвестно, сбудется ли оно.',
    examples: [
      ["If it rains tomorrow, we'll stay home.", 'Если завтра пойдёт дождь, мы останемся дома.'],
      ["You'll miss the bus if you don't hurry.", 'Ты опоздаешь на автобус, если не поторопишься.']
    ],
    exercises: [
      grammarExercise('first-conditional-finish', "If she ___ early tomorrow, we'll have dinner together.", 'finish', ['finishes'], 'В части с if достаточно Present Simple, хотя речь о завтрашнем дне.'),
      grammarExercise('first-conditional-win', 'If our team ___ tonight, they will play in the final.', 'win', ['wins'], 'С our team в этой фразе используем глагол в единственном числе. После if ставим Present Simple.'),
      grammarExercise('first-conditional-hurry', "If you ___, you'll miss the last train tonight.", 'not / hurry', ['do not hurry', "don't hurry"], 'Условие стоит в Present Simple. Для you отрицание образуется через do not.')
    ]
  },
  {
    id: 'second-conditional',
    group: 'Условные предложения',
    title: 'Second Conditional',
    level: 'B1',
    rule: 'Для воображаемой ситуации сейчас или в будущем ставь Past Simple после if и would + начальную форму в части с результатом. В условной конструкции с be форма were подходит для всех лиц.',
    examples: [
      ["If I had more time, I'd learn to play the guitar.", 'Если бы у меня было больше времени, я бы научился играть на гитаре.'],
      ["If I were you, I'd take the earlier train.", 'На твоём месте я бы поехал на поезде пораньше.']
    ],
    exercises: [
      grammarExercise('second-conditional-afford', 'If we ___ a bigger flat, we would move this year.', 'can / afford', ['could afford'], 'После if форма could показывает воображаемую возможность.'),
      grammarExercise('second-conditional-buy', 'If I had enough money, I ___ that painting.', 'buy', ['would buy', "'d buy"], 'Воображаемый результат образуется через would + buy.'),
      grammarExercise('second-conditional-be', 'If she ___ here now, she would know what to do.', 'be', ['were', 'was'], 'Were — нейтральный учебный вариант для воображаемого условия. Was тоже встречается в разговорной речи.')
    ]
  },
  {
    id: 'third-conditional',
    group: 'Условные предложения',
    title: 'Third Conditional',
    level: 'B2',
    rule: 'Для воображаемой альтернативы в прошлом ставь had + третью форму после if. Результат выражай через would have + третью форму глагола.',
    examples: [
      ['If we had left earlier, we would have caught the train.', 'Если бы мы вышли раньше, то успели бы на поезд.'],
      ["I would've stayed if I'd known you were coming.", 'Я бы остался, если бы знал, что ты придёшь.']
    ],
    exercises: [
      grammarExercise('third-conditional-check', 'If I ___ the address, I would have found the building yesterday.', 'check', ['had checked', "'d checked"], 'В воображаемом условии про вчера используем had checked.'),
      grammarExercise('third-conditional-avoid', 'If we had taken the other road, we ___ the traffic jam.', 'avoid', ['would have avoided', "would've avoided", "'d have avoided"], 'Прошлый результат, который не случился, выражается через would have avoided.'),
      grammarExercise('third-conditional-forget', "If she ___ her umbrella, she wouldn't have got wet on the way home.", 'not / forget', ['had not forgotten', "hadn't forgotten"], 'Условие в прошлом ставим в отрицательную форму Past Perfect.')
    ]
  },
  {
    id: 'mixed-conditional',
    group: 'Условные предложения',
    title: 'Mixed Conditional',
    level: 'B2',
    rule: 'В смешанном условном разные части относятся к разному времени. Если прошлая причина даёт воображаемый результат сейчас, ставь had + третью форму после if и would + начальную форму в результате. Для воображаемой нынешней причины с прошлым результатом используй Past Simple и would have + третью форму.',
    examples: [
      ["If I'd gone to bed earlier, I wouldn't be so tired now.", 'Если бы я раньше лёг спать, сейчас я бы так не устал.'],
      ["If I were more organised, I wouldn't have missed yesterday's deadline.", 'Если бы я был организованнее, то не пропустил бы вчерашний срок.']
    ],
    exercises: [
      grammarExercise('mixed-conditional-live', 'If I had accepted that job last year, I ___ in Berlin now.', 'live', ['would live', 'would be living', "'d live", "'d be living"], 'Условие относится к прошлому году, а воображаемый результат — к настоящему.'),
      grammarExercise('mixed-conditional-book', 'If we ___ a room yesterday, we would have somewhere to stay tonight.', 'book', ['had booked', "'d booked"], 'Вчерашнее условие требует Past Perfect. Результат относится к сегодняшнему вечеру.'),
      grammarExercise('mixed-conditional-leave', 'If Maya were less forgetful, she ___ her phone on the bus yesterday.', 'not / leave', ['would not have left', "wouldn't have left", "'d not have left"], 'Рассеянность описывает нынешнее качество Майи. Результат относится к вчерашнему дню.')
    ]
  },
  {
    id: 'articles',
    group: 'Другие правила',
    title: 'Артикли a, an и the',
    level: 'A1',
    rule: 'С исчисляемым существительным в единственном числе a или an обозначает один предмет без уточнения. Выбор между a и an зависит от следующего звука. The указывает на конкретный предмет, который собеседник может определить.',
    examples: [
      ['I bought a book. The book was for my sister.', 'Я купил книгу. Эта книга была для моей сестры.'],
      ['It took an hour to get there.', 'Дорога туда заняла час.']
    ],
    exercises: [
      grammarExercise('articles-umbrella', "It's raining and I don't have ___ umbrella.", 'a / an / the', ['an'], 'Umbrella начинается с гласного звука и обозначает любой зонт.'),
      grammarExercise('articles-university', 'Lea wants to study at ___ university. She has not chosen one yet.', 'a / an / the', ['a'], 'University начинается со звука /j/, как слово yes. Конкретный университет ещё не выбран.'),
      grammarExercise('articles-ticket', 'I had two things in my pocket, a ticket and a coin. I gave ___ ticket to the driver.', 'a / an / the', ['the'], 'Имеется в виду билет, который уже упомянут в предыдущем предложении.')
    ]
  },
  {
    id: 'comparison',
    group: 'Другие правила',
    title: 'Сравнительная и превосходная степень',
    level: 'A2',
    rule: 'К коротким прилагательным обычно добавляй -er для сравнения и -est для превосходной степени. С длинными прилагательными используй more и most. У некоторых слов есть особые формы, например good → better → best.',
    examples: [
      ['This bag is lighter than mine.', 'Эта сумка легче моей.'],
      ['That was the most interesting part.', 'Это была самая интересная часть.']
    ],
    exercises: [
      grammarExercise('comparison-heavy', 'The blue suitcase is ___ than the red one.', 'heavy', ['heavier'], 'Than указывает на сравнение. В конце heavy буква y меняется на i перед -er.'),
      grammarExercise('comparison-expensive', 'This is the ___ restaurant in town.', 'expensive', ['most expensive'], 'Для превосходной степени длинного прилагательного ставим most. The уже дано.'),
      grammarExercise('comparison-good', 'Your score today is ___ than yesterday.', 'good', ['better'], 'У good особая сравнительная форма better.')
    ]
  },
  {
    id: 'passive-voice',
    group: 'Другие правила',
    title: 'Пассивный залог',
    level: 'B1',
    rule: 'Используй пассив, когда в центре внимания объект действия. Поставь be в нужное время и добавь третью форму глагола. При необходимости укажи исполнителя через by.',
    examples: [
      ['The bridge was built in 1960.', 'Мост построили в 1960 году.'],
      ['The rooms are cleaned every morning.', 'Комнаты убирают каждое утро.']
    ],
    exercises: [
      grammarExercise('passive-voice-make', 'This table ___ by a local carpenter in 2010.', 'make', ['was made'], 'Стол — объект действия. In 2010 требует was, а третья форма make — made.'),
      grammarExercise('passive-voice-check', 'The emergency exits ___ by the safety team every Monday.', 'check', ['are checked'], 'Действие регулярно выполняют над exits. Множественное число требует are checked.'),
      grammarExercise('passive-voice-translate', 'The book ___ from Spanish into three languages so far.', 'translate', ['has been translated'], 'So far связывает результат с настоящим. Для пассива нужна форма has been translated.')
    ]
  },
  {
    id: 'reported-speech',
    group: 'Другие правила',
    title: 'Косвенная речь',
    level: 'B1',
    rule: 'Когда передаёшь чьи-то слова о завершённой ситуации через said или told, время обычно сдвигается назад. Present Simple становится Past Simple, will — would. В косвенном вопросе используй порядок слов обычного утверждения.',
    examples: [
      ['“I am cold,” he said. → He said he was cold.', '«Мне холодно», — сказал он. → Он сказал, что ему холодно.'],
      ['“Where do you live?” → She asked where I lived.', '«Где ты живёшь?» → Она спросила, где я живу.']
    ],
    exercises: [
      grammarExercise('reported-speech-feel', '“I feel tired,” Dan said yesterday. Dan said that he ___ tired that day.', 'feel', ['felt'], 'That day отсылает ко вчерашней ситуации. Present Simple в прямой речи стал Past Simple.'),
      grammarExercise('reported-speech-call', '“I will call later,” she said. She said she ___ later.', 'will / call', ['would call', "'d call"], 'Will в сообщении о прошлых словах можно передать через would.'),
      grammarExercise('reported-speech-wait', '“Why are you waiting?” he asked me yesterday. He asked why I ___.', 'wait', ['was waiting'], 'После why ставим порядок слов утверждения. Are waiting из прямой речи стало was waiting.')
    ]
  },
  {
    id: 'modal-verbs',
    group: 'Другие правила',
    title: 'Модальные глаголы',
    level: 'A2',
    rule: 'После can, could, should и must ставь начальную форму смыслового глагола без to. Can выражает способность или разрешение, should даёт совет, а must говорит о необходимости.',
    examples: [
      ['He can swim very well.', 'Он очень хорошо плавает.'],
      ['You should call a doctor.', 'Тебе стоит позвонить врачу.']
    ],
    exercises: [
      grammarExercise('modal-verbs-read', 'My little sister can ___ in English now.', 'read', ['read'], 'После can нужна начальная форма без to.'),
      grammarExercise('modal-verbs-rest', "You've been working all day. You ___ for a bit.", 'should / rest', ['should rest'], 'Для совета ставим should + rest.'),
      grammarExercise('modal-verbs-show', 'At this gate, every passenger must ___ a ticket.', 'show', ['show'], 'После must глагол остаётся в начальной форме даже с every passenger.')
    ]
  },
  {
    id: 'gerund-infinitive',
    group: 'Другие правила',
    title: 'Герундий и инфинитив',
    level: 'B1',
    rule: 'Форма следующего глагола зависит от первого. После enjoy, avoid и finish используй форму на -ing. После decide, hope и want обычно ставь to + начальную форму.',
    examples: [
      ['I enjoy cooking for friends.', 'Мне нравится готовить для друзей.'],
      ['They decided to wait outside.', 'Они решили подождать снаружи.']
    ],
    exercises: [
      grammarExercise('gerund-infinitive-walk', 'We enjoy ___ by the river in the evening.', 'walk', ['walking'], 'После enjoy употребляется форма на -ing.'),
      grammarExercise('gerund-infinitive-leave', 'After the meeting, they decided ___ early.', 'leave', ['to leave'], 'После decide ставим инфинитив с to.'),
      grammarExercise('gerund-infinitive-check', 'I finished ___ the last page just before lunch.', 'check', ['checking'], 'После finish ставим глагол на -ing.')
    ]
  },
  {
    id: 'quantifiers',
    group: 'Другие правила',
    title: 'Количество с much, many, few и little',
    level: 'A2',
    rule: 'Many и few используются с исчисляемыми существительными во множественном числе. Much и little используются с неисчисляемыми. A few и a little означают «немного», а few и little часто подчёркивают нехватку.',
    examples: [
      ['How much milk is left?', 'Сколько молока осталось?'],
      ['A few people stayed after class.', 'Несколько человек остались после занятия.']
    ],
    exercises: [
      grammarExercise('quantifiers-how-much', 'How ___ water do you drink in a day?', 'much / many', ['much'], 'Water в этом предложении неисчисляемое, поэтому подходит much.'),
      grammarExercise('quantifiers-how-many', 'How ___ books would you like to borrow?', 'much / many', ['many'], 'Books — исчисляемое существительное во множественном числе.'),
      grammarExercise('quantifiers-a-little', 'I have enough time to help. I just need ___ patience.', 'a little / a few', ['a little'], 'Patience неисчисляемое. A little передаёт значение «немного терпения».')
    ]
  },
  {
    id: 'relative-clauses',
    group: 'Другие правила',
    title: 'Определительные придаточные',
    level: 'B1',
    rule: 'Who относится к человеку, which — к предмету или животному, whose показывает принадлежность. В придаточном, которое помогает определить, о ком или о чём речь, who и which часто можно заменить на that. В придаточном между запятыми that не используется.',
    examples: [
      ['The woman who lives next door is a vet.', 'Женщина, которая живёт по соседству, работает ветеринаром.'],
      ['The jacket, which I bought online, fits perfectly.', 'Куртка, которую я купил онлайн, сидит идеально.']
    ],
    exercises: [
      grammarExercise('relative-clauses-who', 'The person ___ answered the phone was very helpful.', 'who / which / that', ['who', 'that'], 'Person обозначает человека. Здесь придаточное без запятых, поэтому возможны who и that.'),
      grammarExercise('relative-clauses-which', "My phone, ___ I bought last month, has already broken.", 'who / which / that', ['which'], 'Телефон — предмет. Придаточное стоит между запятыми, поэтому нужна форма which.'),
      grammarExercise('relative-clauses-whose', 'I spoke to the neighbour ___ cat was sitting in our garden.', 'whose / who / which', ['whose'], 'Whose показывает, что кот принадлежит соседу.')
    ]
  }
];
