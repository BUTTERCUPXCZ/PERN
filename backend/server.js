import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import { sql } from './config/db.js';
import { aj } from './lib/arcjet.js';
import path from 'path';
import fs from 'fs';


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

// Debug logging for deployment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('__dirname:', __dirname);
console.log('Looking for dist at:', path.resolve(__dirname, 'frontend', 'dist'));

// Set NODE_ENV to production if not already set (for deployment environments)
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
    console.log('NODE_ENV was not set, defaulting to production');
}

if (process.env.NODE_ENV === 'production') {
    console.log('Production mode: Setting up static file serving');

    // Check if dist directory exists
    const distPath = path.join(__dirname, 'frontend/dist');
    const indexPath = path.resolve(__dirname, 'frontend', 'dist', 'index.html');

    if (!fs.existsSync(distPath)) {
        console.error('ERROR: frontend/dist directory does not exist!');
        console.error('This usually means the build process did not run or failed.');
        console.error('Expected path:', distPath);
    } else {
        console.log('✓ frontend/dist directory exists');
    }

    if (!fs.existsSync(indexPath)) {
        console.error('ERROR: frontend/dist/index.html does not exist!');
        console.error('Expected path:', indexPath);
    } else {
        console.log('✓ frontend/dist/index.html exists');
    }

    app.use(express.static(path.join(__dirname, 'frontend/dist')));

    app.get('*', (req, res) => {
        console.log('Catch-all route hit for:', req.path);
        console.log('Attempting to serve:', indexPath);

        // Check if file exists before serving
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            console.error('ERROR: index.html not found at:', indexPath);
            res.status(500).send('Application build files not found. Please check deployment logs.');
        }
    });
} else {
    console.log('Not in production mode - static files will not be served');
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