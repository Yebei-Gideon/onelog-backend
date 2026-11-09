import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from '#database/schema.js'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: pg.Pool
  public db!: NodePgDatabase<typeof schema>

  onModuleInit() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgres://postgres:postgrespassword@localhost:5432/onelog_dev'

    this.pool = new pg.Pool({
      connectionString,
      // NeonDB requires SSL in production, local Docker PG does not
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    })

    this.db = drizzle(this.pool, { schema })
  }

  async onModuleDestroy() {
    await this.pool.end()
  }
}