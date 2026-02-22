const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Judge0 CE language IDs
const LANGUAGE_MAP = {
    'javascript': 63,  // JavaScript (Node.js 12.14.0)
    'python': 71,       // Python (3.8.1)
    'java': 62,         // Java (OpenJDK 13.0.1)
    'c': 50,            // C (GCC 9.2.0)
    'cpp': 54,          // C++ (GCC 9.2.0)
    'csharp': 51,       // C# (Mono 6.6.0.161)
    'ruby': 72,         // Ruby (2.7.0)
    'go': 60,           // Go (1.13.5)
    'rust': 73,         // Rust (1.40.0)
    'typescript': 74,   // TypeScript (3.7.4)
    'php': 68,          // PHP (7.4.1)
    'swift': 83,        // Swift (5.2.3)
    'kotlin': 78,       // Kotlin (1.3.70)
};

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';

// List of hosts to try — CE and Extra CE variants
const JUDGE0_HOSTS = [
    process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com',
    'judge0-extra-ce.p.rapidapi.com',
    'judge0-ce.p.rapidapi.com',
];

// Helper: try a fetch against a given host
async function trySubmit(host, languageId, code, stdin) {
    const submitUrl = `https://${host}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,compile_output,status,time,memory`;

    const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': host
        },
        body: JSON.stringify({
            language_id: languageId,
            source_code: Buffer.from(code).toString('base64'),
            stdin: Buffer.from(stdin).toString('base64')
        })
    });

    return { response, host };
}

// POST /api/compiler/run — Submit code to Judge0
router.post('/run', auth, async (req, res) => {
    try {
        const { code, language, stdin = '' } = req.body;

        if (!code || !language) {
            return res.status(400).json({ msg: 'Code and language are required' });
        }

        const languageId = LANGUAGE_MAP[language];
        if (!languageId) {
            return res.status(400).json({ msg: `Unsupported language: ${language}` });
        }

        if (!JUDGE0_API_KEY) {
            return res.status(500).json({ msg: 'Judge0 API key not configured. Set JUDGE0_API_KEY in server/.env' });
        }

        // Try each host until one succeeds
        let result = null;
        let lastError = '';

        // Deduplicate hosts
        const uniqueHosts = [...new Set(JUDGE0_HOSTS)];

        for (const host of uniqueHosts) {
            try {
                console.log(`[Compiler] Trying host: ${host}`);

                const { response } = await trySubmit(host, languageId, code, stdin);

                if (response.status === 403) {
                    console.log(`[Compiler] 403 from ${host}, trying next...`);
                    lastError = `403 Forbidden from ${host}`;
                    continue;
                }

                if (response.status === 429) {
                    lastError = 'Rate limit exceeded. Please wait a moment and try again.';
                    continue;
                }

                if (!response.ok) {
                    const errText = await response.text();
                    console.error(`[Compiler] Error from ${host}:`, response.status, errText);
                    lastError = errText;
                    continue;
                }

                result = await response.json();
                console.log(`[Compiler] Success with host: ${host}`);
                break;

            } catch (fetchErr) {
                console.error(`[Compiler] Fetch error with ${host}:`, fetchErr.message);
                lastError = fetchErr.message;
                continue;
            }
        }

        // If synchronous wait=true didn't give final result, try polling
        if (result && result.token && (!result.status || result.status.id <= 2)) {
            const token = result.token;
            const host = uniqueHosts.find(h => true); // Use first working host

            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 1500));

                try {
                    const getResponse = await fetch(
                        `https://${host}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
                        {
                            headers: {
                                'X-RapidAPI-Key': JUDGE0_API_KEY,
                                'X-RapidAPI-Host': host
                            }
                        }
                    );

                    if (getResponse.ok) {
                        result = await getResponse.json();
                        if (result.status && result.status.id > 2) break;
                    }
                } catch (pollErr) {
                    continue;
                }
            }
        }

        if (!result) {
            return res.status(502).json({
                msg: `Failed to reach Judge0 compiler. Last error: ${lastError}. Make sure your RapidAPI key is subscribed to Judge0 CE or Judge0 Extra CE.`
            });
        }

        // Decode base64 outputs
        const decode = (b64) => b64 ? Buffer.from(b64, 'base64').toString('utf-8') : '';

        const response = {
            status: result.status,
            stdout: decode(result.stdout),
            stderr: decode(result.stderr),
            compile_output: decode(result.compile_output),
            time: result.time,
            memory: result.memory
        };

        res.json(response);
    } catch (err) {
        console.error('Compiler route error:', err.message);
        res.status(500).json({ msg: 'Server error during code execution: ' + err.message });
    }
});

// GET /api/compiler/languages — Return supported languages
router.get('/languages', (req, res) => {
    const languages = Object.entries(LANGUAGE_MAP).map(([name, id]) => ({
        name,
        id,
        label: name.charAt(0).toUpperCase() + name.slice(1)
    }));
    res.json(languages);
});

module.exports = router;
