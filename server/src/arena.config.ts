import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";

import { MyRoom } from "./rooms/room";

export default Arena({
    getId: () => "GangCrypto",
    initializeGameServer: (gameServer) => {

        gameServer.define("MyRoom", MyRoom);
        gameServer.onShutdown(function(){

            console.log(`game server is going down.`);
        });
    },

    initializeExpress: (app) => {

        app.use('/colyseus', monitor());
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
