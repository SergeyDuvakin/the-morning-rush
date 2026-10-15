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
