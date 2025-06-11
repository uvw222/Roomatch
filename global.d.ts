// global.d.ts – compiled automatically by TS
import type { Server as IOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var _io: IOServer | undefined;
}

/* Ensures this file is a module */
export {};
