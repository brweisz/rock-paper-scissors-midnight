import {RockPaperScissorsSimulator} from "./rps-simulator.js";
import {NetworkId, setNetworkId,} from "@midnight-ntwrk/midnight-js-network-id";
import {describe, expect, it} from "vitest";
import {randomBytes} from "./utils.js";
import {GAME_STATE, PLAY} from "../managed/rock_paper_scissors/contract/index.cjs";

setNetworkId(NetworkId.Undeployed);

describe("RPS smart contract", () => {
  it("generates initial ledger state deterministically", () => {
    const simulator0 = new RockPaperScissorsSimulator(randomBytes(32));
    const simulator1 = new RockPaperScissorsSimulator(randomBytes(32));
    expect(simulator0.getLedger()).toEqual(simulator1.getLedger());
  });

  
});
