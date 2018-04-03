## How to use
1. Open surviv.io game tab in chrome or chromium
2. Press F12, you would see dev panel. Switch to "sources" tab on top.
3. On the left side column switch to the network tab and open folder "top/surviv.io/js/app.x.js" where x is any combination of symbols. Because code is heavy there may exists some lags.
4. Look at the down side and find "{}" symbol. Press it. Over time you must see new opened tab with a pretty viewed code.
5. Ok, select all the code (ctrl + a) and copy it to the sublime text editor (this editor shows the lines number).
6. Find the `case p.Msg.Update:` line. Look at the number of this line and remember.
7. Come back to the pretty view code (chrome). Scroll to the remembered line number. And click left side number of this line. Number of the line must switch to blue color.
8. Ok, start new solo game. Come back to the code, on the right side you must see "Paused on breakpoint". Below in the scope tab find variable `this`. Click it right mouse key, and choose "Store as global variable" in context menu.
9. In the console on the bottom you must see `temp1`.
10. Deactivate breakpoints and resume script execution (press ctrl + f8 and after press f8).
11. Write in the console `var game = temp1`. Then paste [this](https://raw.githubusercontent.com/w3x731/survivIoAim/master/survivIoAim.js) code.
12. In the console you may type `reload()` for launch aim and `stop()` for stops the aim.

Its must be worked. How to check script? Your person must automatically turn to the closest enemy.
Update: On mouse click(shoot), person may turn in the cursor position direction. Its a problem. Now you can shoot on space key.

If page has been updated, is necessary repeat this steps again.

All actions you take at your own risk. The author is not responsible for the consequences of your actions.