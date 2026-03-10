import pg from 'pg';
const { Pool } = pg;

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'messages'");
    console.log('Messages columns:', cols.rows.map(r => r.column_name));
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));

    const hasUserId = cols.rows.some(r => r.column_name === 'user_id');
    const hasSenderId = cols.rows.some(r => r.column_name === 'sender_id');
    if (hasUserId && !hasSenderId) {
      await client.query('ALTER TABLE messages RENAME COLUMN user_id TO sender_id');
      console.log('Renamed user_id to sender_id');
    }

    const hasReceiverId = cols.rows.some(r => r.column_name === 'receiver_id');
    if (!hasReceiverId) {
      await client.query('ALTER TABLE messages ADD COLUMN receiver_id VARCHAR REFERENCES users(id)');
      console.log('Added receiver_id');
    }

    const hasIsRadio = cols.rows.some(r => r.column_name === 'is_radio');
    if (!hasIsRadio) {
      await client.query('ALTER TABLE messages ADD COLUMN is_radio BOOLEAN DEFAULT false');
      console.log('Added is_radio');
    }

    const hasBestowals = tables.rows.some(r => r.table_name === 'user_bestowals');
    if (!hasBestowals) {
      await client.query(`CREATE TABLE user_bestowals (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        monthly_amount DECIMAL(10,2) DEFAULT 0.00,
        fsc_balance DECIMAL(20,8) DEFAULT 0.00000000,
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
      console.log('Created user_bestowals table');
    }

    const videoCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'videos'");
    if (!videoCols.rows.some(r => r.column_name === 'category')) {
      await client.query("ALTER TABLE videos ADD COLUMN category TEXT DEFAULT 'general'");
      console.log('Added category to videos');
    }

    const tribeCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tribes'");
    if (!tribeCols.rows.some(r => r.column_name === 'category')) {
      await client.query("ALTER TABLE tribes ADD COLUMN category TEXT DEFAULT 'general'");
      console.log('Added category to tribes');
    }

    const memberCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tribe_members'");
    if (!memberCols.rows.some(r => r.column_name === 'has_accepted_terms')) {
      await client.query('ALTER TABLE tribe_members ADD COLUMN has_accepted_terms BOOLEAN DEFAULT false');
      console.log('Added has_accepted_terms');
    }

    console.log('Migration complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
