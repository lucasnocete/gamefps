<template>
    <main>
        <canvas
            id="canvas"
        />
    </main>
</template>

<script>
export default {
    layout: 'site/game',
    data() {
        return {
            canvas: null,
            ctx: null,
            Keys: {
                up: false,
                down: false,
                left: false,
                right: false
            },
            width: 1700,
            height: 900,
            sessionId: null,
            room: null,
            speed: 38,
            boxCount: 20,
            boxSize: this.width / this.boxCount - 2,
            boxX: 10,
            boxY: 10,
            players: [],
            blocks: [],
            shoots: [],
            bg: null,
            brick: null,
            characters: {},
            moving: 0,
            direction: '',
            waiting: true
        };
    },
    watch: {
        Keys: {
            handler(val) {
                const myIndex = this.getMyIndexPlayers();

                if (this.Keys.right) { //d
                    this.players[myIndex].direction = 'right'
                }

                if (this.Keys.down) { //s
                    this.players[myIndex].direction = 'down'
                }

                if (this.Keys.left) { //a
                    this.players[myIndex].direction = 'left'
                }

                if (this.Keys.up) { //w
                    this.players[myIndex].direction = 'up'
                }

                if (this.Keys.up && this.Keys.right) { //w/d
                    this.players[myIndex].direction = 'upRight'
                }

                if (this.Keys.up && this.Keys.left) { //w/d
                    this.players[myIndex].direction = 'upLeft'
                }

                if (this.Keys.down && this.Keys.right) { //w/d
                    this.players[myIndex].direction = 'downRight'
                }

                if (this.Keys.down && this.Keys.left) { //w/d
                    this.players[myIndex].direction = 'downLeft'
                }

                if (this.Keys.up || this.Keys.down || this.Keys.left || this.Keys.right) {
                    this.players[myIndex].moving = true;
                }

                if (!this.Keys.up && !this.Keys.down && !this.Keys.left && !this.Keys.right) {
                    this.players[myIndex].moving = false;;
                }

                this.move();
            },
            deep: true
        }
    },
    async mounted() {

        try {
            let client = new Colyseus.Client(this.$config.ws);

            try {

                this.room = await client.joinOrCreate("MyRoom");
                this.sessionId = this.room.sessionId;
            }
            catch(e) {
                console.log(e);
            }

            this.room.onMessage("roomData", (data) => {

                console.log(data);

                this.waiting = data.waiting;
                this.maxClientes = data.maxClients;
            });

            this.room.onMessage("refreshPlayers", (data) => {

                this.players = data;
            });

            this.room.onMessage("limitaPlayer", (data) => {

                for (let i = 0; i < this.players.length; i++) {

                    if (data.id === this.players[i].id) {
                        this.players[i].x = data.x;
                        this.players[i].y = data.y;
                    }
                }
            });

            this.room.onMessage("movePlayer", (data) => {

                for (let i = 0; i < this.players.length; i++) {

                    if (data.id === this.players[i].id && data.id !== this.sessionId) {
                        this.players[i].x = data.x;
                        this.players[i].y = data.y;
                        this.players[i].moving = data.moving;
                        this.players[i].direction = data.direction;
                    }
                }
            });

            this.room.onMessage("updateLife", (data) => {

                for (let i = 0; i < this.players.length; i++) {

                    if (data.id === this.players[i].id) {
                        this.players[i].life = data.life;
                    }
                }
            });

            this.room.onMessage("listBlocks", (data) => {

                for (let i = 0; i < this.players.length; i++) {

                    if (data.id === this.players[i].id) {
                        this.players[i].blocks = data.blocks;
                        this.drawBlock();
                    }
                }
            });

            this.room.onMessage("moveShoots", (data) => {

                this.shoots = data;
            });
        }
        catch(e) {
            console.log(e);
        }

        this.characters.gangDriver = new Image();
        this.characters.gangDriver.src = '/img/sprites/gang_driver/gang_driver.png';

        this.bg = new Image();
        this.bg.src = '/img/bgs/bg3.png';

        this.brick = new Image();
        this.brick.src = '/img/itens/brick.png';

        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.boxSize = this.width / this.boxCount - 4;

        setInterval(this.gameLoop, 1000 / this.speed);

        window.onkeydown = (e) => {
            var kc = e.keyCode;
            e.preventDefault();

            if(kc === 65) this.Keys.left = true;
            if(kc === 87) this.Keys.up = true;
            if(kc === 68) this.Keys.right = true;
            if(kc === 83) this.Keys.down = true;
        };

        window.onkeyup = (e) => {
            var kc = e.keyCode;
            e.preventDefault();

            if(kc === 65) this.Keys.left = false;
            if(kc === 87) this.Keys.up = false;
            if(kc === 68) this.Keys.right = false;
            if(kc === 83) this.Keys.down = false;

            if (kc === 32) {
                this.addBlock();
            }
        };

        this.canvas.addEventListener('click', event => {
            this.shoot();
        }, false);

        window.addEventListener('contextmenu', (event) => {
            event.preventDefault()

        })
    },
    methods: {
        gameLoop() {

            this.drawScreen();
            this.drawPlayer();
            this.drawBlock();
            this.drawBullet();
            this.changePositionPlayer();
        },
        move() {

            const myIndex = this.getMyIndexPlayers();
            if (this.players[myIndex]) {
                this.room.send('move', {
                    x: this.players[myIndex].x,
                    y: this.players[myIndex].y,
                    direction: this.players[myIndex].direction,
                    framesCount: this.players[myIndex].framesCount,
                    frames: this.players[myIndex].frames,
                    moving: this.players[myIndex].moving
                });
            }
        },
        drawScreen() {

            const ptrn = this.ctx.createPattern(this.bg, 'repeat'); // Create a pattern with this image, and set it to "repeat".
            this.ctx.fillStyle = ptrn;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // context.fillRect(x, y, width, height);

            if (this.waiting && false) {
                this.ctx.font = "28px Arial";
                this.ctx.fillStyle = "white";
                this.ctx.fillText("waiting for players", this.width / 2 - 121, 50);

                this.ctx.font = "28px Arial";
                this.ctx.fillStyle = "white";
                this.ctx.fillText(this.players.length + '/' + this.maxClientes, this.width / 2 - 35, 80);
            }


            const myIndex = this.getMyIndexPlayers();
            if (this.players[myIndex]) {
                this.ctx.font = "10px Arial";
                this.ctx.fillStyle = "white";
                this.ctx.fillText('Kills: ' + this.players[myIndex].kills + '  | ', 0, 10);

                this.ctx.font = "10px Arial";
                this.ctx.fillStyle = "white";
                this.ctx.fillText('Hot shots: ' + this.players[myIndex].hot_shots, 40, 10);
            }
        },
        drawBlock() {

            for (let i = 0; i < this.players.length; i++) {
                for (let j = 0; j < this.players[i].blocks.length; j++) {
                    this.ctx.drawImage(this.brick, this.players[i].blocks[j].x, this.players[i].blocks[j].y, this.players[i].blocks[j].width, this.players[i].blocks[j].height);
                }
            }
        },
        drawPlayer() {

            for (let i = 0; i < this.players.length; i++) {

                if (!this.players[i].moving) {
                    this.players[i].framesCount = 0;
                }

                if (this.players[i].direction === 'up') {
                    this.players[i].sx = 0 + this.players[i].width * this.players[i].framesCount + 1;
                    this.players[i].sy = 0;
                }
                else if (this.players[i].direction === 'down') {
                    this.players[i].sx = 0 + this.players[i].width * this.players[i].framesCount + 1;
                    this.players[i].sy = this.players[i].height * 2;
                }
                else if (this.players[i].direction === 'right' || this.players[i].direction === 'upRight' || this.players[i].direction === 'downRight') {
                    this.players[i].sx = 0 + this.players[i].width * this.players[i].framesCount + 1;
                    this.players[i].sy = this.players[i].height * 1;
                }
                else if (this.players[i].direction === 'left' || this.players[i].direction === 'upLeft' || this.players[i].direction === 'downLeft') {
                    this.players[i].sx = 0 + this.players[i].width * this.players[i].framesCount + 1;
                    this.players[i].sy = this.players[i].height * 3;
                }

                this.players[i].frames++;

                if (this.players[i].frames <= 5) {
                    this.players[i].framesCount = 0;
                }else if (this.players[i].frames <= 15) {
                    this.players[i].framesCount = 1;
                }
                else if (this.players[i].frames <= 20) {
                    this.players[i].framesCount = 2;
                }
                else {
                    this.players[i].framesCount = 0;
                }

                if (this.players[i].frames >= 20) {
                    this.players[i].frames = 0;
                    this.players[i].framesCount = 0;
                }

                if (this.players[i].life > 0) {
                    this.ctx.drawImage(this.characters.gangDriver, this.players[i].sx, this.players[i].sy, this.players[i].width, this.players[i].height, this.players[i].x, this.players[i].y, this.players[i].width, this.players[i].height);

                    //Draw player life
                    const lifeLine = 48 / 5 * this.players[i].life;

                    this.ctx.fillStyle = 'white';
                    this.ctx.fillRect(this.players[i].x-12, this.players[i].y - 10, 50, 5);

                    if (this.players[i].id === this.sessionId) {
                        this.ctx.fillStyle = 'green';
                    }
                    else {
                        this.ctx.fillStyle = 'red';
                    }
                    this.ctx.fillRect(this.players[i].x - 12 + 1, this.players[i].y - 10 + 1, lifeLine, 3);
                }

            }
        },
        addBlock() {

            const myIndex = this.getMyIndexPlayers();
            if (this.players[myIndex]) {
                this.room.send('addBlock', {
                    x: this.players[myIndex].x,
                    y: this.players[myIndex].y,
                    direction: this.players[myIndex].direction,
                });
            }
        },
        addPlayer(obj) {
            /*
            {
                id: this.players.length+1,
                x: sortX,
                y: sortY,
                width: 48,
                height: 64,
                framesCount: 0,
                frames: 0,
                sx: 0,
                sy: 0,
                life: 5,
                speed: 0.5,
                speedShot: 3,
                shootsCount: 5,
                damegaShot: 1,
                name: 'Teste',
                level: 1,
                direction: 'right',
                shoots: [],
                blocks: []
            }
            */

            this.players.push(obj);
        },
        getMyIndexPlayers() {

            let id;

            this.players.forEach((player, index) => {

                if (player.id === this.sessionId) {
                    id = index;
                }
            });

            return id;

        },
        changePositionPlayer() {

            const blocks = [];

            for (let i = 0; i < this.players.length; i++) {
                for (let j = 0; j < this.players[i].blocks.length; j++) {

                    if (this.players[i].blocks[j] && this.players[i].blocks[j].x && this.players[i].blocks[j].y) {
                        blocks.push(this.players[i].blocks[j]);
                    }
                }
            }

            for (let i = 0; i < this.players.length; i++) {

                if (this.players[i].moving) {
                //Se não colidir ele anda
                    if (this.players[i].direction === 'up') {
                        this.players[i].y = this.players[i].y - this.players[i].speed;
                    }

                    if (this.players[i].direction === 'down') {
                        this.players[i].y = this.players[i].y + this.players[i].speed;
                    }

                    if (this.players[i].direction === 'left') {
                        this.players[i].x = this.players[i].x - this.players[i].speed;
                    }

                    if (this.players[i].direction === 'right') {
                        this.players[i].x = this.players[i].x + this.players[i].speed;
                    }

                    if (this.players[i].direction === 'upLeft') {
                        this.players[i].y = this.players[i].y - this.players[i].speed;
                        this.players[i].x = this.players[i].x - this.players[i].speed;
                    }

                    if (this.players[i].direction === 'upRight') {
                        this.players[i].y = this.players[i].y - this.players[i].speed;
                        this.players[i].x = this.players[i].x + this.players[i].speed;
                    }

                    if (this.players[i].direction === 'downLeft') {
                        this.players[i].y = this.players[i].y + this.players[i].speed;
                        this.players[i].x = this.players[i].x - this.players[i].speed;
                    }

                    if (this.players[i].direction === 'downRight') {
                        this.players[i].y = this.players[i].y + this.players[i].speed;
                        this.players[i].x = this.players[i].x + this.players[i].speed;
                    }

                    // Valida colisão com os cantos
                    if (this.players[i].x < 0) {
                        this.players[i].x = this.players[i].x + 2;
                    }

                    if (this.players[i].x > this.width - this.players[i].width) {
                        this.players[i].x = this.players[i].x - 2;
                    }

                    if (this.players[i].y < 0) {
                        this.players[i].y = this.players[i].y + 2;
                    }

                    if (this.players[i].y > this.height - this.players[i].height) {
                        this.players[i].y = this.players[i].y - 2;
                    }

                    // Valida colisão com blocos
                    if (blocks.length > 0) {
                        for (let j = 0; j < blocks.length; j++) {

                            if (this.players[i].x < blocks[j].x + blocks[j].width &&
                        this.players[i].x + this.players[i].width > blocks[j].x &&
                        this.players[i].y < blocks[j].y + blocks[j].height &&
                        this.players[i].y + this.players[i].height > blocks[j].y) {

                                this.players[i].moving = false;

                                if (this.players[i].direction === 'up') {
                                    this.players[i].y = this.players[i].y + 2;
                                }

                                if (this.players[i].direction === 'down') {
                                    this.players[i].y = this.players[i].y - 2;
                                }

                                if (this.players[i].direction === 'left') {
                                    this.players[i].x = this.players[i].x + 2;
                                }

                                if (this.players[i].direction === 'right') {
                                    this.players[i].x = this.players[i].x - 2;
                                }

                                if (this.players[i].direction === 'upLeft') {
                                    this.players[i].y = this.players[i].y + 2;
                                    this.players[i].x = this.players[i].x + 2;
                                }

                                if (this.players[i].direction === 'upRight') {
                                    this.players[i].y = this.players[i].y + 2;
                                    this.players[i].x = this.players[i].x - 2;
                                }

                                if (this.players[i].direction === 'downLeft') {
                                    this.players[i].y = this.players[i].y - 2;
                                    this.players[i].x = this.players[i].x + 2;
                                }

                                if (this.players[i].direction === 'downRight') {
                                    this.players[i].y = this.players[i].y - 2;
                                    this.players[i].x = this.players[i].x - 2;
                                }

                            }
                        }
                    }
                }
            }
        },
        shoot() {

            const myIndex = this.getMyIndexPlayers();

            let x, y = 0;

            if (this.players[myIndex].direction === 'left' || this.players[myIndex].direction === 'upLeft' || this.players[myIndex].direction === 'downLeft') {
                x = this.players[myIndex].x - this.players[myIndex].width / 2 + 15;
                y = this.players[myIndex].y + this.players[myIndex].height / 2 - 1;
            }

            if (this.players[myIndex].direction === 'right' || this.players[myIndex].direction === 'upRight' || this.players[myIndex].direction === 'downRight') {
                x = this.players[myIndex].x + this.players[myIndex].width;
                y = this.players[myIndex].y + this.players[myIndex].height / 2 - 1;
            }

            if (this.players[myIndex].direction === 'up') {
                x = this.players[myIndex].x + this.players[myIndex].width / 2;
                y = this.players[myIndex].y - 10;
            }

            if (this.players[myIndex].direction === 'down') {
                x = this.players[myIndex].x + this.players[myIndex].width / 2;
                y = this.players[myIndex].y + this.players[myIndex].height;
            }

            this.room.send('shoot', {
                direction: this.players[myIndex].direction,
                x: x,
                y: y,
                width: 3,
                height: 3,
                speed: this.players[myIndex].speedShot,
                demage: this.players[myIndex].damegaShot
            });
        },
        drawBullet() {

            for (let i = 0; i < this.shoots.length; i++) {

                this.ctx.beginPath();
                this.ctx.arc(this.shoots[i].x, this.shoots[i].y, 2, 0, 2 * Math.PI, false);
                this.ctx.fillStyle = 'white';
                this.ctx.fill();
            }
        },
    }
};
</script>

<style>
body {
    margin: 0;
    padding: 0;
    background-color: #000;
}
canvas {
    position: absolute;
    top:0;
    bottom: 0;
    left: 0;
    right: 0;
    margin:auto;
}
</style>
