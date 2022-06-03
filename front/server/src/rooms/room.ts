import { Room, Client, Delayed  } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player, Shoot, Block } from "../player/entities";

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();
}

export class MyRoom extends Room {
    maxClients = 5;
    width = 1700;
    height = 900;

    waiting = true;
    started = false;

    deltaTime = 166;
    deltaTimeShoots = 3000;
    deltaTimeBlocks = 30000;

    public delayedInterval!: Delayed;

    onCreate(options: any) {

        this.setState(new State());

        this.setSimulationInterval((deltaTime) => this.update(this.deltaTime));

        this.delayedInterval = this.clock.setInterval(() => {
            this.updateShoots();
        }, this.deltaTimeShoots);

        this.delayedInterval = this.clock.setInterval(() => {
            this.updateBlocks();
        }, this.deltaTimeBlocks);

        this.onMessage('move', (client: any, data: any) => {

            const player = this.state.players.get(client.sessionId);

            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;
                player.framesCount = data.framesCount;
                player.frames = data.frames;
                player.moving = data.moving;

                this.broadcast("movePlayer", {
                    id: client.sessionId,
                    x: player.x,
                    y: player.y,
                    direction: player.direction,
                    moving: player.moving,
                },
                    {
                        afterNextPatch: true
                    });
            }
        });

        this.onMessage('addBlock', (client: any, data: any) => {

            const pixelToBlock = 100;

            const player = this.state.players.get(client.sessionId);

            if (player && player.blocksCount > 0 && player.life > 0) {
                const block = new Block();

                if (player.direction === 'up') {
                    block.x = data.x;
                    block.y = data.y - pixelToBlock;
                }

                if (player.direction === 'down') {
                    block.x = data.x;
                    block.y = data.y + pixelToBlock;
                }

                if (player.direction === 'left') {
                    block.x = data.x - pixelToBlock;
                    block.y = data.y;
                }

                if (player.direction === 'right') {
                    block.x = data.x + pixelToBlock;
                    block.y = data.y;
                }

                if (player.direction === 'upLeft') {
                    block.x = data.x - pixelToBlock;
                    block.y = data.y - pixelToBlock;
                }

                if (player.direction === 'upRight') {
                    block.x = data.x + pixelToBlock;
                    block.y = data.y - pixelToBlock;
                }

                if (player.direction === 'downLeft') {
                    block.x = data.x - pixelToBlock;
                    block.y = data.y + pixelToBlock;
                }

                if (player.direction === 'downRight') {
                    block.x = data.x + pixelToBlock;
                    block.y = data.y + pixelToBlock;
                }

                player.blocks.push(block);

                player.blocksCount--;

                this.broadcast("listBlocks", player,
                {
                    afterNextPatch: true
                });
            }
        });

        this.onMessage('shoot', (client: any, data: any) => {

            const player = this.state.players.get(client.sessionId);

            if (player && player.shootsCount > 0 && player.life > 0) {

                const shoot = new Shoot();
                shoot.direction = data.direction;
                shoot.x = data.x;
                shoot.y = data.y;
                shoot.width = data.width;
                shoot.height = data.height;
                shoot.speed = data.speed;
                shoot.demage = data.demage;

                player.shoots.push(shoot);
                player.shootsCount--;
            }
        });

        this.onMessage('updateShoot', (client: any, data: any) => {

            if (data && data.x) {
                const player = this.state.players.get(data.sessionId);

                if (player.shoots[data.index]) {
                    player.shoots[data.index].x = data.x;
                    player.shoots[data.index].y = data.y;
                }
            }
        });

        this.onMessage('removeShoot', (client: any, data: any) => {

            const player = this.state.players.get(data.sessionId);
            player.shoots.splice(data.index, 1);
        });
    }

    updateShoots() {

        this.state.players.forEach((value: any, key: any) => {

            const player = this.state.players.get(key);
            player.shootsCount = 5;
        });
    }

    updateBlocks() {

        this.state.players.forEach((value: any, key: any) => {

            const player = this.state.players.get(key);
            player.blocksCount = 3;
        });
    }

    update(deltaTime: number) {

        let players: any = [];
        let blocks: any = [];
        let shoots: any = [];

        this.changePositionPlayer();

        this.state.players.forEach((value: any, key: any) => {

            players.push(value);
        });

        if (players.length > 0) {

            players.forEach((player, playerIndex) => {

                player.blocks.forEach((block, blockIndex) => {
                    blocks.push({
                        sessionId: player.id,
                        playerIndex: playerIndex,
                        blockIndex: blockIndex,
                        x: block.x,
                        y: block.y,
                        width: block.width,
                        height: block.height,
                        life: block.life,
                    })
                });

                player.shoots.forEach((shoot, shootIndex) => {
                    shoots.push({
                        sessionId: player.id,
                        playerIndex: playerIndex,
                        shootIndex: shootIndex,
                        x: shoot.x,
                        y: shoot.y,
                        width: shoot.width,
                        height: shoot.height,
                        speed: shoot.speed,
                        demage: shoot.demage
                    });
                });
            });

            players.forEach((player, index) => {

                //Colisão com a pedra
                if (player.blocks.length > 0) {

                    blocks.forEach((item, index) => {

                        if (player.x < item.x + item.width &&
                            player.x + player.width > item.x &&
                            player.y < item.y + item.height &&
                            player.y + player.height > item.y) {

                            player.moving = false;
                            // this.playerMove(player);
                        }
                    });
                }

                if (player.x < 0 || player.x > this.width - player.width) {
                    // this.playerMove(player);
                    player.moving = false;
                }

                if (player.y < 0 || player.y > this.height - player.height) {
                    // this.playerMove(player);
                    player.moving = false;
                }
            });

            //Colisão do tiro
            shoots.forEach((shoot) => {

                const playerShoot = this.state.players.get(shoot.sessionId);

                //Colisão do tiro com a pedra
                blocks.forEach((block) => {
                    if (shoot.x < block.x + block.width &&
                        shoot.x + shoot.width > block.x &&
                        shoot.y < block.y + block.height &&
                        shoot.y + shoot.height > block.y) {

                        const playerBlock = this.state.players.get(block.sessionId);

                        if (playerShoot.shoots.length > 0) {
                            playerShoot.shoots.splice(shoot.shootIndex, 1);
                        }

                        if (playerBlock && playerBlock.blocks.length && playerBlock.blocks[block.blockIndex] && playerBlock.blocks[block.blockIndex].life) {

                            playerBlock.blocks[block.blockIndex].life -= shoot.demage;

                            if (playerBlock.blocks[block.blockIndex].life < 1) {

                                playerBlock.blocks.splice(block.blockIndex, 1);

                                this.broadcast("listBlocks", playerBlock,
                                    {
                                        afterNextPatch: true
                                    });
                            }
                        }

                    }
                });
            });

            //Colisão player com tiro
            players.forEach((player) => {

                const playerImpact = this.state.players.get(player.id);

                shoots.forEach((shoot) => {

                    const playerShoot = this.state.players.get(shoot.sessionId);

                    if (player.x < shoot.x + shoot.width &&
                        player.x + player.width > shoot.x &&
                        player.y < shoot.y + shoot.height &&
                        player.y + player.height > shoot.y) {

                        if (player.id !== shoot.sessionId) {

                            if (playerImpact && playerImpact.life > 0) {
                                playerShoot.shoots.splice(shoot.shootIndex, 1);

                                playerImpact.life -= shoot.demage;

                                let players: any = [];

                                this.state.players.forEach((value: any, key: any) => {

                                    players.push(value);
                                });

                                this.broadcast("updateLife", {
                                    id: playerImpact.id,
                                    life: playerImpact.life
                                });
                            }
                        }
                    }

                });
            });

            this.broadcast("moveShoots", shoots,
            {
                afterNextPatch: true
            });
        }

        //Faz andar os tiros
        if (players.length > 0) {

            players.forEach((player, index) => {

                if (player.shoots.length > 0) {

                    player.shoots.forEach((shoot, shootIndex) => {

                        if (shoot.direction === 'left') {
                            shoot.x = shoot.x - shoot.speed;
                        }
                        else if (shoot.direction === 'right') {
                            shoot.x = shoot.x + shoot.speed;
                        }
                        else if (shoot.direction === 'up') {
                            shoot.y = shoot.y - shoot.speed;
                        }
                        else if (shoot.direction === 'down') {
                            shoot.y = shoot.y + shoot.speed;
                        }
                        else if (shoot.direction === 'upRight') {
                            shoot.y = shoot.y - shoot.speed;
                            shoot.x =  shoot.x + shoot.speed;
                        }
                        else if (shoot.direction === 'upLeft') {
                            shoot.y = shoot.y - shoot.speed;
                            shoot.x = shoot.x - shoot.speed;
                        }
                        else if (shoot.direction === 'downRight') {
                            shoot.y = shoot.y + shoot.speed;
                            shoot.x = shoot.x + shoot.speed;
                        }
                        else if (shoot.direction === 'downLeft') {
                            shoot.y = shoot.y + shoot.speed;
                            shoot.x = shoot.x - shoot.speed;
                        }

                        if (shoot.x >= this.width) {
                            player.shoots.splice(shootIndex, 1);
                        }
                        else if (shoot.x < 0) {
                            player.shoots.splice(shootIndex, 1);
                        }
                        else if (shoot.y >= this.height) {
                            player.shoots.splice(shootIndex, 1);
                        }
                        else if (shoot.y < 0) {
                            player.shoots.splice(shootIndex, 1);
                        }
                    });
                }
            });
        }

        if (players.length === this.maxClients && this.waiting && !this.started) {
            this.started = true;
            this.waiting = false;

            this.broadcast("roomData", {
                waiting: this.waiting,
                maxClients: this.maxClients
            });
        }
     }

    onJoin(client: Client, options: any, auth: any) {
        this.state.players.set(client.sessionId, new Player());

        const player = this.state.players.get(client.sessionId);
        player.id = client.sessionId;
        player.x = Math.floor(Math.random() * (this.width - player.width));
        player.y = Math.floor(Math.random() * (this.height - player.height));

        let players: any = [];

        this.state.players.forEach((value: any, key: any) => {

            players.push(value);
        });

        this.broadcast("roomData", {
            waiting: (players.length === this.maxClients) ? false : true,
            maxClients: this.maxClients
        });

        this.broadcast("refreshPlayers", players);
    }

    async onLeave(client: Client) {

        if (this.state.players.has(client.sessionId)) {
            this.state.players.delete(client.sessionId);
        }

        let players: any = [];

        this.state.players.forEach((value: any, key: any) => {

            players.push(value);
        });

        this.broadcast("refreshPlayers", players);

    }

    playerMove(player) {

        const playerMove = this.state.players.get(player.id);
        if (playerMove.direction === 'right') {
            playerMove.x -= 2;
        }
        if (playerMove.direction === 'left') {
            playerMove.x += 2;
        }
        if (playerMove.direction === 'up') {
            playerMove.y += 2;
        }
        if (playerMove.direction === 'down') {
            playerMove.y -= 2;
        }
        if (playerMove.direction === 'upRight') {
            playerMove.x -= 2;
            playerMove.y += 2;
        }
        if (playerMove.direction === 'upLeft') {
            playerMove.x += 2;
            playerMove.y += 2;
        }
        if (playerMove.direction === 'downRight') {
            playerMove.x -= 2;
            playerMove.y -= 2;
        }
        if (playerMove.direction === 'downLeft') {
            playerMove.x += 2;
            playerMove.y -= 2;
        }

        // if (playerMove.x < 0 || playerMove.x > this.width) {
        //     playerMove.x = 10;
        //     playerMove.y = 10;
        // }

        // if (playerMove.y < 0 || playerMove.y > this.height) {
        //     playerMove.x = 10;
        //     playerMove.y = 10;
        // }

        this.broadcast("limitaPlayer", {
            id: playerMove.id,
            x: playerMove.x,
            y: playerMove.y,
        },
        {
            afterNextPatch: true
        });
    }

    changePositionPlayer() {

        const players = this.state.players;

        players.forEach((player) => {

            if (player.moving) {
                if (player.direction === 'up') {
                    player.y = player.y - player.speed;
                }

                if (player.direction === 'down') {
                    player.y = player.y + player.speed;
                }

                if (player.direction === 'left') {
                    player.x = player.x - player.speed;
                }

                if (player.direction === 'right') {
                    player.x = player.x + player.speed;
                }

                if (player.direction === 'upLeft') {
                    player.y = player.y - player.speed;
                    player.x = player.x - player.speed;
                }

                if (player.direction === 'upRight') {
                    player.y = player.y - player.speed;
                    player.x = player.x + player.speed;
                }

                if (player.direction === 'downLeft') {
                    player.y = player.y + player.speed;
                    player.x = player.x - player.speed;
                }

                if (player.direction === 'downRight') {
                    player.y = player.y + player.speed;
                    player.x = player.x + player.speed;
                }
            }
        });
    }

    onDispose() { }
}
