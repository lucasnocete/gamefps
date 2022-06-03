# Game fps - 2D Multiplayer Game NodeJS

Game FPS is a game 2D Canvas, Multiplayer Real Time with NodeJS

Developed with [NuxT JS](https://nuxtjs.org/) and [Colyseus](https://www.colyseus.io/)

![Demo Game](https://raw.githubusercontent.com/lucasnocete/gamefps/master/demo/game.gif)

## Usage
To use you need to start the front and server.

Front was developed with NuxtJS easy for those who know VueJS.

The Server was chosen Colyseus for its ease of use on the front and server.

## Usage Front
```bash
cd front
npm install

# serve with hot reload at localhost:3000
npm run dev 

# build for production and launch server
npm run build
npm run start
```

## Usage Server
```bash
cd server
npm install

# serve with hot reload at localhost:2567
npm run dev

# build for production and launch server
npm run build
npm run start
```


## Game functions
The player can move, shoot and block shots with bricks, he has five shots every five seconds.

## Game comands
W A S D = MOVE

Mouse Left Click = Shoot

Space = Brick to block shoots


## License
[MIT License](https://choosealicense.com/licenses/mit/)

Copyright (c) [2022] [Lucas Nocete]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.