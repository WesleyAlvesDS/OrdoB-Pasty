declare module 'sql.js' {
  interface SqlJsDatabase {
    run(sql: string, params?: unknown[]): void
    exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>
    prepare(sql: string): {
      bind(params: unknown): void
      step(): boolean
      getAsObject(): Record<string, unknown>
      free(): void
    }
    export(): Uint8Array
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => SqlJsDatabase
  }

  export type { SqlJsDatabase, SqlJsStatic }
  export default function initSqlJs(): Promise<SqlJsStatic>
}
