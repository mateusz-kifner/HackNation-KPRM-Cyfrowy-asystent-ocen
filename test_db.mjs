import { db } from './src/db/index.ts';
import { account } from './src/db/schema.ts';
console.log('account table name', account.name);
await db.select().from(account).limit(1).then(r => console.log('rows', r)).catch(e => console.error(e));
