export type TabletConsoleLogProvider = (message: string) => void;


export class TabletConsoleLog {
    private static provider?: TabletConsoleLogProvider;

    static log(message: string){
        if(TabletConsoleLog.provider) TabletConsoleLog.provider(message + "\n");
    }

    static registerProvider(provider: TabletConsoleLogProvider){
        TabletConsoleLog.provider = provider;
    }
}