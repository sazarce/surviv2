## How to install
### Installing Chrome/Chromium extension
1. [Download](https://github.com/w3x731/survivIoAim/archive/master.zip) this repo and extract it.
2. Open `chrome://extensions/` in chrome or chromium.
3. Drag and drop the [survivIoAimChromeExtension](https://github.com/w3x731/survivIoAim/tree/master/survivIoAimChromeExtension) folder from the downloaded repo into opened extension window.

When you start the game, just press `Z` key to enable cheat. Your person must automatically turn to the closest enemy.  

Update: You can shoot on space key.  
Update: Press O key for enable/disable "capture mode". In this mode if you have more than one enemy near you, its switch to closest enemy one time (capture) and will accompany him while the enemy not escaped or injured.  

Update: Simple [patcher](https://github.com/w3x731/survivIoAim/tree/master/patcher) for game client added. Now, if a new game client released and cheat not working, just doing this steps. How to use (need Node.js):
1. [Download](https://github.com/w3x731/survivIoAim/archive/master.zip) this repo.
2. In cmd, move into [patcher](https://github.com/w3x731/survivIoAim/tree/master/patcher) folder and type `npm install`.
3. Move game client `app.X.js` into [app](https://github.com/w3x731/survivIoAim/tree/master/app) folder (how to get game client? open `surviv.io` site. Press `f12` and move to the `Sources` tab. On the left side, click the `js` folder and find `app.X.js`, where `X` is sybol string).
4. Configure the `index.js` file (variable `appPrint` must contain a `X` string from `app.X.js` file name) and in cmd type `node index.js`. Its automatically update chrome extension files (replace the game client lines and move patched file into extensions path).
5. Install the cheat again.

All actions you take at your own risk. The author is not responsible for the consequences of your actions.

---
## Руководство на русском языке
### Установка расширения для Chrome/Chromium
1. [Скачайте](https://github.com/w3x731/survivIoAim/archive/master.zip) этот репозиторий и распакуйте его.
1. Откройте окно расширений перейдя по ссылке `chrome://extensions/`.
2. Перетащите папку [survivIoAimChromeExtension](https://github.com/w3x731/survivIoAim/tree/master/survivIoAimChromeExtension) из скачанного репозитория в открытое окно расширений.

Когда вы начнете игру, нажмите клавишу `Z` чтобы включить чит. Как проверить работу скрипта? Персонаж которым вы играете, должен автоматически поворачиваться в направлении противника как только он приблизится к вам (если вы используете аим).  

Обновление: Кроме кнопки мыши, стрелять можно нажав на пробел.  
Обновление: Чтобы включить/отключить режим захвата, нажмите клавишу O. В этом режиме, если рядом с вами находится более одного противника, происходит "захват" ближайшего к вам противника и сопровождение его, пока он не покинет область видимости или не будет ранен (даже если рядом с вами будет находиться другой противник).  

Обновление: Добавлен простой [патчер](https://github.com/w3x731/survivIoAim/tree/master/patcher) клиента игры. Теперь, если выйдет новый клиент игры и чит не будет работать, клиент можно пропатчить самому. Как использовать (нужен Node.js):
1. [Скачайте](https://github.com/w3x731/survivIoAim/archive/master.zip) этот репозиторий.
2. В командной строке переместитесь в папку [patcher](https://github.com/w3x731/survivIoAim/tree/master/patcher) и напишите `npm install`.
3. Положите клиент игры `app.X.js` в папку [app](https://github.com/w3x731/survivIoAim/tree/master/app). Чтобы получить клиент, надо перейти на сайт игры, нажать `f12`, в открывшемся окне перейти на вкладку `Sources`. Слева есть папка `js` в которой лежит файл вида `app.X.js` где `X` строка.
4. В файле `index.js` есть переменная `appPrint`. Присвойте этой переменной значение `X` из имени файла `app.X.js` (`X` это строка из 8 символов) и напишите `node index.js`. Скрипт автоматически обновит файлы расширений Chrome (заменит строки в клиенте игры и переместит пропатченный клиент в папки расширений).
5. Установите чит по новой.

Все действия описанные в этой инструкции вы выполняете на свой страх и риск. Автор не несет ответственности за последствия ваших действий.