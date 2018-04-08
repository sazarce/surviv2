## How to use
1. Open surviv.io game tab in chrome or chromium.
2. Press F12, you would see dev panel. Switch to "Sources" tab on top.
3. On the left side column switch to the network tab and open folder "top/surviv.io/js/app.x.js" where x is any combination of symbols. Because code is heavy there may exists some lags.
4. Look at the down side and find "{}" button. Press it. Over time you must see new opened tab with a pretty viewed code.
5. Ok, select all the code (ctrl + a) and copy it to the sublime text editor (this editor shows the lines number).
6. Find the `case p.Msg.Update:` line. Look at the number of this line and remember.
7. Come back to the pretty view code (in browser). Scroll to the remembered line number. And click left side number of this line. Number of the line (or line below) must switch to blue color.
8. Ok, start new solo game. Come back to the code, on the right side you must see "Paused on breakpoint". Below in the scope tab, click "Local" and find variable `this`. Click it right mouse key, and choose "Store as global variable" in context menu.
9. In the console on the bottom you must see `temp1`.
10. Deactivate breakpoints and resume game script execution (press ctrl + f8 and after press f8).
11. Write in the console `var game = temp1`. Then paste [this](https://github.com/w3x731/survivIoAim/blob/master/survivIoAim.js) code if you need aim + zoom or [this](https://github.com/w3x731/survivIoAim/blob/master/survivIoZoom.js) code if you need only zoom.
12. In the game, press Z for enable or disable script.

Its must be worked. How to check? Your person must automatically turn to the closest enemy.  
If page has been updated, is necessary repeat this steps again.  
You may create and join in rooms without updating page. If you wnat to join in room, in the game main menu paste the link on the room into browser address bar and press enter. In my case, page not updating, i see room and not need repeat above steps again.

Update: You can shoot on space key. **For me still unclear a fact, that sometimes when aim is used and player shoot on a left mouse key in the enemy, the bullet can fly on the other side. For automatic guns are first bullet may fly in the other side and rest bullets flying in enemy.**  
Update: ~4x zoom by default.  
Update: Press Z key for enable/disable script. Tune `forecastCoeff` variable for more accurate shooting (0 - Infinity).  
Update: Press O key for enable/disable "capture mode". In this mode if you have more than one enemy near you, its switch to closest enemy one time (capture) and will accompany him while the enemy not escaped or injured.

All actions you take at your own risk. The author is not responsible for the consequences of your actions.

---
## Руководство на русском языке
1. Откройте surviv.io в браузере Google Chrome или Chromium.
2. Нажмите клавишу f12, откроется панель разработчика. В панели сверху есть вкладка "Sources" переключите на нее.
3. В колонке слева переключите на вкладку "Network" и выберите путь "top/surviv.io/js/app.x.js". Осторожно, возможны небольшие лаги.
4. Посмотрите вниз, найдите кнопку "{}" и нажмите на нее. Через некоторое время откроется новая вкладка с кодом.
5. Выделите весь код (ctrl + a) и скопируйте в текстовый редактор sublime text(или любой другой редактор, отображающий номера строк).
6. С помощью поиска найдите строчку `case p.Msg.Update:`. Запомните номер этой строки.
7. Вернитесь назад в браузер. Пролистайте код до номера строки из шага 6. Нажмите на номер этой строки (после нажатия, номер той строки на которую вы нажали или номер строки ниже должен стать помеченным синим флажком).
8. Теперь переключитесь в окно игры, нажмите "Играть соло" и вернитесь назад в панель разработчика. В колонке справа, вверху вы увидите "Paused on breakpoint". Чуть ниже есть вкладка "Scope". Откройте ее, нажмите "Local" и найдите переменную `this`. Нажмите на переменную правой кнопкой мыши и выбирите "Store as global variable" в контекстном меню.
9. В консоли снизу вы увидите `temp1`.
10. Выключите точки останова и возобновите выполнение скрипта (нажмите ctrl + f8 а затем f8).
11. Напишите в консоли `var game = temp1`. Затем вставьте [этот](https://github.com/w3x731/survivIoAim/blob/master/survivIoAim.js) код, если вам нужен аим + зум или [этот](https://github.com/w3x731/survivIoAim/blob/master/survivIoZoom.js) код, если вам нужен только зум.
12. После чего нажмите enter. Во время игры нажмите клавишу Z для включения/отключения скрипта.

Как проверить работу скрипта? Персонаж которым вы играете, должен автоматически поворачиваться в направлении противника как только он приблизится к вам (если вы используете аим).  
Если вы обновите страницу, все шаги придется повторить. Но, вы можете переходить по комнатам просто вставив ссылку и нажав enter, так как вкладка не будет обновляться.
Вы можете создать комнату или присоединиться к комнате без обновления страницы. Если вы хотите присоединиться к комнате, в главном меню игры вставьте ссылку на комнату и нажмите enter. В моем случае, страниа не обновляется, я вижу комнату и после запуска игрового процесса не нуждаюсь в повторении описанных выше шагов снова.

Обновление: Кроме кнопки мыши, стрелять можно нажав на пробел. **Иногда, во время стрельбы с использованием аима рядом с противником с помощью левой кнопки мыши, первая пуля может полететь в направлении курсора, а не в сторону врага. Но в большинстве случаев стрельба левой кнопкой мыши с использованием аима работает корректно.**  
Обновление: Если у вас нет зума выше 2x, вы видете немного дальше.  
Обновление: Чтобы включить/отключить скрипт, нажмите клавишу Z. Присваивая переменной `forecastCoeff` различные значения (от 0 до бесконечности) можно добиться увеличения количества попаданий при стрельбе.  
Обновление: Чтобы включить/отключить режим захвата, нажмите клавишу O. В этом режиме, если рядом с вами находится более одного противника, происходит "захват" ближайшего к вам противника и сопровождение его, пока он не покинет область видимости или не будет ранен (даже если рядом с вами будет находиться другой противник).

Все действия описанные в этой инструкции вы выполняете на свой страх и риск. Автор не несет ответственности за последствия ваших действий.