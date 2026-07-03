/**
 * Executes a promise-returning function with exponential backoff.
 * 
 * @param operation The async function to execute.
 * @param maxRetries Maximum number of retries before aborting (default: 3).
 * @param delays Array of delays in milliseconds for each retry.
 * @returns The result of the operation.
 */
export async function withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delays = [1000, 2000, 5000]
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            
            // Skip backoff for Next.js internal errors like redirect(), notFound(), or Dynamic Server Usage
            // Next.js attaches a 'digest' property to its internal routing/rendering errors.
            const isNextInternal = error && typeof error === 'object' && (
                typeof error.digest === 'string' || 
                (typeof error.message === 'string' && error.message.includes('Dynamic server usage'))
            );

            if (isNextInternal) {
                throw error;
            }

            if (attempt < maxRetries) {
                const delayMs = delays[attempt] || delays[delays.length - 1];
                console.warn(`Operation failed, retrying in ${delayMs}ms... (Attempt ${attempt + 1}/${maxRetries})`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }
    
    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Operation failed after ${maxRetries} retries. Last error: ${errorMessage}`);
}
