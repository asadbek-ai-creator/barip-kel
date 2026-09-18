import type { Dictionary } from './en';

/**
 * Russian.
 *
 * Two things this copy deliberately avoids, because Russian grammar punishes
 * naive string interpolation:
 *
 * 1. Past-tense verbs agreeing with a child's gender ("сел" / "села"). Every
 *    sentence that carries a name uses a gender-neutral construction instead.
 * 2. Names in an oblique case. A name dropped into a slot stays nominative, so
 *    sentences are phrased so that nominative is the correct case.
 */
export const ru: Dictionary = {
  // --- language ------------------------------------------------------
  'lang.label': 'Язык',
  'lang.en': 'English',
  'lang.ru': 'Русский',
  'lang.en.short': 'EN',
  'lang.ru.short': 'RU',

  // --- shared --------------------------------------------------------
  'app.title': 'Barıp kel — школьный транспорт Нукуса',
  'common.bus': 'Автобус {number}',
  'common.back': 'Назад к выбору роли',
  'common.close': 'Закрыть',
  'common.dismiss': 'Скрыть',
  'common.cancel': 'Отмена',
  'common.min': 'мин',
  'common.now': 'Сейчас',
  'common.none': '—',

  // --- counts --------------------------------------------------------
  'count.children_one': '{count} ребёнок',
  'count.children_few': '{count} ребёнка',
  'count.children_many': '{count} детей',
  'count.children_other': '{count} детей',
  'count.stops_one': '{count} остановка',
  'count.stops_few': '{count} остановки',
  'count.stops_many': '{count} остановок',
  'count.stops_other': '{count} остановки',

  // --- statuses ------------------------------------------------------
  'status.at_home.label': 'Ждёт дома (Úyde kútip tur)',
  'status.at_home.short': 'Ждёт',
  'status.picked_up.label': 'В автобусе (Avtobusta)',
  'status.picked_up.short': 'В автобусе',
  'status.at_school.label': 'Благополучно в школе (Mektepte)',
  'status.at_school.short': 'В школе',
  'status.dropped_off.label': 'Высадка у дома (Úyge jetti)',
  'status.dropped_off.short': 'Дома',
  'status.absent_today.label': 'Сегодня не едет (Búgin joq)',
  'status.absent_today.short': 'Не едет',

  // --- absence reasons -----------------------------------------------
  'absence.sick': 'Болеет (Nawqas)',
  'absence.parents_driving': 'Везут родители (Ata-ana alıp baradı)',
  'absence.vacation': 'В отъезде / на каникулах (Demalısta)',

  // --- trip modes ----------------------------------------------------
  'trip.idle': 'Рейсов нет',
  'trip.morning_to_school': 'Утренний рейс · Нукус → Школа №1',
  'trip.afternoon_to_home': 'Дневной рейс · Школа №1 → Нукус',
  'trip.completed': 'Рейс завершён',

  // --- route ---------------------------------------------------------
  'waypoint.stop1.name': 'Остановка 1 — Досназарова',
  'waypoint.stop1.address': 'ул. Досназарова 12, Нукус',
  'waypoint.stop2.name': 'Остановка 2 — Бердаха',
  'waypoint.stop2.address': 'ул. Бердаха 45, Нукус',
  'waypoint.stop3.name': 'Остановка 3 — Каракалпакстан',
  'waypoint.stop3.address': 'просп. Каракалпакстан 88, Нукус',
  'waypoint.stop4.name': 'Остановка 4 — Амударья',
  'waypoint.stop4.address': 'ул. Амударьинская 7, Нукус',
  'waypoint.stop5.name': 'Остановка 5 — Центр города',
  'waypoint.stop5.address': 'ул. Гарезсизлик 30, Нукус',
  'waypoint.school.name': 'Школа №1 (1-сан мектеп)',
  'waypoint.school.address': 'ул. Алла Яров 1, Нукус',

  // --- home ----------------------------------------------------------
  'home.eyebrow': 'Автобус {number} · Нукус',
  'home.lede':
    'Школьный транспорт в реальном времени для «{school}». Один автобус, {children} и трое взрослых, которым важно точно знать, где он сейчас.',
  'home.role.driver.title': 'Водитель',
  'home.role.driver.lede': 'Отмечайте посадку и высадку детей и ведите маршрут.',
  'home.role.parent.title': 'Родитель',
  'home.role.parent.lede':
    'Следите за автобусом, узнавайте о посадке ребёнка, отменяйте поездку.',
  'home.role.admin.title': 'Диспетчер школы',
  'home.role.admin.lede':
    'Транспорт, посещаемость и контакты всех родителей в одном окне.',
  'home.demo.title': 'Попробуйте живую синхронизацию',
  'home.demo.step1':
    '1. Откройте приложение водителя в одном окне, а родителя — в другом.',
  'home.demo.step2': '2. У водителя начните утренний рейс и включите «Симуляцию».',
  'home.demo.step3':
    '3. Нажмите «Посадка» у ребёнка — окно родителя обновится тут же.',
  'home.demo.note':
    'Оба окна делят одно состояние через BroadcastChannel, поэтому сервер не нужен.',
  'home.reset': 'Сбросить демоданные',

  // --- driver --------------------------------------------------------
  'driver.blind.morning': 'Нукус → Школа №1',
  'driver.blind.afternoon': 'Школа №1 → Нукус',
  'driver.direction.morning': 'Утро',
  'driver.direction.afternoon': 'День',
  'driver.startTrip': 'Начать рейс',
  'driver.endTrip': 'Завершить',
  'driver.simulate': 'Симуляция',
  'driver.driving': 'В пути',
  'driver.hint.completed':
    'Рейс завершён. Смените направление и начните следующий, когда будете готовы.',
  'driver.hint.idle':
    'Начните рейс, чтобы открыть список. Родители увидят движение автобуса сразу же.',
  'driver.next': 'Следующая',
  'driver.endOfRoute.morning': 'Конец утреннего маршрута.',
  'driver.endOfRoute.afternoon': 'Конец дневного маршрута.',
  'driver.tally.total': 'Всего',
  'driver.tally.boarded': 'В автобусе',
  'driver.tally.absent': 'Не едут',
  'driver.tally.remaining': 'Осталось',
  'driver.toast.roster.title': 'Список обновлён',
  'driver.toast.roster.body': 'Родитель отметил, что ребёнок сегодня не едет.',
  'driver.toast.morningStarted': 'Утренний рейс начат',
  'driver.toast.afternoonStarted': 'Дневной рейс начат',
  'driver.toast.started.body':
    'Родители могут следить за автобусом {number} в реальном времени.',
  'driver.toast.boarded.title': '{name} в автобусе',
  'driver.toast.boarded.body': 'Родитель уведомлён.',

  // --- student card --------------------------------------------------
  'card.board': 'Посадка (Mindi)',
  'card.drop.morning': 'В школе (Mektepte)',
  'card.drop.afternoon': 'Высадка (Tústi)',
  'card.stamp.boarded': 'посадка {time}',
  'card.stamp.updated': 'обновлено {time}',
  'card.absent': 'Родитель сообщил: сегодня {name} не едет',
  'card.absentWithReason': 'Родитель сообщил: сегодня {name} не едет — {reason}',
  'card.callParent': 'Позвонить: {parent}, родитель ребёнка {child}',

  // --- skip modal ----------------------------------------------------
  'skip.title': 'Пропустить автобус сегодня',
  'skip.subtitle': 'Búgin barmaydı — водитель увидит это сразу.',
  'skip.legend': 'Почему {name} сегодня не едет?',
  'skip.confirm': 'Сообщить водителю',

  // --- parent --------------------------------------------------------
  'parent.childrenOnBus': '{children} в автобусе {number}',
  'parent.skip': 'Пропустить сегодня',
  'parent.unskip': 'Всё-таки поедет',
  'parent.callDriver': 'Позвонить водителю',
  'parent.footer': 'Водитель {name} · Автобус {number} · {plate}',
  'parent.pin.home': 'Ваша остановка',
  'parent.progress.firstStop': 'Первая остановка',
  'parent.progress.school': 'Школа',
  'parent.progress.lastStop': 'Последняя остановка',
  'parent.progress.schoolName': 'Школа №1',
  'parent.toast.boarded.title': 'Ваш ребёнок сел в автобус {number}',
  'parent.toast.boarded.body': 'Следите за автобусом на карте ниже.',
  'parent.toast.atSchool.title': 'Прибытие в школу №1',
  'parent.toast.atSchool.body': 'Ваш ребёнок благополучно в школе.',
  'parent.toast.droppedOff.title': 'Высадка на вашей остановке',
  'parent.toast.droppedOff.body': 'Ваш ребёнок вышел из автобуса.',
  'parent.toast.nearly.title': 'Автобус {number} почти у вашей остановки',
  'parent.toast.nearly.body': 'Пожалуйста, выходите — автобус будет примерно через две минуты.',
  'parent.toast.skip.title': 'Водитель уведомлён',
  'parent.toast.skip.body': 'Сегодня {name} не едет.',

  // --- parent status slab --------------------------------------------
  'slab.onTheWay.kicker': 'Автобус в пути',
  'slab.onTheWay.here': 'Уже на вашей остановке.',
  'slab.onTheWay.away': 'Осталось проехать {stops}. Там ждёт {name}.',
  'slab.onBus.kicker': 'В автобусе',
  'slab.onBus.title': '{name} в автобусе {number}',
  'slab.onBus.at': 'Посадка в {time}.',
  'slab.onBus.plain': 'Посадка выполнена.',
  'slab.onBus.home': 'Дома примерно через {eta} мин.',
  'slab.atSchool.kicker': 'В школе',
  'slab.atSchool.title': '{name} уже в школе',
  'slab.atSchool.at': 'Прибытие в {time}.',
  'slab.atSchool.plain': 'Уже на месте.',
  'slab.homeSafe.kicker': 'Дома',
  'slab.homeSafe.title': '{name} уже не в автобусе',
  'slab.homeSafe.at': 'Высадка в {time}.',
  'slab.homeSafe.plain': 'Высадка на вашей остановке.',
  'slab.missed.kicker': 'Нет в обратном автобусе',
  'slab.missed.title': '{name} не на обратном рейсе',
  'slab.missed.body':
    'Автобус уже проехал вашу остановку. Позвоните водителю или в школу.',
  'slab.absent.kicker': 'Сегодня не едет',
  'slab.absent.title': 'Сегодня {name} не едет',
  'slab.absent.plain': 'Водитель уведомлён.',
  'slab.noTrip.kicker': 'Рейсов нет',
  'slab.noTrip.atHome': '{name} дома',
  'slab.noTrip.atSchool': '{name} в школе',
  'slab.noTrip.body': 'Мы сообщим, как только автобус {number} отправится.',

  // --- admin ---------------------------------------------------------
  'admin.title': 'Диспетчерская школы №1',
  'admin.subtitle': '{trip} · водитель {name}',
  'admin.reset': 'Сбросить демо',
  'admin.kpi.buses': 'Автобусов на линии',
  'admin.kpi.enrolled': 'Детей на маршруте',
  'admin.kpi.safeArrivals': 'Доехали благополучно',
  'admin.kpi.absent': 'Не едут сегодня',
  'admin.routeProgress': 'Ход маршрута',
  'admin.filter.all': 'Все',
  'admin.filter.picked_up': 'В автобусе',
  'admin.filter.at_school': 'В школе',
  'admin.filter.absent_today': 'Не едут',
  'admin.col.child': 'Ребёнок',
  'admin.col.status': 'Статус',
  'admin.col.stop': 'Остановка',
  'admin.col.parent': 'Родитель',
  'admin.col.updated': 'Обновлено',
  'admin.empty': 'В этом фильтре пока никого нет.',

  // --- map -----------------------------------------------------------
  'map.loading': 'Загрузка карты…',
  'map.speed': '{speed} км/ч',
};
