## How to install
### Installing Chrome/Chromium extension
1. Open `chrome://extensions/` in chrome or chromium.
2. Drag the [survivIoAimChromeExtension](https://github.com/w3x731/survivIoAim/tree/master/survivIoAimChromeExtension) (for aim) or [survivIoZoomChromeExtension](https://github.com/w3x731/survivIoAim/tree/master/survivIoZoomChromeExtension) (for zoom, now its not effectively cheat) folder into opened extension window.

When you start the game, just press `Z` key to enable cheat.

### Manual installation
1. Open surviv.io game tab in chrome or chromium.
2. Press `f12`, you would see dev panel. Switch to `Sources` tab on top.
3. On the left side column switch to the network tab and open folder `top/surviv.io/js/app.X.js` where `X` is any combination of symbols. Because code is heavy there may exists some lags.
4. Look at the down side and find `{}` button. Press it. Over time you must see new opened tab with a pretty viewed code.
5. Ok, select all the code `(ctrl + a)` and copy it to the sublime text editor (this editor shows the lines number).
6. Find the `case p.Msg.Update:` line. Look at the number of this line and remember.
7. Come back to the pretty view code (in browser). Scroll to the remembered line number. And click left side number of this line. Number of the line (or line below) must switch to blue color.
8. Ok, start new solo game. Come back to the code, on the right side you must see `Paused on breakpoint`. Below in the scope tab, click `Local` and find variable `this`. Click it right mouse key, and choose `Store as global variable` in a context menu.
9. In the console on the bottom you must see `temp1`.
10. Deactivate breakpoints and resume game script execution (press `ctrl + f8` and after press `f8`).
11. Write in the console `var game = temp1`. Then paste [this](https://github.com/w3x731/survivIoAim/blob/master/survivIoAim.js) code if you need aim + zoom or [this](https://github.com/w3x731/survivIoAim/blob/master/survivIoZoom.js) code if you need only zoom (now its not effectively cheat).
12. In the game, press `Z` for enable or disable script.

Its must be worked. How to check? Your person must automatically turn to the closest enemy.  
If page has been updated, is necessary repeat this steps again.  
You may create and join in rooms without updating page. If you wnat to join in room, in the game main menu paste the link on the room into browser address bar and press enter. In my case, page not updating, i see room and not need repeat above steps again.

Update: You can shoot on space key.  
Update: Press O key for enable/disable "capture mode". In this mode if you have more than one enemy near you, its switch to closest enemy one time (capture) and will accompany him while the enemy not escaped or injured.  

Update: Simple [patcher](https://github.com/w3x731/survivIoAim/tree/master/patcher) for game client added. How to use (need Node.js):
1. [Download](https://github.com/w3x731/survivIoAim/archive/master.zip) this repo.
2. In cmd, move into [patcher](https://github.com/w3x731/survivIoAim/tree/master/patcher) folder and type `npm install`.
3. Move game client `app.X.js` into [app](https://github.com/w3x731/survivIoAim/tree/master/app) folder.
4. Configure the `index.js` file (variable `appPrint` must contain a `X` string from `app.X.js` file name) and in cmd type `node index.js`. Its automatically update chrome extension files (replace the game client lines and move patched file into extensions path).
5. Install the cheat again.

All actions you take at your own risk. The author is not responsible for the consequences of your actions.

---
## Руководство на русском языке
### Установка расширения для Chrome/Chromium
1. Откройте окно расширений перейдя по ссылке `chrome://extensions/`.
2. Перетащите папку [survivIoAimChromeExtension](https://github.com/w3x731/survivIoAim/tree/master/survivIoAimChromeExtension) (для аима) или [survivIoZoomChromeExtension](https://github.com/w3x731/survivIoAim/tree/master/survivIoZoomChromeExtension) (для зума, в данный момент не эффективен) в открытое окно расширений.

Когда вы начнете игру, нажмите клавишу `Z` чтобы включить чит.

### Установка вручную
1. Откройте surviv.io в браузере Google Chrome или Chromium.
2. Нажмите клавишу `f12`, откроется панель разработчика. В панели сверху есть вкладка `Sources` переключите на нее.
3. В колонке слева переключите на вкладку `Network` и выберите путь `top/surviv.io/js/app.X.js`. Осторожно, возможны небольшие лаги.
4. Посмотрите вниз, найдите кнопку `{}` и нажмите на нее. Через некоторое время откроется новая вкладка с кодом.
5. Выделите весь код (ctrl + a) и скопируйте в текстовый редактор sublime text (или любой другой редактор, отображающий номера строк).
6. С помощью поиска найдите строчку `case p.Msg.Update:`. Запомните номер этой строки.
7. Вернитесь назад в браузер. Пролистайте код до номера строки из шага 6. Нажмите на номер этой строки (после нажатия, номер той строки на которую вы нажали или номер строки ниже должен стать помеченным синим флажком).
8. Теперь переключитесь в окно игры, нажмите `Играть соло` и вернитесь назад в панель разработчика. В колонке справа, вверху вы увидите `Paused on breakpoint`. Чуть ниже есть вкладка `Scope`. Откройте ее, нажмите `Local` и найдите переменную `this`. Нажмите на переменную правой кнопкой мыши и выбирите `Store as global variable` в контекстном меню.
9. В консоли снизу вы увидите `temp1`.
10. Выключите точки останова и возобновите выполнение скрипта (нажмите `ctrl + f8` а затем `f8`).
11. Напишите в консоли `var game = temp1`. Затем вставьте [этот](https://github.com/w3x731/survivIoAim/blob/master/survivIoAim.js) код, если вам нужен аим + зум или [этот](https://github.com/w3x731/survivIoAim/blob/master/survivIoZoom.js) код, если вам нужен только зум (на данный момент не эффективен).
12. После чего нажмите `Enter`. Во время игры нажмите клавишу `Z` для включения/отключения скрипта.

Как проверить работу скрипта? Персонаж которым вы играете, должен автоматически поворачиваться в направлении противника как только он приблизится к вам (если вы используете аим).  
Если вы используете ручной режим установки и после установки вы обновите страницу с игрой, все шаги придется повторить. Но, вы можете переходить по комнатам просто вставив ссылку и нажав enter, так как вкладка не будет обновляться. Кроме того вы можете создать комнату или присоединиться к комнате без обновления страницы. Если вы хотите присоединиться к комнате, в главном меню игры вставьте ссылку на комнату и нажмите enter. В моем случае, страница не обновляется, я вижу комнату и после запуска игрового процесса не нуждаюсь в повторении описанных выше шагов ручной установки снова.

Обновление: Кроме кнопки мыши, стрелять можно нажав на пробел.  
Обновление: Чтобы включить/отключить режим захвата, нажмите клавишу O. В этом режиме, если рядом с вами находится более одного противника, происходит "захват" ближайшего к вам противника и сопровождение его, пока он не покинет область видимости или не будет ранен (даже если рядом с вами будет находиться другой противник).  

Обновление: Добавлен простой [патчер](https://github.com/w3x731/survivIoAim/tree/master/patcher) клиента игры. Как использовать (нужен Node.js):
1. [Скачайте](https://github.com/w3x731/survivIoAim/archive/master.zip) этот репозиторий.
2. В командной строке переместитесь в папку [patcher](https://github.com/w3x731/survivIoAim/tree/master/patcher) и напишите `npm install`.
3. Положите клиент игры `app.x.js` в папку [app](https://github.com/w3x731/survivIoAim/tree/master/app). Чтобы получить клиент, надо повторить шаги с 1 по 3 из инструкции по ручной установке.
4. В файле `index.js` есть переменная `appPrint`. Присвойте этой переменной значение `X` из имени файла `app.X.js` (`X` это строка из 8 символов) и напишите `node index.js`. Скрипт автоматически обновит файлы расширений Chrome (заменит строки в клиенте игры и переместит пропатченный клиент в папки расширений).
5. Установите чит по новой.

Все действия описанные в этой инструкции вы выполняете на свой страх и риск. Автор не несет ответственности за последствия ваших действий.