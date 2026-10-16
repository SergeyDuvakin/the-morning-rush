# «ДАВКА ДО РАБОТЫ» — прогресс MVP (чек-лист GDD §16)

Тесты: `test/shots.js` (playwright-core + Chrome, 844×390@3x и 740×360@2x), `test/fps.js`, `test/dbg.js`. Сервер: `python3 -m http.server` в папке.

| # | Пункт | Статус | Проверка |
|---|---|---|---|
| 1 | Каркас: 2 канваса (пиксели + текст в реальном DPR), целый апскейл по высоте 216, ширина плавает; фикс экрана Telegram (max высот без нулей, resize→bool, viewportChanged/fullscreenChanged/safeArea*/resize/orientationchange + 50/300/800 мс), expand + requestFullscreen + lockOrientation, safe areas, экран «Поверни телефон» | ✅ | 844×390 → 507×234 ×5; 740×360 → 494×240 ×3; портрет → экран поворота, возврат в ландшафт ок |
| 2 | Ввод: плавающий стик слева, жесты справа (тап/свайпы/удержание), кнопки СУПЕР (≥64 css) и пауза (≥44 css), клавиатура для отладки | ✅ (жесты проверены только клавиатурой/кликами в headless) | |
| 3 | Фикс. шаг/сид для призраков | ⏳ перенесено в v1.1 вместе с призраками | |
| 4 | Герой Серёга: серия 1-2-3, прыжок + удар в воздухе, подкат, рывок-локоть, вертушка-рюкзак, супер «Кофейный плевок», урон/падение/KO | ✅ | |
| 5 | Камера, арены-стопы, «Осторожно, двери закрываются», параллакс; вагон изнутри с дверями | ✅ | |
| 6 | Бой: хитстоп, тряска, частицы, «ХРЯСЬ/БАМС», сквош-стретч, рельсы «УЕХАЛ», вибро | ✅ | |
| 7 | Враги MVP: 14 типов (Можно пройти? с кнопкой «ДА», сумка-щит, тётка-вертушка с баулом, музыкант-ноты, курьер-таран, спящий, школота, семечки, стажёр-свисток, мама с коляской (бить нельзя), студенты, кот, кривляка-повторюша, статуя, турист) | ✅ | |
| 8 | Оружие/пикапы: зонт, кофе-плевок, самокат, батон, баул (бросок-кегли), сковородка; пирожок, шаурма (икота), кофе, энергетик, жетоны | ✅ | |
| 9 | Комбо: счётчик ×1…×4, «НЕПЛОХО/ДАВКА/ЗАКРЫВАЙ ДВЕРИ/КОНЕЧНАЯ», именные: Кегли, Вежливый, Локоть→рюкзак→двери, Банановое домино | ✅ | |
| 10 | 24 уровня веток 1–3, у каждого своя фишка из §17 | ✅ все 24 запускаются без ошибок | скриншоты L*.png |
| 11 | Боссы: Бабушка-танк (двери/поручни/соленья), Турникет-мутант (линии + зелёная стрелка + проездные), Контролёр (компостер/головокружение/стажёры/жетон-штраф) | ✅ | B*.png |
| 12 | Режим «Пробиться к выходу» (толпа, толкание, подныривание, таймер, цепочка, все 300+ станций полной карты) | ✅ | X_exit.png |
| 13 | HUD (сердечки, табло-бегущая строка, очки, комбо), меню, своя схема веток, панель станции, выбор героя | ✅ | |
| 14 | Катсцены на движке + «Пропустить», тап = ×2: интро-будильник, вход в метро, выход босса ×3, переходы веток ×2, гэги победы ×4 / поражения ×3, открытие Бабки | ✅ | |
| 15 | Аудио: чиптюн-синт, 4 темы, 15 SFX; диктор субтитрами | ✅ (озвучки голосом нет) | |
| 16 | Хаптики TG + navigator.vibrate, BackButton, цвета хедера | ✅ | |
| 17 | Сейв localStorage + CloudStorage (берётся сейв с большим числом звёзд) | ✅ | |
| 18 | Квесты дня (12 типов, 3 в день по МСК), звёзды (пройти / <½ урона / по времени), жетоны, Бабка открывается после Бабушки-танка | ✅ | |
| 19 | Пасхалки MVP: 7 тапов по логотипу (кот Метрофан), 1 апреля усы, 3:00 ночи Липтон-лужа, Шмякс на «Унитортитете» | ✅ | |
| 20 | Тесты: 0 ошибок JS на обоих размерах, 60 fps в 3 нагруженных уровнях | ✅ | |
| 21 | Полировка «конфетка»/баланс | ⏳ нужен прогон на телефоне | |
| 22 | Обложка, тексты BotFather, релиз | ⏳ | |

## Polish pass v2 (2026-10-15)
- FIXED: enemy stuck in 'fly' forever (KO by a hit with kz=0 → never landed) → min vz 90, landing safety check, clamp to the arena.
- FIXED: enemy with hp<=0 stuck in 'down' (repeated hits reset the timer) → forced KO after 1.6 s.
- FIXED: earlier — cats/peaceful counted as live enemies, pass/mom clamp, props without T, poet guard, boss arena trigger.
- BALANCE: Babatank ram/scream 2 → 1.5 damage.
- DEPTH: parallax far/mid/near, foreground columns/heads, Y-sort + depth scale, soft shadows, perspective floor, lamp cones, AO, fog, vignette, camera look-ahead. Sheets have shadows.
- REMAINING: bot playall: wins on 0,2,3,4,9,12,14; timeouts/losses on later levels (bot is weak; possible remaining stuck enemies on 1,6,13,15,17,18,22).

## Polish pass v3 (2026-10-15, 15:00–16:00 MSK)
Bugs fixed:
- Corpse juggling: hitting an already-KO'd enemy put it back into fly/down forever → dmgEnemy ignores koed; koed enemies are forced into 'ko'.
- Sofa twist (Диваномо) crashed every frame once the arena unlocked (camLock null) → the whole update froze, level unfinishable. Sofa now drives off-screen.
- G.win was not reset in startLevel (the won-flag bug in the test logs).
- Turnstile/bosses: hit reach didn't account for the large body → +12 px reach vs bosses.
- Babatank: the doors trap only during a 1 s "closing" window → now while doors are not closed, plus a 25% chance of a jam on any wall hit.
- The new "pie on the bench" was placed outside the arena (unreachable) → x0+40.
- Аэроторт: the departures board overlapped the station sign label → labels under the board are hidden.
- Pause: world labels (ads, tutorial) showed on top of the pause menu → cleared.
- Boss intro cutscene: empty HUD ticker box → HUD hidden during the cut.
- Foreground columns: overlay text (ads/signs) showed through the column → labels with >30% overlap are hidden.
- Sock on head in the intro: was floating above the head → sits on the head now (SOCK_Y).
- Game errors in loop() are now collected in window.__errs (the tests read them).
Balance:
- Difficulty d=w*7+i: enemy dmg ×(1+0.008d) (×0.85 for d<3), hp ×(1+0.01d), spd ×(1+0.012d), attack cd /√k.
- Enemies per wave 2+min(2,d/6) (was up to 5).
- Courier: dmg 2→1.5, charge windup 0.35→0.6 s.
- Pity drop: pie at 35% chance if HP<40% and there's no pie on the field. Pie on the bench before the 3rd arena on lines 2–3.
- Bosses: Babatank 46→36 hp, chip damage outside the jam 30→50%; Turnstile 40→70; Controller 50→100.
Test bot v2 (test/bot_inject.js): dodges windups/charges/projectiles, dashes away from melee, hides behind the handrail during the scream, lures Babatank into the doors, eats pies when HP is low, picks up weapons, doesn't hit corpses, "aggro mode" against dodge deadlocks.
Tools: test/diag.js (parallel run of levels + damage-source log), test/runall.sh, test/cost.js (render cost).
Perf: 60 fps headless; render 1.5–5.8 ms/frame at DPR3 (desktop CPU).
- Bot regression after v3: 48/48 wins over 2 full runs (24 levels × 2), HP margin: line 1 11–12/12, line 2 6.5–12, line 3 3.6–11. No timeouts, 0 JS errors. Screenshots v3_* at 4 sizes (144 total), no errors.
## v4 trip redesign (started 19:05)
- FIXED: G.cutDone not reset in startLevel (level-1 end softlock after retry). Sound/vibration on pause are now labelled text toggles.
- Trip mode «Успей и Втиснись» implemented (src/trip.js core, trip_draw.js HUD/render, zone_gate.js, zone_esc.js, zone_platcar.js, zone_passage.js, trip_ui.js cuts/result/map/hooks). Old fight levels are no longer reachable from the menu (code kept).
- Zones: gate (lanes/queues, cutting in, «Проходите», pass/token/kassa incl. debt, coffee vending, metal detector, turnstile-mutant), esc (escalator lanes + stairs), passage (kiosks, musician ring, walkway, repairs, service shortcut, lost&found, vending, head-on flow), plat (train cycle, doors, squeeze, short train, babatank slipstream, columns), car (seat hunt, poles/corner, sway, stops, give seat, exit on your stop/overshoot, terminal sleep→depot, gangway egg, controller), exitz (oncoming, rain), escape (20 s «Пробиться»).
- Unlocks by points: ST_THR[k]=round((280k+10k²)/10)*10; locations tied to intro stations (LOC); map shows unlock curve + next station/location. Old-save migration keeps previously opened stations open.
- Perf: text-label cache (core.txt), cached perspective floor (world.persFloor), cached hall wall strip → render 0.3–0.6 ms/frame (was 10–15 ms headless).
- Fixes during testing: queue joiners walking in from the left blocked the hero (now join only on arrival); hero not pinned in queue; transfers added to stations 11/13 so head-on & service appear on their intro station; HUD layout for narrow screens (wallet under scandal bar, msg in hint row); gawker bubbles replaced by phone icons; CUT reset on startTrip.
- Tests: test/trip_bot.js, trip_run.js, trip_all.sh (24 stations ×N), units.js (37 forced-mechanic checks), regress.js (menus/flows/economy/save/rotate/perf, 65 checks), progress.js (fresh save → all 24 unlocked without cheats), trip_shots.js.
- (19:55) Fixes: 4-lane gates removed (rails trapped hero at TX-14) + noSolid while passing turnstile; flow NPCs steer to repairs gap and squeeze through when stuck (wd in passage@12); bot approaches top-wall targets along the with-flow side; map МЕНЮ moved into header. NEXT: verify wd12, then final full regression (trip_all ×2, units, regress ×4 sizes, progress), shots, zip.
- (20:05) Final run: units 37/37; trip_all 48/48 wins, 0 watchdog, 0 errors (4 sizes). NEXT: regress ×4 sizes + progress.
- (20:17) regress 65/65 at 844x390, 740x360, 932x430, 667x375; progress from fresh save: all 24 open after 24 trips, 0 mismatches. NEXT: shots + zip.
- (20:25) Built /workspace/davka_v3.zip; best shots in shots/best/. DONE.
## v3.1 playtest fixes (22:30)
- Шаги 1–3: заставка (флаг intro31 + кнопка ЗАСТАВКА), новое меню (ИГРАТЬ / ОБУЧЕНИЕ / ПРОБИТЬСЯ / КОШЕЛЁК / ЗАСТАВКА), минимальный HUD (часы, строка цели), фиксированный джойстик + камера со сдвигом −W/4.
- Шаг 4–5: вагон медленнее (ride 28+, 2–3 остановки, предупреждение «!» за 1.6 с, медленные конкуренты в начале, подсветка мест/поручней); толпа ×1.3 и рост по веткам 2–3.
- Обучение (learn.js): 12 шагов, ждёт выполнения, без 09:00, кнопка ПРОПУСТИТЬ, повтор из меню.
- Экономика (econ.js): полоска кошелька с иконками, касса = 4 карточки, страница КОШЕЛЁК.
- Карта (map31.js): пиксельная схема, замки+очки, пульс «ТЫ ТУТ», звёзды, поезд и голубь, карточка станции.
- 23:40 Тесты v31.js (29 проверок: меню, кошелёк, касса, обучение ботом, карта, концовки) — 29/29. Фиксы: «Проходите!» вставлял героя на место проходящего (сирота в очереди) → вставка за благодетелем + страж сироты; жёсткий сторож по времени зоны; unstick в очереди ставит героя прямо к турникету.
- 00:15 Матрица (фон, /tmp/m31): units 37/37, regress 844 65/65, v31 844/740 29/29; trip_all 45/48 побед, 3 таймаута теста (11,16,21 — не застревание, tLeft>0, нагрузка ЦП) → лимит trip_run 420 с, перепрогон.
- 01:00 progress (свежий сейв, 24 поездки): все 24 открыты, MISMATCH 0, ERRS 0. regress 844/740/932 65/65, 667 63/65 (escape idle — флейк под нагрузкой, отдельно воспроизводится чисто) → перепрогон 667 и станций 11,16,21 в фоне.
- 01:05 Перепрогон: regress 667×375 65/65; станции 11,16,21 ×2 — 6/6 побед, wd 0, ERRS 0. Итог: матрица чистая. Сборка davka_v3_1.zip.
## v3.2 (started 12:12)
- 12:14 v3.2 edits done (ВОЙТИ+центр-метр, TX левее, SIGN_Y, wrapFlow/free, кнопки в углу 0.72). test/v32.js 14/14 @844. Матрица: bash test/matrix32.sh → /tmp/m32
- 12:40 +short train (shX) +esc distinct labels (swap); v32 16/16@740. Перезапуск матрицы /tmp/m32
- 12:50 v3.2 targeted: v32 16/16 ×4 sizes, units 37/37, v31@844 29/29 (learn bot 12/12), trips st5(guard),st9(short),st12@667 win wd0 ERRS0. Полная матрица остановлена по просьбе. Zip davka_v3_2.zip.
