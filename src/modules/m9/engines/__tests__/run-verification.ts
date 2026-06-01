import { runSuite } from './engines.spec';

try {
    runSuite();
    process.exit(0);
} catch (err) {
    console.error('Verification suite failed:', err);
    process.exit(1);
}
