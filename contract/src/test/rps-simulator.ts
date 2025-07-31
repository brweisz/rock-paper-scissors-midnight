import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  constructorContext,
  convert_bigint_to_Uint8Array,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
  PLAY,
} from "../managed/rock_paper_scissors/contract/index.cjs";
import { type RockPaperScissorsPrivateState, witnesses } from "../witnesses.js";

/**
 * Serves as a testbed to exercise the contract in tests
 */
export class RockPaperScissorsSimulator {
  readonly contract: Contract<RockPaperScissorsPrivateState>;
  circuitContext: CircuitContext<RockPaperScissorsPrivateState>;

  constructor(localGameSecretKey: Uint8Array) {
    this.contract = new Contract<RockPaperScissorsPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      constructorContext({ localGameSecretKey }, "0".repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  /***
   * Switch to a different secret key for a different user
   *
   * TODO: is there a nicer abstraction for testing multi-user dApps?
   */
  public switchUser(localGameSecretKey: Uint8Array) {
    this.circuitContext.currentPrivateState = {
      localGameSecretKey,
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public getPrivateState(): RockPaperScissorsPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public choose_encrypted_a(play: PLAY, name: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.choose_encrypted_a(
      this.circuitContext,
      play, 
      name
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  public choose_encrypted_b(play: PLAY, name: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.choose_encrypted_b(
      this.circuitContext,
      play, 
      name
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  public move_to_reveal(): Ledger {
    this.circuitContext = this.contract.impureCircuits.move_to_reveal(
      this.circuitContext
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  public reveal_a(play: PLAY, name: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.reveal_a(
      this.circuitContext,
      play, 
      name
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }
  
  public reveal_b(play: PLAY, name: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.reveal_b(
      this.circuitContext,
      play, 
      name
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  public compare_and_resolve(): Ledger {
    this.circuitContext = this.contract.impureCircuits.compare_and_resolve(
      this.circuitContext
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  public restart_game(): Ledger {
    this.circuitContext = this.contract.impureCircuits.restart_game(
      this.circuitContext
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  // Esto no aplica pero puede ayudar a construir lo que necesito

  // public publicKey(): Uint8Array {
  //   const instance = convert_bigint_to_Uint8Array(
  //     32,
  //     this.getLedger().instance,
  //   );
  //   return this.contract.circuits.publicKey(
  //     this.circuitContext,
  //     this.getPrivateState().secretKey,
  //     instance,
  //   ).result;
  // }
}
