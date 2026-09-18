/**
 * English — the source of truth for translation keys.
 *
 * Every other locale is typed as `Dictionary`, so a missing key is a compile
 * error rather than a blank label in the UI.
 *
 * Placeholders are `{named}` and filled by `t(key, { named: value })`.
 * Keys ending `_one` / `_few` / `_many` / `_other` are plural forms chosen by
 * `Intl.PluralRules`; English only separates one from other, so its few and
 * many repeat the other form.
 */
export const en = {
  // --- language ------------------------------------------------------
  'lang.label': 'Language',
  'lang.en': 'English',
  'lang.ru': 'Русский',
  'lang.en.short': 'EN',
  'lang.ru.short': 'RU',

  // --- shared --------------------------------------------------------
  'app.title': 'Barıp kel — Nókis school transport',
  'common.bus': 'Bus {number}',
  'common.back': 'Back to role switcher',
  'common.close': 'Close',
  'common.dismiss': 'Dismiss',
  'common.cancel': 'Cancel',
  'common.min': 'min',
  'common.now': 'Now',
  'common.none': '—',

  // --- counts --------------------------------------------------------
  'count.children_one': '{count} child',
  'count.children_few': '{count} children',
  'count.children_many': '{count} children',
  'count.children_other': '{count} children',
  'count.stops_one': '{count} stop',
  'count.stops_few': '{count} stops',
  'count.stops_many': '{count} stops',
  'count.stops_other': '{count} stops',

  // --- statuses ------------------------------------------------------
  'status.at_home.label': 'Waiting at home (Úyde kútip tur)',
  'status.at_home.short': 'Waiting',
  'status.picked_up.label': 'On the bus (Avtobusta)',
  'status.picked_up.short': 'On bus',
  'status.at_school.label': 'Safely at school (Mektepte)',
  'status.at_school.short': 'At school',
  'status.dropped_off.label': 'Dropped off at home (Úyge jetti)',
  'status.dropped_off.short': 'Home',
  'status.absent_today.label': 'Absent today (Búgin joq)',
  'status.absent_today.short': 'Absent',

  // --- absence reasons -----------------------------------------------
  'absence.sick': 'Sick (Nawqas)',
  'absence.parents_driving': 'Parents driving (Ata-ana alıp baradı)',
  'absence.vacation': 'Away / holiday (Demalısta)',

  // --- trip modes ----------------------------------------------------
  'trip.idle': 'No run in progress',
  'trip.morning_to_school': 'Morning run · Nókis → Mektep #1',
  'trip.afternoon_to_home': 'Afternoon run · Mektep #1 → Nókis',
  'trip.completed': 'Run finished',

  // --- route ---------------------------------------------------------
  'waypoint.stop1.name': 'Stop 1 — Dosnazarov',
  'waypoint.stop1.address': 'Dosnazarov kóshesi 12, Nókis',
  'waypoint.stop2.name': 'Stop 2 — Berdaq',
  'waypoint.stop2.address': 'Berdaq kóshesi 45, Nókis',
  'waypoint.stop3.name': 'Stop 3 — Qaraqalpaqstan',
  'waypoint.stop3.address': 'Qaraqalpaqstan prospekti 88, Nókis',
  'waypoint.stop4.name': 'Stop 4 — Ámiwdárya',
  'waypoint.stop4.address': 'Ámiwdárya kóshesi 7, Nókis',
  'waypoint.stop5.name': 'Stop 5 — Qala orayı',
  'waypoint.stop5.address': 'Ǵárezsizlik kóshesi 30, Nókis',
  'waypoint.school.name': 'School #1 (1-san mektep)',
  'waypoint.school.address': 'Alla Yarov kóshesi 1, Nókis',

  // --- home ----------------------------------------------------------
  'home.eyebrow': 'Bus {number} · Nókis',
  'home.lede':
    'Live school transport for {school}. One bus, {children}, and three people who need to know exactly where it is.',
  'home.role.driver.title': 'Driver',
  'home.role.driver.lede': 'Check children on and off the bus, and drive the route.',
  'home.role.parent.title': 'Parent',
  'home.role.parent.lede': 'Follow the bus, see when your child boards, skip a day.',
  'home.role.admin.title': 'School dispatch',
  'home.role.admin.lede': 'Fleet, attendance and every parent contact in one view.',
  'home.demo.title': 'Try the live sync',
  'home.demo.step1': '1. Open the driver app in one window and the parent app in another.',
  'home.demo.step2': '2. On the driver, start the morning trip and switch on Simulate.',
  'home.demo.step3': '3. Tap Boarded for a child — the parent window updates as you do it.',
  'home.demo.note':
    'Both windows share one state over BroadcastChannel, so no server is involved.',
  'home.reset': 'Reset demo data',

  // --- driver --------------------------------------------------------
  'driver.blind.morning': 'Nókis → Mektep #1',
  'driver.blind.afternoon': 'Mektep #1 → Nókis',
  'driver.direction.morning': 'Morning',
  'driver.direction.afternoon': 'Afternoon',
  'driver.startTrip': 'Start trip',
  'driver.endTrip': 'End trip',
  'driver.simulate': 'Simulate',
  'driver.driving': 'Driving',
  'driver.hint.completed':
    'Run finished. Switch direction and start the next trip when you are ready.',
  'driver.hint.idle':
    'Start the trip to open the roster. Parents see the bus move the moment you do.',
  'driver.next': 'Next',
  'driver.endOfRoute.morning': 'End of the morning route.',
  'driver.endOfRoute.afternoon': 'End of the afternoon route.',
  'driver.tally.total': 'Total',
  'driver.tally.boarded': 'Boarded',
  'driver.tally.absent': 'Absent',
  'driver.tally.remaining': 'Remaining',
  'driver.toast.roster.title': 'Roster updated',
  'driver.toast.roster.body': 'A parent marked their child absent for today.',
  'driver.toast.morningStarted': 'Morning run started',
  'driver.toast.afternoonStarted': 'Afternoon run started',
  'driver.toast.started.body': 'Parents can now follow Bus {number} live.',
  'driver.toast.boarded.title': '{name} is on board',
  'driver.toast.boarded.body': 'The parent has been notified.',

  // --- student card --------------------------------------------------
  'card.board': 'Boarded (Mindi)',
  'card.drop.morning': 'At school (Mektepte)',
  'card.drop.afternoon': 'Dropped off (Tústi)',
  'card.stamp.boarded': 'boarded {time}',
  'card.stamp.updated': 'updated {time}',
  'card.absent': 'Parent notified: {name} is absent',
  'card.absentWithReason': 'Parent notified: {name} is absent — {reason}',
  'card.callParent': 'Call {parent}, parent of {child}',

  // --- skip modal ----------------------------------------------------
  'skip.title': 'Skip the bus today',
  'skip.subtitle': 'Búgin barmaydı — the driver sees this straight away.',
  'skip.legend': 'Why is {name} not riding?',
  'skip.confirm': 'Tell the driver',

  // --- parent --------------------------------------------------------
  'parent.childrenOnBus': '{children} on Bus {number}',
  'parent.skip': 'Skip bus today',
  'parent.unskip': 'Riding after all',
  'parent.callDriver': 'Call driver',
  'parent.footer': 'Driver {name} · Bus {number} · {plate}',
  'parent.pin.home': 'Your stop',
  'parent.progress.firstStop': 'First stop',
  'parent.progress.school': 'School',
  'parent.progress.lastStop': 'Last stop',
  'parent.progress.schoolName': 'School #1',
  'parent.toast.boarded.title': 'Your child has safely boarded Bus {number}',
  'parent.toast.boarded.body': 'You can follow the bus on the map below.',
  'parent.toast.atSchool.title': 'Arrived at School #1',
  'parent.toast.atSchool.body': 'Your child is safely at school.',
  'parent.toast.droppedOff.title': 'Dropped off at your stop',
  'parent.toast.droppedOff.body': 'Your child is off the bus and home.',
  'parent.toast.nearly.title': 'Bus {number} is nearly at your stop',
  'parent.toast.nearly.body': 'Please be ready outside in about two minutes.',
  'parent.toast.skip.title': 'Driver notified',
  'parent.toast.skip.body': '{name} is marked absent for today.',

  // --- parent status slab --------------------------------------------
  'slab.onTheWay.kicker': 'Bus on the way',
  'slab.onTheWay.here': 'At your stop right now.',
  'slab.onTheWay.away': '{stops} away from {name}.',
  'slab.onBus.kicker': 'On board',
  'slab.onBus.title': '{name} is on Bus {number}',
  'slab.onBus.at': 'Boarded at {time}.',
  'slab.onBus.plain': 'Boarded.',
  'slab.onBus.home': 'Home in about {eta} min.',
  'slab.atSchool.kicker': 'At school',
  'slab.atSchool.title': '{name} is safely at school',
  'slab.atSchool.at': 'Arrived at {time}.',
  'slab.atSchool.plain': 'Arrived.',
  'slab.homeSafe.kicker': 'Home',
  'slab.homeSafe.title': '{name} is off the bus',
  'slab.homeSafe.at': 'Dropped off at {time}.',
  'slab.homeSafe.plain': 'Dropped off at your stop.',
  'slab.missed.kicker': 'Not on the return bus',
  'slab.missed.title': '{name} did not board',
  'slab.missed.body':
    'The bus has already passed your stop. Call the driver or the school now.',
  'slab.absent.kicker': 'Not riding today',
  'slab.absent.title': '{name} is marked absent',
  'slab.absent.plain': 'The driver has been told.',
  'slab.noTrip.kicker': 'No trip running',
  'slab.noTrip.atHome': '{name} is at home',
  'slab.noTrip.atSchool': '{name} is at school',
  'slab.noTrip.body': 'You will be alerted the moment Bus {number} sets off.',

  // --- admin ---------------------------------------------------------
  'admin.title': 'School #1 dispatch',
  'admin.subtitle': '{trip} · driver {name}',
  'admin.reset': 'Reset demo',
  'admin.kpi.buses': 'Buses on the road',
  'admin.kpi.enrolled': 'Children enrolled',
  'admin.kpi.safeArrivals': 'Safe arrivals this run',
  'admin.kpi.absent': 'Absent today',
  'admin.routeProgress': 'Route progress',
  'admin.filter.all': 'Everyone',
  'admin.filter.picked_up': 'On bus',
  'admin.filter.at_school': 'At school',
  'admin.filter.absent_today': 'Absent',
  'admin.col.child': 'Child',
  'admin.col.status': 'Status',
  'admin.col.stop': 'Stop',
  'admin.col.parent': 'Parent',
  'admin.col.updated': 'Updated',
  'admin.empty': 'No children in this view yet.',

  // --- map -----------------------------------------------------------
  'map.loading': 'Loading map…',
  'map.speed': '{speed} km/h',
} as const;

export type TranslationKey = keyof typeof en;

/** Shape every locale must fill completely. */
export type Dictionary = Record<TranslationKey, string>;
