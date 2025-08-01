import {RockPaperScissorsSimulator} from "./rps-simulator.js";
import {NetworkId, setNetworkId,} from "@midnight-ntwrk/midnight-js-network-id";
import {describe, expect, it} from "vitest";
import {randomBytes, stringToBytes32} from "./utils.js";
import {GAME_STATE, PLAY} from "../managed/rock_paper_scissors/contract/index.cjs";

setNetworkId(NetworkId.Undeployed);

describe("RPS smart contract", () => {
    it("generates initial ledger state deterministically", () => {
        const simulator0 = new RockPaperScissorsSimulator(randomBytes(32));
        const simulator1 = new RockPaperScissorsSimulator(randomBytes(32));
        let ledger = simulator0.getLedger();
        expect(ledger).toEqual(simulator1.getLedger());
        expect(ledger.game_state).toEqual(GAME_STATE.deciding);
        expect(ledger.encrypted_play_a.is_some).toEqual(false);
        expect(ledger.encrypted_play_b.is_some).toEqual(false);
        expect(ledger.clear_play_a.is_some).toEqual(false);
        expect(ledger.clear_play_b.is_some).toEqual(false);
        expect(ledger.winner).toEqual(stringToBytes32("NO WINNER YET"));
    });

    it("user can choose a secret move for player A", () => {
        const simulator = new RockPaperScissorsSimulator(randomBytes(32));
        let rock_play = PLAY.rock;
        let byte_name = stringToBytes32("Bruno");
        simulator.choose_encrypted_a(rock_play, byte_name);
        let ledger = simulator.getLedger();
        expect(ledger.game_state).toEqual(GAME_STATE.deciding);
        expect(ledger.encrypted_play_a.is_some).toEqual(true);
        expect(ledger.encrypted_play_a.value).toEqual(simulator.construct_secret_play(rock_play, byte_name));
        expect(ledger.encrypted_play_b.is_some).toEqual(false);
        expect(ledger.clear_play_a.is_some).toEqual(false);
        expect(ledger.clear_play_b.is_some).toEqual(false);
        expect(ledger.winner).toEqual(stringToBytes32("NO WINNER YET"));
    });

    it("different users can play in different player slots", () => {
        let userAPrivateKey = randomBytes(32);
        const simulator = new RockPaperScissorsSimulator(userAPrivateKey);

        let userAPlay = PLAY.rock;
        let userAName = stringToBytes32("Bruno");
        let expected_secret_play_A = simulator.construct_secret_play_from_key(userAPlay, userAName, userAPrivateKey);

        let userBPrivateKey = randomBytes(32);
        let userBPlay = PLAY.paper;
        let userBName = stringToBytes32("Carlo");
        let expected_secret_play_B = simulator.construct_secret_play_from_key(userBPlay, userBName, userBPrivateKey);

        simulator.choose_encrypted_a(userAPlay, userAName);
        simulator.switchUser(userBPrivateKey);
        simulator.choose_encrypted_b(userBPlay, userBName);
        let ledger = simulator.getLedger();

        expect(ledger.game_state).toEqual(GAME_STATE.deciding);
        expect(ledger.encrypted_play_a.is_some).toEqual(true);
        expect(ledger.encrypted_play_a.value).toEqual(expected_secret_play_A);
        expect(ledger.encrypted_play_b.is_some).toEqual(true);
        expect(ledger.encrypted_play_b.value).toEqual(expected_secret_play_B);
    })

    it("Game can advance to the revealing phase", () => {
        let userAPrivateKey = randomBytes(32);
        const simulator = new RockPaperScissorsSimulator(userAPrivateKey);
        let userAPlay = PLAY.rock;
        let userAName = stringToBytes32("Bruno");
        let userBPrivateKey = randomBytes(32);
        let userBPlay = PLAY.paper;
        let userBName = stringToBytes32("Carlo");
        simulator.choose_encrypted_a(userAPlay, userAName);
        simulator.switchUser(userBPrivateKey);
        simulator.choose_encrypted_b(userBPlay, userBName);
        simulator.move_to_reveal();

        let ledger = simulator.getLedger();
        expect(ledger.game_state).toEqual(GAME_STATE.proving);
    })

    it("Users cannot play in the same slot", () => {
        let userAPrivateKey = randomBytes(32);
        const simulator = new RockPaperScissorsSimulator(userAPrivateKey);
        let userAPlay = PLAY.rock;
        let userAName = stringToBytes32("Bruno");
        let userBPrivateKey = randomBytes(32);
        let userBPlay = PLAY.paper;
        let userBName = stringToBytes32("Carlo");
        simulator.choose_encrypted_a(userAPlay, userAName);
        simulator.switchUser(userBPrivateKey);

        expect(() => simulator.choose_encrypted_a(userBPlay, userBName)).toThrow("that place is already taken")
    })

    it("Users cannot play in the same slot", () => {
        let userAPrivateKey = randomBytes(32);
        const simulator = new RockPaperScissorsSimulator(userAPrivateKey);
        let userAPlay = PLAY.rock;
        let userAName = stringToBytes32("Bruno");
        let userBPrivateKey = randomBytes(32);
        let userBPlay = PLAY.paper;
        let userBName = stringToBytes32("Carlo");
        simulator.choose_encrypted_a(userAPlay, userAName);

        expect(() => simulator.move_to_reveal()).toThrow("b move missing")
    })

});
