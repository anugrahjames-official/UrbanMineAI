/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("Error: DATABASE_URL not found in .env.local");
    console.error("Please add your Transaction Connection Pooler String to .env.local as DATABASE_URL.");
    console.error("Example: DATABASE_URL=postgres://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres");
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

async function applySchema() {
    try {
        await client.connect();
        console.log("Connected to database.");

        const schemaPath = path.join(__dirname, '../docs/supabase_schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log("Applying schema...");
        await client.query(schemaSql);
        console.log("Schema applied successfully.");

        // Check buckets
        const res = await client.query("select * from storage.buckets where id = 'items'");
        if (res.rows.length > 0) {
            console.log("Storage bucket 'items' confirmed.");
        } else {
            console.log("Warning: Storage bucket 'items' not found after schema execution.");
        }

    } catch (err) {
        console.error("Error executing schema:", err);
    } finally {
        await client.end();
    }
}

applySchema();
