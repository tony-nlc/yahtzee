declare module "@3d-dice/dice-ui" {
  export class DisplayResults {
    constructor(target: string);
    showResults(results: any): void;
    clear(): void;
  }

  export class AdvancedRoller {
    constructor(options: {
      target: string;
      onSubmit?: (notation: string) => void;
      onClear?: () => void;
      onReroll?: (rolls: any[]) => void;
      onResults?: (results: any) => void;
    });
    handleResults(results: any): void;
  }

  export class BoxControls {
    themeSelect: { setValue(value: string): void };
    themeColorPicker: { setValue(value: string): void };
    constructor(options: {
      themes: string[];
      themeColor?: string;
      onUpdate?: (updates: Record<string, any>) => void;
    });
  }
}
