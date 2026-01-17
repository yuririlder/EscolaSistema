import { Pool } from 'pg';
export declare const pool: Pool;
export declare function testConnection(): Promise<void>;
export declare function query(text: string, params?: any[]): Promise<any>;
export declare function queryOne(text: string, params?: any[]): Promise<any | null>;
export declare function queryMany(text: string, params?: any[]): Promise<any[]>;
export default pool;
//# sourceMappingURL=connection.d.ts.map