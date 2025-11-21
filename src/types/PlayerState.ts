import { Timer } from "./Timer";
import { DiceState } from "./Dice";

export type PlayerState = {
  diceRolls: never[];
  nickname: string;
  timer?: Timer;
  dice: DiceState;
  sessionId?: string;
  userId?: string;
};
