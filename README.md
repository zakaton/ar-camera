# AR Camera ([Video](https://twitter.com/ConcreteSciFi/status/1616473215727185922?s=20))

1. install [visual studio code](https://code.visualstudio.com/)
2. install [node](https://nodejs.org/en)
3. create the certificates:  
On macOS:
  For the security stuff, run the command in the terminal:  
    `sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./sec/server.key -out ./sec/server.crt`  
   Windows is the same but without `sudo`, if you have openssl installed
4. run `npm install` in the terminal
5. run `npm start` in the terminal
6. open `http://localhost/` on your desktop and you should see a webpage with links to `desktop` and `quest`, where you'll be opening `desktop` on your desktop, and `quest` on your quest
7. to open this webpage on your quest, you must find the ip address of your desktop (that's running the server), e.g. 123.456.7.89, go to chrome://flags in the quest browser, go to "Insecure origins treated as secure", and type in that ip address as a link (https://123.456.7.89). After you refresh go to that ip address (https://123.456.7.89), go through the warning page (it'll say it's insecure or something) and click on the "quest" link.
8. on your desktop, go to the "desktop" link and in another tab open the [Oculus Casting page](https://www.oculus.com/casting/) to receive video/audio from the quest pro. On the quest pro enable casting so you can cast it to your desktop, and you should see it on your desktop.
10. Now you'll get the quest pro's video/audio on your desktop, but you need to use the audio as a virtual microphone for your desktop so you can use the "desktop" webpage's speech recognition. For this, you'll need to use your desktop's audio as a virtual microphone (i use Loopback on Mac, but for Windows it might be easier - maybe try [this link](https://www.howtogeek.com/39532/how-to-enable-stereo-mix-in-windows-7-to-record-audio/)). Once you've done that, refresh the "desktop" page and click the "share screen" button, select the Oculus Casting webpage (make sure it's fullscreen), and enable audio so you can capture your desktop's audio. On the "desktop" page you should now see the Oculus Casting webpage screen capture, and if you speak on the Quest Pro, you should see subtitles on the Quest Pro.
