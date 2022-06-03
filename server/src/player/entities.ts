import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";

export class Shoot extends Schema {
    @type("string") direction: string = 'left';
    @type("number") x: number = 0
    @type("number") y: number = 0;
    @type("number") width: number = 3;
    @type("number") height: number = 3;
    @type("number") speed: number = 10;
    @type("number") demage: number = 1;
}

export class Block extends Schema {
    @type("number") x: number = 0
    @type("number") y: number = 0;
    @type("number") width: number = 46;
    @type("number") height: number = 46;
    @type("number") life: number = 3;
}

export class Player extends Schema {
    @type("string") id: string = '';
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") width: number = 24;
    @type("number") height: number = 55;
    @type("number") framesCount: number = 0;
    @type("number") frames: number = 0;
    @type("number") sx: number = 0;
    @type("number") sy: number = 0;
    @type("number") life: number = 5;
    @type("number") hot_shots: number = 0;
    @type("number") kills: number = 0;
    @type("number") deaths: number = 0;
    @type("number") speed: number = 2;
    @type("boolean") moving: boolean = false;
    @type("number") speedShot: number = 10;
    @type("number") shootsCount: number = 5;
    @type("number") blocksCount: number = 3;
    @type("number") damegaShot: number = 1;
    @type("string") name: string = 'Player 1';
    @type("string") direction: string = 'up';
    @type("number") level: number = 1;
    @type([Shoot]) shoots = new ArraySchema<Shoot>();
    @type([Block]) blocks = new ArraySchema<Block>();
}
