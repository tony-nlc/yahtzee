declare module "@3d-dice/dice-box" {
  export class DiceBox {
    constructor(target: string, options?: { assetPath?: string });
    init(): Promise<void>;
    roll(notation: string): void;
    clear(): void;
    add(notation: string): void;
    updateConfig(config: Record<string, any>): void;
    onRollComplete?: (results: any) => void;
    onThemeConfigLoaded?: (themeData: any) => void;
  }
}
