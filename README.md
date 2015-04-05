# JiboCode
Jibo Code Challenge

Code challenge for Jibo application

The basic structure is a mult-panel interface, with buttons/display sliding on/off as needed. Hit Play Checkers to begin, Hide Checkers to quit/reset. Follow onscreen instructions to play. Press Pause/Resume to control gameflow. While game is running (not paused), walking sfx will play on a loop. When you win/lose, you will hear a win/lose sound, and the screen will turn green/red. Hit Hide Checkers to reset and play again.

During development, I noticed that the more times the module was reloaded automatically by gulp (when saving changes in .js/.css/.html files), the more likely it was to throw a console error stating "Uncaught Error: jquery not yet loaded for context". When this happens, the end-game color fade does not execute. I noticed the problem tends to go away (sometimes) when reloading the page by retyping the URL (or my 'localhost:9000' bookmark). I tried several versions of the define()/require() parameters at the top of the module, but was unable to figure out what was going wrong. I'd need more platform experience to figure it out.

I intend to work on Floyd's Algorithm in my free time, because it looks fun. However, I may not have it finished by Monday.

Thanks, Jon
