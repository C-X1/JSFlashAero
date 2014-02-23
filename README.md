JSFlashAero
===========

A JavaScript Application for automatic display of new photos on Toshiba FlashAir Wifi SD-Cards

Install:

1. Copy folder JSFAERO to the SD_WLAN directory on your FlashAir Card
2. Edit your List.htm and add a Link to JSFAERO/INDEX.HTM
    
    Example:
    ```html
    <!--div id="cf" style="display:none;">-->
    <div id="cf">
    <a href="/SD_WLAN/CONFIG.htm"><img name="conf" src="" width="20" height="20"></a>
    <a href="/SD_WLAN/JSFAERO/INDEX.htm">JSFlashAero</a>
    </div>
    </div>
    </body></html>
    
    ```

Usage:

![screenshot](https://raw.github.com/cyborg-x1/JSFlashAero/develop/Screenshot.jpg)

1. Select the folder to be watched in the settings menu.
2. Close the settings menu with a click on the settings button
3. Click on Run and if a connection can be created to the card, it should download the latest JPG image
4. Click on Stop to make it stop doing that.

If you want to have fullscreen, press the fullscreen button. To leave the fullscreen mode, press the fullscreen button again or use the method of your browser (e.g. pressing ESC or the back button on your tablet).


