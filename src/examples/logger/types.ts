type LogFn = (obj: Record<string, unknown>, msg?: string) => void;

export type Logger = {
  info: LogFn;
  error: LogFn;
  warn: LogFn;
  debug: LogFn;
  child: (metadata: Record<string, unknown>) => Logger;
};
