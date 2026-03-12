
const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars
// Note: We need to parse .env.local manually or use dotenv-flow/similar if available, 
// but for simplicity, we'll assume the URL is passed or we read .env.local via fs
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const connectionString = envConfig.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase in some envs
});

const createMessagesTableQuery = `
  create table if not exists messages (
    id uuid default gen_random_uuid() primary key,
    transaction_id uuid references transactions(id) not null,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Enable RLS (Security)
  alter table messages enable row level security;

  -- Policy: Users can see messages for transactions they are part of
  create policy "Users can see messages for their transactions"
  on messages for select
  using (
    exists (
      select 1 from transactions
      where transactions.id = messages.transaction_id
      and (transactions.supplier_id = auth.uid() or transactions.buyer_id = auth.uid())
    )
  );

  -- Policy: Users can insert messages for their transactions
  create policy "Users can insert messages for their transactions"
  on messages for insert
  with check (
    exists (
      select 1 from transactions
      where transactions.id = messages.transaction_id
      and (transactions.supplier_id = auth.uid() or transactions.buyer_id = auth.uid())
    )
  );

  -- Add to Realtime Publication
  alter publication supabase_realtime add table messages;
`;

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Check if table exists
        const tableCheck = await client.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE  table_schema = 'public'
            AND    table_name   = 'messages'
        );
    `);

        if (tableCheck.rows[0].exists) {
            console.log('Table messages already exists. Skipping creation.');
        } else {
            await client.query(createMessagesTableQuery);
            console.log('Table messages created successfully.');
        }

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

run();
