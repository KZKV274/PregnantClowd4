/* ===========================
   BABY JOURNEY — app.js
   Full PWA Logic
=========================== */

'use strict';

// ===== ГЕНЕРАЦИЯ ИКОНОК ЧЕРЕЗ CANVAS (без PNG файлов) =====
function generateIconDataURL(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Градиентный фон
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#fce4ec');
  grad.addColorStop(0.5, '#f8bbd0');
  grad.addColorStop(1, '#fce4ec');

  // Скруглённый прямоугольник
  const r = size * 0.22;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.arcTo(size, 0, size, r, r);
  ctx.lineTo(size, size - r);
  ctx.arcTo(size, size, size - r, size, r);
  ctx.lineTo(r, size);
  ctx.arcTo(0, size, 0, size - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Эмодзи цветок
  ctx.font = (size * 0.58) + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌸', size / 2, size / 2 + size * 0.02);

  return canvas.toDataURL('image/png');
}

// Инжектим иконки в <head> и обновляем manifest
function injectPWAIcons() {
  const icon192 = generateIconDataURL(192);
  const icon512 = generateIconDataURL(512);

  // apple-touch-icon
  const appleIcon = document.getElementById('appleTouchIcon');
  if (appleIcon) appleIcon.href = icon192;

  // favicon
  const favicon = document.getElementById('faviconIcon');
  if (favicon) favicon.href = icon192;

  // Пересоздаём manifest с иконками через Blob URL
  try {
    const manifestData = {
      name: 'Baby Journey',
      short_name: 'Baby Journey',
      description: 'Дневник беременности — каждый день вместе',
      start_url: '.',
      scope: '.',
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: '#fce4ec',
      theme_color: '#f5a7c7',
      prefer_related_applications: false,
      lang: 'ru',
      id: 'baby-journey-v3',
      icons: [
        { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    };
    const blob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) manifestLink.href = manifestURL;
  } catch (e) {
    // Если Blob URL не работает — manifest.json используется как есть
  }
}

// Запускаем сразу
injectPWAIcons();

// ===== WEEKLY DATA =====
const WEEKLY_DATA = {
  4:  { fruit:'🫐', fruitName:'черника', length:0.4, weight:0.5, dev:'Эмбрион только что имплантировался. Закладывается нервная трубка — будущий мозг и спинной мозг.', tags:['нервная трубка','имплантация'], mom:'Гормоны меняются. Тест уже может быть положительным.', tip:'Начни принимать фолиевую кислоту, если ещё не начала.' },
  5:  { fruit:'🌱', fruitName:'кунжутное семя', length:1.3, weight:0.8, dev:'Формируется сердце — оно начинает биться уже сейчас! Закладываются почки и печень.', tags:['сердцебиение','почки'], mom:'Может появиться лёгкая тошнота и усталость.', tip:'Пей имбирный чай — помогает от тошноты.' },
  6:  { fruit:'🟢', fruitName:'горошина', length:0.6, weight:1, dev:'Появляются маленькие ручки и ножки — пока в виде почек. Формируется лицо: глаза и нос.', tags:['ручки','ножки','лицо'], mom:'Грудь становится чувствительнее. Частое мочеиспускание — это норма.', tip:'Избегай стресса — он влияет на гормоны.' },
  7:  { fruit:'🫐', fruitName:'черника', length:1, weight:1.5, dev:'Мозг развивается стремительно. Пальчики начинают формироваться. Сердечко бьётся 150 раз в минуту!', tags:['мозг','пальчики'], mom:'Токсикоз может усилиться. Это временно и совершенно нормально.', tip:'Ешь небольшими порциями каждые 2–3 часа.' },
  8:  { fruit:'🍒', fruitName:'малина', length:1.6, weight:2, dev:'Все основные органы уже заложены. Малыш начинает двигаться — хотя ты ещё не чувствуешь.', tags:['органы','движения'], mom:'Матка начинает увеличиваться. Талия слегка округляется.', tip:'Самое время записаться в женскую консультацию.' },
  9:  { fruit:'🍇', fruitName:'виноград', length:2.3, weight:4, dev:'Формируются веки. Появляются ногтевые пластины. Кишечник перемещается из пуповины в живот.', tags:['веки','ногти'], mom:'Гормоны на пике. Настроение может меняться очень быстро.', tip:'Дыхательные упражнения помогают при тошноте.' },
  10: { fruit:'🍓', fruitName:'клубника', length:3.1, weight:10, dev:'Малыш официально становится плодом! Все органы сформированы и начинают работать.', tags:['плод','все органы'], mom:'Риск выкидыша значительно снижается после 10 недель.', tip:'Делай йогу для беременных — это помогает спине.' },
  11: { fruit:'🍈', fruitName:'инжир', length:4.1, weight:16, dev:'Лицо выглядит почти как у новорождённого. Малыш уже зевает и глотает.', tags:['зевает','глотает'], mom:'Скоро 1 скрининг — важное УЗИ 11–14 недель.', tip:'Обсуди с врачом скрининг и анализы.' },
  12: { fruit:'🍋', fruitName:'лайм', length:5.4, weight:28, dev:'Рефлексы активны: малыш сжимает кулачки. Почки производят мочу. Мозг развивается быстро.', tags:['рефлексы','почки работают'], mom:'Конец первого триместра! Риски снижаются, многие женщины чувствуют себя лучше.', tip:'Самое время поделиться новостью с близкими 🎉' },
  13: { fruit:'🍋', fruitName:'лимон', length:7.4, weight:45, dev:'Отпечатки пальцев уже уникальны. Формируются голосовые связки. Кишечник начинает работу.', tags:['отпечатки','голосовые связки'], mom:'Начало 2 триместра. Тошнота обычно отступает.', tip:'Начни носить поддерживающее бельё.' },
  14: { fruit:'🍊', fruitName:'персик', length:8.7, weight:70, dev:'Малыш делает мимику! Появляются брови и пушковые волосы — лануго. Щитовидная железа работает.', tags:['мимика','лануго'], mom:'Энергия возвращается. Многие мамы чувствуют подъём.', tip:'Увлажняй кожу живота для профилактики растяжек.' },
  15: { fruit:'🍊', fruitName:'апельсин', length:10.1, weight:100, dev:'Ушки полностью сформированы. Малыш уже слышит твой голос! Кости твердеют.', tags:['слух','кости твердеют'], mom:'Начни разговаривать с малышом — он слышит!', tip:'Читай вслух или пой колыбельные.' },
  16: { fruit:'🥑', fruitName:'авокадо', length:11.6, weight:135, dev:'Малыш тренирует дыхание, вдыхая и выдыхая амниотическую жидкость. Глаза двигаются.', tags:['дыхание','движение глаз'], mom:'Скоро почувствуешь первые шевеления — лёгкое порхание.', tip:'Начни вести дневник шевелений.' },
  17: { fruit:'🍐', fruitName:'груша', length:13, weight:175, dev:'Жировая ткань начинает накапливаться. Малыш активно двигается и переворачивается.', tags:['жировая ткань','активные движения'], mom:'Животик становится заметным. Центр тяжести смещается.', tip:'Спи на левом боку — улучшает кровообращение.' },
  18: { fruit:'🫑', fruitName:'болгарский перец', length:14.2, weight:220, dev:'Малыш слышит твоё сердце, голос, внешние звуки. Формируются черты лица.', tags:['слух развит','черты лица'], mom:'Может появиться боль в спине — это от смещения позвоночника.', tip:'Пренатальный массаж — хорошая идея.' },
  19: { fruit:'🥭', fruitName:'манго', length:15.3, weight:270, dev:'Мозг специализируется: зоны обоняния, слуха, зрения, осязания уже работают.', tags:['мозг специализируется'], mom:'2 скрининг — УЗИ на 18–21 неделе. Важный осмотр!', tip:'На скрининге можно узнать пол малыша.' },
  20: { fruit:'🍌', fruitName:'банан', length:16.4, weight:320, dev:'Половина пути! Малыш покрывается первородной смазкой — верниксом. Уже может различать сладкое.', tags:['вернекс','вкус'], mom:'Экватор беременности! Ты прошла половину пути 🎉', tip:'Сфотографируй животик — это важный момент.' },
  21: { fruit:'🥕', fruitName:'морковь', length:25.6, weight:370, dev:'Малыш активно двигается по расписанию: есть циклы сна и бодрствования. Брови уже видны.', tags:['режим сна','брови'], mom:'Шевеления становятся отчётливее с каждым днём.', tip:'Фиксируй активность малыша — это важно.' },
  22: { fruit:'🌽', fruitName:'початок кукурузы', length:27.8, weight:430, dev:'Сенсорное развитие на пике. Малыш реагирует на прикосновения к животу, свет и звук.', tags:['реакция на свет','тактильность'], mom:'Животик растёт быстро. Могут появиться растяжки.', tip:'Масло от растяжек наноси после душа.' },
  23: { fruit:'🍆', fruitName:'баклажан', length:28.9, weight:500, dev:'Кожа малыша красноватая и морщинистая — жира пока мало. Ногти полностью выросли.', tags:['кожа','ногти'], mom:'Могут появиться отёки ног — норма при беременности.', tip:'Поднимай ноги в конце дня и пей достаточно воды.' },
  24: { fruit:'🌽', fruitName:'кукуруза', length:30, weight:600, dev:'Лёгкие начинают производить сурфактант — он нужен для дыхания после рождения. Важный этап!', tags:['лёгкие','сурфактант'], mom:'Дно матки на уровне пупка. Животик уже очень заметен.', tip:'Посети курсы подготовки к родам.' },
  25: { fruit:'🥦', fruitName:'брокколи', length:34.6, weight:700, dev:'Волосы на голове растут! Малыш реагирует на твой голос и узнаёт его. Руки полностью развиты.', tags:['волосы','узнаёт голос'], mom:'Могут появиться изжога и одышка — матка давит на диафрагму.', tip:'Ешь маленькими порциями, не ложись сразу после еды.' },
  26: { fruit:'🥬', fruitName:'кочан салата', length:35.6, weight:800, dev:'Глаза открываются впервые! Малыш начинает моргать. Мозговые волны схожи с волнами новорождённого.', tags:['глаза открываются','моргание'], mom:'Тест на сахарный диабет беременных на 24–28 неделе.', tip:'Запишись на курсы подготовки к родам.' },
  27: { fruit:'🥦', fruitName:'цветная капуста', length:36.6, weight:900, dev:'Малыш спит 60–90% времени — как и новорождённый. Иммунная система развивается.', tags:['иммунитет','режим сна'], mom:'Конец второго триместра. Готовься к 3 триместру.', tip:'Пора начать собирать сумку в роддом.' },
  28: { fruit:'🍆', fruitName:'баклажан', length:37.6, weight:1005, dev:'Начало третьего триместра! Мозг развивается невероятно быстро. Жировые запасы накапливаются.', tags:['3 триместр','мозг растёт'], mom:'Визиты к врачу теперь каждые 2 недели.', tip:'Начни считать шевеления ежедневно — не менее 10 за 2 часа.' },
  29: { fruit:'🎃', fruitName:'тыква', length:38.6, weight:1150, dev:'Кости полностью сформированы, но ещё мягкие. Малыш может видеть свет через стенку живота.', tags:['кости','видит свет'], mom:'Спать становится неудобно — подушка для беременных поможет.', tip:'Спи с подушкой между колен.' },
  30: { fruit:'🫚', fruitName:'кочан капусты', length:39.9, weight:1300, dev:'Малыш накапливает жир под кожей. Мозг образует извилины. Ноготки выросли до края пальцев.', tags:['жир','извилины мозга'], mom:'Одышка усиливается по мере роста матки.', tip:'Дыши глубоко — пренатальная йога очень помогает.' },
  31: { fruit:'🥥', fruitName:'кокос', length:41.1, weight:1500, dev:'Слои мозга усложняются. Все органы чувств работают. Малыш может различать день и ночь по уровню света.', tags:['мозг усложняется','день и ночь'], mom:'Ложные схватки Брэкстона-Хикса — нормальная тренировка матки.', tip:'Не паникуй из-за ложных схваток — это репетиция.' },
  32: { fruit:'🌿', fruitName:'нопал', length:42.4, weight:1700, dev:'Ногти на руках и ногах полностью сформированы. Кожа становится менее морщинистой. Малыш принимает позицию.', tags:['ногти','позиция'], mom:'Предлежание малыша определяется на этом сроке.', tip:'Упражнения для тазового дна очень важны сейчас.' },
  33: { fruit:'🍍', fruitName:'ананас', length:43.7, weight:1900, dev:'Череп малыша мягкий и гибкий для родов. Лёгкие почти готовы к самостоятельному дыханию.', tags:['лёгкие готовы','мягкий череп'], mom:'Головные боли, усталость, отёки — всё это нормально.', tip:'Отдыхай как можно больше и не стесняйся просить помощи.' },
  34: { fruit:'🎃', fruitName:'дыня', length:45, weight:2100, dev:'Центральная нервная система почти созрела. Иммунная система укрепляется. Жировой слой продолжает расти.', tags:['нервная система','иммунитет'], mom:'Малыш давит на таз — могут появиться боли в лоне.', tip:'Попробуй бандаж для беременных.' },
  35: { fruit:'🥥', fruitName:'кокос', length:46.2, weight:2380, dev:'Почки полностью развиты. Печень обрабатывает продукты жизнедеятельности. Кожа розовая, гладкая.', tags:['почки','печень'], mom:'Опускание животика предвещает близкие роды.', tip:'Подготовь список телефонов: врач, роддом, партнёр.' },
  36: { fruit:'🎃', fruitName:'папайя', length:47.4, weight:2620, dev:'Малыш полностью занимает матку. Движения медленнее, но ощутимее. Лануго исчезает.', tags:['без лануго','занимает матку'], mom:'Декретный отпуск! Отдыхай, гуляй, готовься.', tip:'Упакуй сумку в роддом прямо сейчас.' },
  37: { fruit:'🧅', fruitName:'дыня дыня', length:48.6, weight:2860, dev:'Малыш считается доношенным! Мозг и лёгкие продолжают дозревать. Он готов к жизни вне утробы.', tags:['доношен','готов к рождению'], mom:'Пробки из слизи, предвестники — роды скоро!', tip:'Изучи признаки настоящих схваток.' },
  38: { fruit:'🎃', fruitName:'тыква маленькая', length:49.8, weight:3100, dev:'Нервная система совершенствуется. Малыш продолжает накапливать жир. Голова опустилась в таз.', tags:['головное предлежание'], mom:'Нерегулярные схватки могут начаться в любой момент.', tip:'Держи телефон и сумку всегда наготове.' },
  39: { fruit:'🍉', fruitName:'арбуз', length:50.7, weight:3300, dev:'Всё готово! Малыш продолжает накапливать жир для терморегуляции. Кожа гладкая и нежная.', tags:['финальная подготовка'], mom:'Любой день может стать Днём! Доверяй своему телу.', tip:'Больше ходи — это стимулирует начало родов.' },
  40: { fruit:'🍉', fruitName:'арбуз', length:51.2, weight:3400, dev:'Малыш готов встретить мир! В среднем новорождённые весят 3,2–3,8 кг и имеют рост 50–51 см.', tags:['готов к рождению','полный срок'], mom:'ПДР! Но только 5% детей рождаются точно в срок — не переживай.', tip:'Роды — это скоро. Доверяй врачам и своему телу 💕' },
  41: { fruit:'🍉', fruitName:'арбуз', length:51.5, weight:3600, dev:'Перехаживание — норма. Малыш всё ещё развивается. Врач будет наблюдать тебя чаще.', tags:['перехаживание'], mom:'Врач может предложить стимуляцию родов.', tip:'Не переживай — скоро всё начнётся!' },
  42: { fruit:'🍉', fruitName:'арбуз', length:51.8, weight:3700, dev:'Малыш здоров и ждёт своего часа. Врачи контролируют ситуацию.', tags:['контроль врача'], mom:'На сроке 42 недели обычно предлагают родовозбуждение.', tip:'Доверяй медикам — они знают, что делают.' }
};

const QUOTES = [
  'Ты носишь в себе целый мир 🌍',
  'Каждый день — это маленькое чудо',
  'Твоё тело знает, что делает',
  'Любовь начинается задолго до рождения',
  'Самое сложное — это первый крик. И самое прекрасное.',
  'Ты уже лучшая мама в мире',
  'Малыш слышит тебя. Говори с ним.',
  'Этот момент больше никогда не повторится. Береги его.',
  'Беременность — это сверхсила',
  'Ты не одна в этом путешествии 💕'
];

const TIPS = [
  'Пей воду маленькими глотками в течение дня',
  'Прогулки 20–30 минут улучшают настроение и сон',
  'Засыпай под успокаивающую музыку',
  'Правильная поза при сидении — поддержка спины',
  'Омега-3 важны для мозга малыша',
  'Разговаривай с малышом — он тебя слышит',
  'Дыхательные техники помогут в родах',
  'Обнимайся как можно больше — окситоцин полезен',
  'Принимай витамин D — особенно зимой',
  'Записывай свои чувства — потом будет приятно перечитать'
];

const GIRL_NAMES = [
  { name: 'Алиса', meaning: 'благородная' },
  { name: 'София', meaning: 'мудрость' },
  { name: 'Ева', meaning: 'жизнь' },
  { name: 'Мила', meaning: 'милая, дорогая' },
  { name: 'Анна', meaning: 'благодать' },
  { name: 'Вера', meaning: 'вера' },
  { name: 'Надя', meaning: 'надежда' },
  { name: 'Лиза', meaning: 'посвящённая Богу' },
  { name: 'Маша', meaning: 'горькая, любимая' },
  { name: 'Полина', meaning: 'маленькая' },
  { name: 'Дарья', meaning: 'владеющая добром' },
  { name: 'Ирина', meaning: 'мир' },
  { name: 'Злата', meaning: 'золотая' },
  { name: 'Арина', meaning: 'мирная' },
  { name: 'Таисия', meaning: 'посвящённая Изиде' },
  { name: 'Василиса', meaning: 'царственная' },
  { name: 'Ника', meaning: 'победа' },
  { name: 'Стефания', meaning: 'венец' },
  { name: 'Лада', meaning: 'порядок, красота' },
  { name: 'Злата', meaning: 'золото' }
];

const BOY_NAMES = [
  { name: 'Александр', meaning: 'защитник людей' },
  { name: 'Максим', meaning: 'величайший' },
  { name: 'Дмитрий', meaning: 'посвящённый Деметре' },
  { name: 'Иван', meaning: 'Бог милостив' },
  { name: 'Артём', meaning: 'здоровый, невредимый' },
  { name: 'Лев', meaning: 'лев' },
  { name: 'Матвей', meaning: 'дар Бога' },
  { name: 'Роман', meaning: 'римлянин' },
  { name: 'Никита', meaning: 'победитель' },
  { name: 'Фёдор', meaning: 'дар Бога' },
  { name: 'Тимофей', meaning: 'чтящий Бога' },
  { name: 'Андрей', meaning: 'мужественный' },
  { name: 'Степан', meaning: 'венец' },
  { name: 'Кирилл', meaning: 'господин' },
  { name: 'Егор', meaning: 'земледелец' },
  { name: 'Глеб', meaning: 'любимец Бога' },
  { name: 'Мирон', meaning: 'благовонный' },
  { name: 'Тихон', meaning: 'удачливый' },
  { name: 'Арсений', meaning: 'мужественный' },
  { name: 'Платон', meaning: 'широкоплечий' }
];

const BAG_ITEMS = {
  '📋 Документы': [
    'Паспорт', 'Полис ОМС', 'Обменная карта беременной',
    'Направление на госпитализацию', 'Родовой сертификат',
    'СНИЛС', 'Договор с роддомом'
  ],
  '👶 Для малыша': [
    'Боди с длинным рукавом (3 шт.)', 'Ползунки (3 шт.)',
    'Шапочки хлопковые (2 шт.)', 'Носочки (3 пары)',
    'Пелёнки фланелевые (5 шт.)', 'Подгузники новорождённый (1 пачка)',
    'Влажные салфетки', 'Конверт/одеяло на выписку'
  ],
  '👩 Для мамы': [
    'Ночная рубашка для родов', 'Халат хлопковый',
    'Тапочки резиновые', 'Прокладки послеродовые (2 пачки)',
    'Бюстгальтер для кормления (2 шт.)', 'Трусы послеродовые',
    'Зубная щётка и паста', 'Шампунь и мыло', 'Телефон + зарядка'
  ],
  '🍼 Питание': [
    'Вода (1–2 литра)', 'Лёгкие перекусы',
    'Смесь (если не планируешь кормить грудью)'
  ]
};

// ===== STATE =====
let STATE = {
  setup: false,
  conceptionDate: null, // дата начала беременности (от 0 недель)
  babyName: '',
  babyGender: 'unknown',
  darkMode: false,
  waterToday: 0,
  waterDate: '',
  kicks: {},
  contractions: [],
  contrActive: false,
  contrStart: null,
  notes: [],
  photos: [],
  weights: [],
  bagItems: {},
  nameFavorites: [],
  currentNameGender: 'girl',
  currentName: null,
  currentPage: 'pageHome',
  onbSlide: 0
};

// ===== STORAGE =====
function saveState() {
  try { localStorage.setItem('bjState', JSON.stringify(STATE)); } catch(e) {}
}
function loadState() {
  try {
    const s = localStorage.getItem('bjState');
    if (s) STATE = { ...STATE, ...JSON.parse(s) };
  } catch(e) {}
}

// ===== PREGNANCY CALC =====
function calcConceptionFromUzi(uziDateStr, weeks, days) {
  const uzi = new Date(uziDateStr);
  const totalDays = weeks * 7 + days;
  const conception = new Date(uzi);
  conception.setDate(conception.getDate() - totalDays);
  return conception;
}

function calcConceptionFromLmp(lmpDateStr) {
  return new Date(lmpDateStr);
}

function calcConceptionFromManual(dateStr, weeks, days) {
  const d = new Date(dateStr);
  const totalDays = weeks * 7 + days;
  const conception = new Date(d);
  conception.setDate(conception.getDate() - totalDays);
  return conception;
}

function getCurrentPregnancy() {
  if (!STATE.conceptionDate) return null;
  const now = new Date();
  const conception = new Date(STATE.conceptionDate);
  const diffMs = now - conception;
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const edd = new Date(conception);
  edd.setDate(edd.getDate() + 280);
  const daysLeft = Math.max(0, Math.ceil((edd - now) / (1000 * 60 * 60 * 24)));
  const totalMonths = Math.floor(totalDays / 30.44);
  const remDays = totalDays - Math.floor(totalMonths * 30.44);
  const remWeeks = Math.floor(remDays / 7);
  const remDaysOfWeek = remDays % 7;
  const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
  const progress = Math.min(100, Math.round((totalDays / 280) * 100));
  return { weeks, days, totalDays, edd, daysLeft, totalMonths, remWeeks, remDaysOfWeek, trimester, progress };
}

function formatEdd(date) {
  if (!date) return '—';
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getWeekData(weeks) {
  if (weeks < 4) return WEEKLY_DATA[4];
  if (weeks > 42) return WEEKLY_DATA[42];
  return WEEKLY_DATA[weeks] || WEEKLY_DATA[Math.max(4, Math.min(42, weeks))];
}

// ===== UI HELPERS =====
function $(id) { return document.getElementById(id); }
function showToast(msg, dur = 2200) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), dur);
}

function setPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const page = $(pageId);
  if (page) {
    page.classList.add('active');
    STATE.currentPage = pageId;
  }
  const navBtn = document.querySelector(`[data-page="${pageId}"]`);
  if (navBtn) navBtn.classList.add('active');
  // Refresh content based on page
  if (pageId === 'pageHome') renderHome();
  if (pageId === 'pageCalendar') renderCalendar();
  if (pageId === 'pageTools') renderTools();
  if (pageId === 'pageProfile') renderProfile();
}

function openModal(html) {
  $('modalBody').innerHTML = html;
  $('modalOverlay').classList.remove('hidden');
}
function closeModal() {
  $('modalOverlay').classList.add('hidden');
  $('modalBody').innerHTML = '';
}

// ===== THEME =====
function applyTheme() {
  document.documentElement.setAttribute('data-theme', STATE.darkMode ? 'dark' : 'light');
  $('themeToggle').textContent = STATE.darkMode ? '☀️' : '🌙';
  const toggle = $('darkModeToggle');
  if (toggle) toggle.checked = STATE.darkMode;
}

// ===== RENDER HOME =====
function renderHome() {
  const preg = getCurrentPregnancy();
  if (!preg) {
    $('heroWeeks').textContent = '— нед. — дн.';
    $('heroMonths').textContent = '—';
    $('heroTrimester').textContent = '— триместр';
    $('progressFill').style.width = '0%';
    $('progressPct').textContent = '0%';
    $('countdownDays').textContent = '—';
    $('eddDate').textContent = 'ПДР: —';
    return;
  }
  const { weeks, days, edd, daysLeft, totalMonths, remWeeks, remDaysOfWeek, trimester, progress } = preg;
  $('heroWeeks').textContent = `${weeks} нед. ${days} дн.`;

  // months display
  let monthStr = '';
  if (totalMonths > 0) monthStr += `${totalMonths} мес. `;
  if (remWeeks > 0) monthStr += `${remWeeks} нед. `;
  if (remDaysOfWeek > 0) monthStr += `${remDaysOfWeek} дн.`;
  $('heroMonths').textContent = monthStr.trim() || '< 1 дня';

  $('heroTrimester').textContent = `${trimester} триместр`;
  $('progressFill').style.width = progress + '%';
  $('progressPct').textContent = progress + '%';
  $('countdownDays').textContent = daysLeft;
  $('eddDate').textContent = `ПДР: ${formatEdd(edd)}`;

  // Baby figure by trimester
  const figures = ['🤰','🫄','🤱'];
  $('babyFigure').textContent = weeks < 20 ? '🌱' : weeks < 30 ? '🤰' : weeks < 37 ? '🫄' : '👶';

  // Week data
  const wd = getWeekData(weeks);
  $('fruitEmoji').textContent = wd.fruit;
  $('fruitName').textContent = wd.fruitName;
  $('babyLength').textContent = wd.length;
  $('babyWeight').textContent = wd.weight;
  $('fruitFact').textContent = `Малыш сейчас размером с ${wd.fruitName}`;

  $('devText').textContent = wd.dev;
  const tagsEl = $('devTags');
  tagsEl.innerHTML = wd.tags.map(t => `<span class="dev-tag">${t}</span>`).join('');

  // Mom advice
  const momItems = [
    { icon: '💊', title: 'Состояние', text: wd.mom },
    { icon: '💡', title: 'Совет', text: wd.tip },
    { icon: '🏃', title: 'Активность', text: weeks < 30 ? 'Лёгкая прогулка 20–30 минут очень полезна' : 'Лёгкая растяжка и дыхательные упражнения' },
    { icon: '😴', title: 'Сон', text: 'Спи на левом боку — это улучшает кровоток к плаценте' }
  ];
  $('momList').innerHTML = momItems.map(i => `
    <div class="mom-item">
      <div class="mom-item-icon">${i.icon}</div>
      <div><div class="mom-item-title">${i.title}</div><div class="mom-item-text">${i.text}</div></div>
    </div>`).join('');

  // Today quote & tip
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  $('todayQuote').textContent = `«${QUOTES[dayOfYear % QUOTES.length]}»`;
  $('todayTip').textContent = `💡 ${TIPS[dayOfYear % TIPS.length]}`;

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
  const name = STATE.babyName ? `, мама ${STATE.babyName}` : '';
  $('topbarGreeting').textContent = `${greeting}${name} 🌸`;

  // Water
  renderWater();
}

function renderWater() {
  const today = new Date().toDateString();
  if (STATE.waterDate !== today) { STATE.waterToday = 0; STATE.waterDate = today; saveState(); }
  $('waterCount').textContent = `${STATE.waterToday} / 8`;
  const g = $('waterGlasses');
  g.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const div = document.createElement('div');
    div.className = 'water-glass' + (i < STATE.waterToday ? ' filled' : '');
    div.textContent = i < STATE.waterToday ? '💧' : '○';
    g.appendChild(div);
  }
}

// ===== RENDER CALENDAR =====
function renderCalendar() {
  const preg = getCurrentPregnancy();
  const currentWeek = preg ? preg.weeks : 0;

  // Trimester timeline
  const tl = $('trimesterTimeline');
  tl.innerHTML = `
    <div class="trimester-block t1 ${currentWeek < 13 ? 'current' : ''}">1–12</div>
    <div class="trimester-block t2 ${currentWeek >= 13 && currentWeek < 27 ? 'current' : ''}">13–26</div>
    <div class="trimester-block t3 ${currentWeek >= 27 ? 'current' : ''}">27–42</div>
  `;

  // Week grid
  const wg = $('weekGrid');
  wg.innerHTML = '';
  for (let w = 1; w <= 40; w++) {
    const cell = document.createElement('div');
    cell.className = 'week-cell' + (w < currentWeek ? ' past' : w === currentWeek ? ' current' : ' future');
    cell.textContent = w;
    cell.title = `${w} неделя`;
    cell.onclick = () => showWeekDetail(w);
    wg.appendChild(cell);
  }

  // Notes
  renderNotes();
}

function showWeekDetail(week) {
  const wd = getWeekData(week);
  openModal(`
    <div style="text-align:center;margin-bottom:18px">
      <div style="font-size:52px;margin-bottom:8px">${wd.fruit}</div>
      <div style="font-family:var(--font-display);font-size:22px;color:var(--text)">${week} неделя</div>
      <div style="font-size:13px;color:var(--text3);margin-top:4px">размер с ${wd.fruitName}</div>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:14px">
      <div style="flex:1;background:var(--accent3);border-radius:12px;padding:12px;text-align:center">
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase">Рост</div>
        <div style="font-family:var(--font-display);font-size:22px;color:var(--accent)">${wd.length} см</div>
      </div>
      <div style="flex:1;background:var(--accent3);border-radius:12px;padding:12px;text-align:center">
        <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase">Вес</div>
        <div style="font-family:var(--font-display);font-size:22px;color:var(--accent)">${wd.weight} г</div>
      </div>
    </div>
    <p style="font-size:14px;color:var(--text2);line-height:1.65;margin-bottom:12px">${wd.dev}</p>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
      ${wd.tags.map(t => `<span class="dev-tag">${t}</span>`).join('')}
    </div>
    <div style="background:var(--surface2);border-radius:12px;padding:12px">
      <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px">🌸 Для мамы</div>
      <div style="font-size:13px;color:var(--text2)">${wd.mom}</div>
    </div>
  `);
}

function renderNotes() {
  const list = $('notesList');
  if (!STATE.notes.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">📓</div><p>Пока нет заметок</p></div>';
    return;
  }
  list.innerHTML = STATE.notes.map((n, i) => `
    <div class="note-item">
      <div>
        <div class="note-date">${n.date} · ${n.week} нед.</div>
        <div class="note-text">${n.text}</div>
      </div>
      <button onclick="deleteNote(${i})" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text3);padding:4px">✕</button>
    </div>`).join('');
}

window.deleteNote = (i) => {
  STATE.notes.splice(i, 1);
  saveState();
  renderNotes();
};

function addNote() {
  const preg = getCurrentPregnancy();
  openModal(`
    <div style="font-family:var(--font-display);font-size:20px;color:var(--text);margin-bottom:16px">Добавить заметку</div>
    <textarea id="noteText" placeholder="Что сегодня особенного? 💭" rows="4"
      style="width:100%;padding:13px;border-radius:12px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);font-family:var(--font-body);font-size:14px;resize:none;outline:none"></textarea>
    <button class="btn-primary" style="width:100%;margin-top:12px" onclick="saveNote(${preg ? preg.weeks : 0})">Сохранить</button>
  `);
}

window.saveNote = (week) => {
  const text = $('noteText').value.trim();
  if (!text) return;
  STATE.notes.unshift({
    text,
    week,
    date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  });
  saveState();
  closeModal();
  renderNotes();
  showToast('Заметка сохранена 📝');
};

// ===== RENDER DIARY =====
function renderDiary() {
  renderPhotos();
  renderWeights();
}

function renderPhotos() {
  const grid = $('photoGrid');
  if (!STATE.photos.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🌸</div><p>Добавь первое фото</p><button class="btn-sm" onclick="document.getElementById('photoInput').click()">Добавить фото</button></div>`;
    return;
  }
  grid.innerHTML = STATE.photos.map((p, i) => `
    <div class="photo-item" onclick="viewPhoto(${i})">
      <img src="${p.data}" alt="фото ${i+1}" loading="lazy">
      <div class="photo-week">${p.week} нед.</div>
    </div>`).join('');
}

window.viewPhoto = (i) => {
  const p = STATE.photos[i];
  openModal(`
    <img src="${p.data}" style="width:100%;border-radius:12px;margin-bottom:12px" alt="фото">
    <div style="font-size:13px;color:var(--text2);text-align:center">${p.date} · ${p.week} неделя</div>
    <button class="btn-sm danger" style="width:100%;margin-top:12px" onclick="deletePhoto(${i})">Удалить фото</button>
  `);
};

window.deletePhoto = (i) => {
  STATE.photos.splice(i, 1);
  saveState();
  closeModal();
  renderPhotos();
};

function renderWeights() {
  const list = $('weightList');
  if (!STATE.weights.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Добавь первый замер</p></div>';
    return;
  }
  list.innerHTML = STATE.weights.map((w, i) => {
    const prev = STATE.weights[i - 1];
    const diff = prev ? (w.value - prev.value).toFixed(1) : null;
    const diffStr = diff !== null ? `<span class="weight-diff ${diff < 0 ? 'neg' : ''}">+${diff} кг</span>` : '';
    return `<div class="weight-item">
      <div class="weight-date">${w.date}</div>
      <div class="weight-val">${w.value} кг</div>
      ${diffStr}
    </div>`;
  }).join('');
}

// ===== RENDER TOOLS =====
function renderTools() {
  renderKicks();
  renderContractions();
  renderBag();
  renderNameGen();
}

function renderKicks() {
  const today = new Date().toDateString();
  if (!STATE.kicks[today]) STATE.kicks[today] = 0;
  $('kicksNum').textContent = STATE.kicks[today];
  $('kicksDateBadge').textContent = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  // Yesterday stats
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yd = yesterday.toDateString();
  const stats = STATE.kicks[yd] ? `Вчера: ${STATE.kicks[yd]} шевелений` : 'Начни считать сегодня';
  $('kicksStats').textContent = stats;
}

let contrTimer;
function renderContractions() {
  if (!STATE.contractions) STATE.contractions = [];
  const list = $('contrList');
  if (!STATE.contractions.length) {
    list.innerHTML = '<div style="text-align:center;padding:12px;font-size:13px;color:var(--text3)">Список схваток пуст</div>';
    $('contrAvg').textContent = '';
    return;
  }
  list.innerHTML = STATE.contractions.slice(-5).reverse().map(c => `
    <div class="contr-item">
      <span class="contr-dur">⏱ ${c.duration}с</span>
      <span class="contr-interval">${c.interval > 0 ? `интервал ${c.interval}с` : 'первая'}</span>
      <span style="font-size:11px;color:var(--text3)">${c.time}</span>
    </div>`).join('');

  if (STATE.contractions.length > 1) {
    const intervals = STATE.contractions.slice(1).map((c, i) => STATE.contractions[i].endTime ? (c.startTime - STATE.contractions[i].endTime) / 1000 : 0).filter(Boolean);
    if (intervals.length) {
      const avg = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
      $('contrAvg').textContent = `Средний интервал: ${Math.floor(avg/60)}мин ${avg%60}сек`;
    }
  }
}

function renderBag() {
  const cats = $('bagCategories');
  let total = 0, checked = 0;
  cats.innerHTML = Object.entries(BAG_ITEMS).map(([cat, items]) => {
    return `<div class="bag-category">
      <div class="bag-cat-title">${cat}</div>
      ${items.map(item => {
        const key = cat + ':' + item;
        const isChecked = STATE.bagItems[key];
        total++;
        if (isChecked) checked++;
        return `<div class="bag-item ${isChecked ? 'checked' : ''}" onclick="toggleBagItem('${key}')">
          <div class="bag-checkbox"></div>
          <div class="bag-item-text">${item}</div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  // Custom items
  const customKey = 'custom';
  const customs = STATE.bagItems[customKey] ? JSON.parse(STATE.bagItems[customKey]) : [];
  if (customs.length) {
    const customHtml = customs.map((item, i) => {
      const k = 'Custom:' + item;
      const isChecked = STATE.bagItems[k];
      total++;
      if (isChecked) checked++;
      return `<div class="bag-item ${isChecked ? 'checked' : ''}" onclick="toggleBagItem('${k}')">
        <div class="bag-checkbox"></div>
        <div class="bag-item-text">${item}</div>
        <button onclick="event.stopPropagation();removeCustomBagItem(${i})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:4px">✕</button>
      </div>`;
    }).join('');
    cats.innerHTML += `<div class="bag-category"><div class="bag-cat-title">✨ Мои пункты</div>${customHtml}</div>`;
  }

  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  $('bagProgress').textContent = `${pct}%`;
}

window.toggleBagItem = (key) => {
  STATE.bagItems[key] = !STATE.bagItems[key];
  saveState();
  renderBag();
};

window.removeCustomBagItem = (i) => {
  const customs = STATE.bagItems['custom'] ? JSON.parse(STATE.bagItems['custom']) : [];
  customs.splice(i, 1);
  STATE.bagItems['custom'] = JSON.stringify(customs);
  saveState();
  renderBag();
};

function renderNameGen() {
  const favs = $('nameFavorites');
  const favList = STATE.nameFavorites.filter(n => n.gender === STATE.currentNameGender);
  if (favList.length) {
    favs.innerHTML = favList.map(n => `<span class="name-fav" onclick="removeFav('${n.name}')">${n.name} ✕</span>`).join('');
  } else {
    favs.innerHTML = '';
  }
}

window.removeFav = (name) => {
  STATE.nameFavorites = STATE.nameFavorites.filter(n => n.name !== name);
  saveState();
  renderNameGen();
};

function generateName() {
  const list = STATE.currentNameGender === 'girl' ? GIRL_NAMES : BOY_NAMES;
  const item = list[Math.floor(Math.random() * list.length)];
  STATE.currentName = { ...item, gender: STATE.currentNameGender };
  $('nameBig').style.animation = 'none';
  requestAnimationFrame(() => {
    $('nameBig').style.animation = '';
    $('nameBig').textContent = item.name;
    $('nameMeaning').textContent = item.meaning;
  });
}

// ===== RENDER PROFILE =====
function renderProfile() {
  const preg = getCurrentPregnancy();
  $('profileAvatar').textContent = STATE.babyGender === 'girl' ? '🤰' : STATE.babyGender === 'boy' ? '🤰' : '🤰';
  $('profileName').textContent = STATE.babyName ? `Малыш ${STATE.babyName}` : 'Моя беременность';
  $('profileSub').textContent = preg ? `${preg.weeks} нед. ${preg.days} дн. · ${preg.trimester} триместр` : 'Срок не установлен';
  $('profileBabyName').value = STATE.babyName || '';

  // Gender
  ['genderUnknown', 'genderGirl', 'genderBoy'].forEach(id => $(id) && $(id).classList.remove('active'));
  const gMap = { unknown: 'genderUnknown', girl: 'genderGirl', boy: 'genderBoy' };
  if (gMap[STATE.babyGender]) $(gMap[STATE.babyGender]) && $(gMap[STATE.babyGender]).classList.add('active');

  // Theme toggle
  const dt = $('darkModeToggle');
  if (dt) dt.checked = STATE.darkMode;

  // Pre-fill edit form
  if (STATE.conceptionDate) {
    const today = new Date().toISOString().split('T')[0];
    $('editUziDate').value = today;
    const preg2 = getCurrentPregnancy();
    if (preg2) {
      $('editUziWeeks').value = preg2.weeks;
      $('editUziDays').value = preg2.days;
      $('editManDate').value = today;
      $('editManWeeks').value = preg2.weeks;
      $('editManDays').value = preg2.days;
    }
  }
}

// ===== SETUP LOGIC =====
function setupDateDefaults() {
  const today = new Date().toISOString().split('T')[0];
  $('uziDate').value = today;
  $('manDate').value = today;
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 70);
  $('lmpDate').value = twoWeeksAgo.toISOString().split('T')[0];
}

function getSetupConceptionDate(tab) {
  if (tab === 'uzi') {
    const date = $('uziDate').value;
    const weeks = parseInt($('uziWeeks').value) || 0;
    const days = parseInt($('uziDays').value) || 0;
    if (!date || (weeks === 0 && days === 0)) return null;
    return calcConceptionFromUzi(date, weeks, days);
  } else if (tab === 'manual') {
    const date = $('manDate').value;
    const weeks = parseInt($('manWeeks').value) || 0;
    const days = parseInt($('manDays').value) || 0;
    if (!date) return null;
    return calcConceptionFromManual(date, weeks, days);
  } else {
    const date = $('lmpDate').value;
    if (!date) return null;
    return calcConceptionFromLmp(date);
  }
}

function getEditConceptionDate(tab) {
  if (tab === 'uzi') {
    const date = $('editUziDate').value;
    const weeks = parseInt($('editUziWeeks').value) || 0;
    const days = parseInt($('editUziDays').value) || 0;
    if (!date || (weeks === 0 && days === 0)) return null;
    return calcConceptionFromUzi(date, weeks, days);
  } else if (tab === 'manual') {
    const date = $('editManDate').value;
    const weeks = parseInt($('editManWeeks').value) || 0;
    const days = parseInt($('editManDays').value) || 0;
    if (!date) return null;
    return calcConceptionFromManual(date, weeks, days);
  } else {
    const date = $('editLmpDate').value;
    if (!date) return null;
    return calcConceptionFromLmp(date);
  }
}

// ===== INIT =====
function init() {
  loadState();

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // PWA Install prompt
  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    hideInstallBanner();
    showToast('Baby Journey установлено! 🌸');
  });

  function showInstallBanner() {
    if (document.getElementById('installBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'installBanner';
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;
        background:linear-gradient(135deg,#fce4ec,#f8bbd0);
        border-bottom:1px solid rgba(232,132,154,0.3);
        font-family:'Nunito',sans-serif;font-size:13px;
        position:fixed;top:0;left:0;right:0;z-index:500;
        padding-top:calc(10px + env(safe-area-inset-top,0px))">
        <span style="font-size:22px">🌸</span>
        <span style="flex:1;color:#6b3a50;font-weight:600">Установить Baby Journey</span>
        <button onclick="window.triggerInstall()" style="
          background:#e8849a;color:#fff;border:none;padding:7px 14px;
          border-radius:20px;font-family:'Nunito',sans-serif;font-size:12px;
          font-weight:700;cursor:pointer">Установить</button>
        <button onclick="document.getElementById('installBanner').remove()" style="
          background:none;border:none;font-size:18px;cursor:pointer;
          color:#b08080;padding:4px">✕</button>
      </div>`;
    document.body.prepend(banner);
    // Adjust app top padding
    const app = document.getElementById('app');
    if (app) app.style.paddingTop = '52px';
  }

  function hideInstallBanner() {
    const b = document.getElementById('installBanner');
    if (b) { b.remove(); document.getElementById('app').style.paddingTop = ''; }
  }

  window.triggerInstall = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (outcome === 'accepted') hideInstallBanner();
  };

  // Splash
  setTimeout(() => {
    $('splash').style.opacity = '0';
    setTimeout(() => {
      $('splash').style.display = 'none';
      if (!STATE.setup) {
        if (!localStorage.getItem('bjOnbDone')) {
          $('onboarding').classList.remove('hidden');
        } else {
          showSetup();
        }
      } else {
        showApp();
      }
    }, 600);
  }, 1800);

  applyTheme();
  bindEvents();
}

function showSetup() {
  $('onboarding').classList.add('hidden');
  $('setup').classList.remove('hidden');
  $('app').classList.add('hidden');
  setupDateDefaults();
}

function showApp() {
  $('onboarding').classList.add('hidden');
  $('setup').classList.add('hidden');
  $('app').classList.remove('hidden');
  setPage(STATE.currentPage || 'pageHome');
}

// ===== EVENTS =====
function bindEvents() {
  // Onboarding
  $('onbNext').onclick = () => {
    STATE.onbSlide = (STATE.onbSlide || 0) + 1;
    if (STATE.onbSlide >= 3) { localStorage.setItem('bjOnbDone','1'); showSetup(); return; }
    document.querySelectorAll('.onb-slide').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.onb-dot').forEach(d => d.classList.remove('active'));
    const slide = document.querySelector(`[data-slide="${STATE.onbSlide}"]`);
    const dot = document.querySelectorAll('.onb-dot')[STATE.onbSlide];
    if (slide) slide.classList.add('active');
    if (dot) dot.classList.add('active');
    if (STATE.onbSlide === 2) $('onbNext').textContent = 'Начать';
  };
  $('onbSkip').onclick = () => { localStorage.setItem('bjOnbDone','1'); showSetup(); };

  // Setup back
  $('setupBack').onclick = () => { $('setup').classList.add('hidden'); $('onboarding').classList.remove('hidden'); };

  // Setup tabs
  document.querySelectorAll('.stab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ['setupFormUzi','setupFormManual','setupFormLmp'].forEach(id => $(id).classList.add('hidden'));
      $('setupForm' + capitalize(btn.dataset.tab)).classList.remove('hidden');
    };
  });

  // Gender buttons setup
  document.querySelectorAll('.setup-extra .gender-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.setup-extra .gender-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });

  // Setup go
  $('setupGo').onclick = () => {
    const activeTab = document.querySelector('.stab.active').dataset.tab;
    const conception = getSetupConceptionDate(activeTab);
    if (!conception) { showToast('Пожалуйста, заполни все поля ✨'); return; }
    STATE.conceptionDate = conception.toISOString();
    STATE.babyName = $('babyName').value.trim();
    const activeGender = document.querySelector('.setup-extra .gender-btn.active');
    STATE.babyGender = activeGender ? activeGender.dataset.gender : 'unknown';
    STATE.setup = true;
    saveState();
    showApp();
    showToast('Путешествие началось! 🌸');
  };

  // Nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => setPage(btn.dataset.page);
  });

  // Theme
  $('themeToggle').onclick = () => {
    STATE.darkMode = !STATE.darkMode;
    applyTheme();
    saveState();
  };

  // Settings btn
  $('settingsBtn').onclick = () => setPage('pageProfile');

  // Modal close
  $('modalClose').onclick = closeModal;
  $('modalOverlay').onclick = (e) => { if (e.target === $('modalOverlay')) closeModal(); };

  // Water
  $('waterAdd').onclick = () => {
    if (STATE.waterToday < 8) {
      STATE.waterToday++;
      saveState();
      renderWater();
      if (STATE.waterToday === 8) showToast('Отлично! Норма воды выполнена 💧');
    }
  };

  // Calendar notes
  $('addNoteBtn').onclick = addNote;

  // Diary
  $('addPhotoBtn').onclick = () => $('photoInput').click();
  $('addPhotoBtn2') && ($('addPhotoBtn2').onclick = () => $('photoInput').click());
  $('photoInput').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preg = getCurrentPregnancy();
      STATE.photos.push({
        data: ev.target.result,
        date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        week: preg ? preg.weeks : 0
      });
      saveState();
      renderPhotos();
      showToast('Фото добавлено 📸');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  $('addWeightBtn').onclick = () => {
    openModal(`
      <div style="font-family:var(--font-display);font-size:20px;color:var(--text);margin-bottom:16px">Добавить замер веса</div>
      <label class="form-label">Вес (кг)</label>
      <input type="number" class="form-input" id="weightInput" placeholder="Например: 65.5" step="0.1" min="30" max="200">
      <button class="btn-primary" style="width:100%;margin-top:12px" onclick="saveWeight()">Сохранить</button>
    `);
  };

  window.saveWeight = () => {
    const val = parseFloat($('weightInput').value);
    if (!val || val < 30 || val > 200) { showToast('Введи корректный вес'); return; }
    const preg = getCurrentPregnancy();
    STATE.weights.push({
      value: val,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      week: preg ? preg.weeks : 0
    });
    saveState();
    closeModal();
    renderWeights();
    showToast('Вес сохранён ⚖️');
  };

  // Kicks
  $('kicksBtn').onclick = () => {
    const today = new Date().toDateString();
    if (!STATE.kicks) STATE.kicks = {};
    if (!STATE.kicks[today]) STATE.kicks[today] = 0;
    STATE.kicks[today]++;
    saveState();
    renderKicks();
    // Vibrate
    if ('vibrate' in navigator) navigator.vibrate(30);
    // Flash animation
    $('kicksBtn').style.transform = 'scale(0.92)';
    setTimeout(() => $('kicksBtn').style.transform = '', 120);
  };

  $('kicksReset').onclick = () => {
    const today = new Date().toDateString();
    if (!STATE.kicks) STATE.kicks = {};
    STATE.kicks[today] = 0;
    saveState();
    renderKicks();
  };

  // Contractions
  $('contrBtn').onclick = () => {
    if (!STATE.contrActive) {
      STATE.contrActive = true;
      STATE.contrStart = Date.now();
      $('contrBtn').textContent = 'Схватка закончилась';
      $('contrBtn').classList.add('active');
      $('contrStatus').textContent = 'Схватка идёт...';
      contrTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - STATE.contrStart) / 1000);
        const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const s = (elapsed % 60).toString().padStart(2, '0');
        $('contrTimer').textContent = `${m}:${s}`;
      }, 1000);
    } else {
      clearInterval(contrTimer);
      const duration = Math.floor((Date.now() - STATE.contrStart) / 1000);
      const last = STATE.contractions[STATE.contractions.length - 1];
      const interval = last ? Math.floor((STATE.contrStart - last.endTime) / 1000) : 0;
      STATE.contractions.push({
        duration,
        interval,
        startTime: STATE.contrStart,
        endTime: Date.now(),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      });
      STATE.contrActive = false;
      STATE.contrStart = null;
      $('contrBtn').textContent = 'Начать схватку';
      $('contrBtn').classList.remove('active');
      $('contrStatus').textContent = 'Нажми для начала';
      $('contrTimer').textContent = '00:00';
      saveState();
      renderContractions();
    }
  };

  // Bag
  $('bagAddBtn').onclick = () => {
    const val = $('bagItemInput').value.trim();
    if (!val) return;
    const customs = STATE.bagItems['custom'] ? JSON.parse(STATE.bagItems['custom']) : [];
    customs.push(val);
    STATE.bagItems['custom'] = JSON.stringify(customs);
    saveState();
    $('bagItemInput').value = '';
    renderBag();
    showToast('Пункт добавлен ✓');
  };

  // Name tabs
  document.querySelectorAll('.ntab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.ntab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.currentNameGender = btn.dataset.gender;
      generateName();
      renderNameGen();
    };
  });

  $('generateName').onclick = generateName;

  $('saveName').onclick = () => {
    if (!STATE.currentName) return;
    const exists = STATE.nameFavorites.some(n => n.name === STATE.currentName.name);
    if (!exists) {
      STATE.nameFavorites.push(STATE.currentName);
      saveState();
      renderNameGen();
      showToast(`${STATE.currentName.name} добавлено в избранное ♥`);
    } else {
      showToast('Имя уже в избранном');
    }
  };

  // Profile — edit pregnancy
  document.querySelectorAll('.etab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.etab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ['editFormUzi','editFormManual','editFormLmp'].forEach(id => $(id).classList.add('hidden'));
      $('editForm' + capitalize(btn.dataset.tab)).classList.remove('hidden');
    };
  });

  $('savePregnancyEdit').onclick = () => {
    const activeTab = document.querySelector('.etab.active').dataset.tab;
    const conception = getEditConceptionDate(activeTab);
    if (!conception) { showToast('Пожалуйста, заполни все поля'); return; }
    STATE.conceptionDate = conception.toISOString();
    saveState();
    renderHome();
    renderProfile();
    showToast('Срок обновлён ✨');
  };

  $('saveBabyInfo').onclick = () => {
    STATE.babyName = $('profileBabyName').value.trim();
    const activeGender = document.querySelector('.gender-row .gender-btn.active[id]');
    if (activeGender) STATE.babyGender = activeGender.dataset.gender;
    saveState();
    renderHome();
    renderProfile();
    showToast('Данные сохранены 💕');
  };

  // Profile gender buttons
  ['genderUnknown','genderGirl','genderBoy'].forEach(id => {
    $(id) && ($(id).onclick = () => {
      ['genderUnknown','genderGirl','genderBoy'].forEach(i => $(i) && $(i).classList.remove('active'));
      $(id).classList.add('active');
    });
  });

  // Settings
  $('darkModeToggle').onchange = (e) => {
    STATE.darkMode = e.target.checked;
    applyTheme();
    saveState();
  };

  $('exportData').onclick = () => {
    const data = JSON.stringify(STATE, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'baby-journey-export.json';
    a.click(); URL.revokeObjectURL(url);
    showToast('Данные экспортированы 📤');
  };

  $('resetApp').onclick = () => {
    openModal(`
      <div style="text-align:center;padding:8px 0">
        <div style="font-size:44px;margin-bottom:12px">⚠️</div>
        <div style="font-family:var(--font-display);font-size:20px;color:var(--text);margin-bottom:8px">Сбросить всё?</div>
        <p style="font-size:14px;color:var(--text2);margin-bottom:20px">Все данные будут удалены безвозвратно. Это действие нельзя отменить.</p>
        <div style="display:flex;gap:10px">
          <button class="btn-sm secondary" style="flex:1" onclick="closeModal()">Отмена</button>
          <button class="btn-sm danger" style="flex:1" onclick="doReset()">Сбросить</button>
        </div>
      </div>
    `);
  };

  window.doReset = () => {
    localStorage.clear();
    location.reload();
  };

  window.closeModal = closeModal;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ===== DIARY PAGE INIT =====
const origSetPage = setPage;
// Add diary render on tab switch
document.addEventListener('DOMContentLoaded', () => {
  const diaryNav = document.querySelector('[data-page="pageDiary"]');
  if (diaryNav) {
    diaryNav.addEventListener('click', () => {
      setTimeout(renderDiary, 100);
    });
  }
  generateName(); // init name
});

// Start
init();
