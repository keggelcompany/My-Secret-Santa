// Vercel serverless function entry point
import('../dist/index.js').then(async ({ app, initializeApp }) => {
    // Initialize the app for serverless environment
    await initializeApp();
});

// Export the handler for Vercel
export default async function handler(req, res) {
    const { app } = await import('../dist/index.js');
    return app(req, res);
}
