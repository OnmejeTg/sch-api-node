// Import required modules
import http from 'http';
import app from './app/app.js';
import 'dotenv/config';
import connectDatabase from './config/dbConnect.js';

const port = process.env.PORT || 5000;

// Define an async function to start the server
const startServer = async () => {
    try {
        // Connect to the database
        await connectDatabase();
        
        // Create an HTTP server using the express app
        const server = http.createServer(app);

        // Start listening on the specified port
        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (error) {
       
        console.error('Server initialization error:', error);
        process.exit(1); // Exit the process with a non-zero code
    }
};

startServer();
