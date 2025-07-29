import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import { sql } from './config/db.js';
import { aj } from './lib/arcjet.js';
import path from 'path';


dotenv.config();

const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

//apply arcjet rate limit to all routes
app.use(async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1
        })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.status(429).json({ error: "Too many requests, please try again later." });
            } else if (decision.reason.isBot()) {
                res.status(403).json({ error: "Access denied for bots." });
            } else {
                res.status(403).json({ error: "Forbidden" });
            }
            return
        }

        //check for spoofed bots
        if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
            res.status(403).json({ error: "Access denied for spoofed bots." });
            return;
        }

        next()
    } catch (error) {
        console.log("Arcjet error: ", error);
        next()
    }

});


app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname,
        'frontend/dist')));

    app.get('*', (req, res) => {
        console.log('Catch-all route hit for:', req.path);
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
    });
}

async function initDB() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS products(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
     `
    } catch (error) {
        console.log(`Error connecting to the database: ${error.message}`);
    }
}

console.log("Database initialized Successfully");
initDB().then(() => {
    app.listen(PORT, (req, res) => {
        console.log(`Server is running on port ${PORT}`);
    });
});