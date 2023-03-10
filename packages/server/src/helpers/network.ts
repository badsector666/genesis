import speedTest from "speedtest-net";

import { NETWORK_CONFIG } from "configs/global.config";
import logger from "helpers/logger";


/**
 * Check network reliability.
 */
export default async function checkNetwork() {
    let networkResult = null;

    logger.info("Getting network data for reliability check...");

    try {
        networkResult = await speedTest({
            acceptLicense: true,
            acceptGdpr: true
        });
    } catch (err) {
        logger.error("Network reliability check error:", err);
        process.exit(1);
    }

    if (networkResult !== null) {
        const download = networkResult.download.bandwidth / 1024 / 1024;
        const upload = networkResult.upload.bandwidth / 1024 / 1024;

        const result = {
            jitter: networkResult.ping.jitter,
            latency: networkResult.ping.latency,
            download: download.toFixed(3),
            upload: upload.toFixed(3)
        };

        const stringRes = `D: ${result.download} Mbit/s, U: ${result.upload} Mbit/s, L: ${result.latency} ms, J: ${result.jitter} ms`;

        let testPassed = true;

        if (result.jitter > NETWORK_CONFIG.jitterLimit) {
            logger.error(`Network jitter is too high [${result.jitter} ms]`);
            testPassed = false;
        }

        if (result.latency > NETWORK_CONFIG.latencyLimit) {
            logger.error(`Network latency is too high [${result.latency} ms]`);
            testPassed = false;
        }

        if (download < NETWORK_CONFIG.downloadLimit) {
            logger.error(`Network download speed is too low [${result.download} Mbit/s]`);
            testPassed = false;
        }

        if (upload < NETWORK_CONFIG.uploadLimit) {
            logger.error(`Network upload speed is too low [${result.upload} Mbit/s]`);
            testPassed = false;
        }

        if (testPassed) {
            logger.info(`Network reliability check passed [${stringRes}]`);
            return true;
        } else {
            logger.error("Network reliability check failed, exiting...");
            process.exit(1);
        }
    } else {
        logger.error("Network reliability check failed, exiting...");
        process.exit(1);
    }
}