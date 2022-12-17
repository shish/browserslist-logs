#!/usr/bin/env node
import { Command, InvalidArgumentError } from "commander";
import { resolveUserAgent } from "browserslist-useragent";
import fs from "node:fs";
import readline from "node:readline";
import process from "node:process";

function parseArgs(argv: Array<string>) {
    const program = new Command();
    program
        .version("0.0.0")
        .description("A tool to generate browserslist-stats file from logs")
        .option("-i, --input <file>", "File to read from (default stdin)")
        .option("-o, --output <file>", "File to write to (default stdout)");

    let parsed = program.parse(argv);
    let args = parsed.opts();

    if (process.stdin.isTTY && !args.input) {
        throw new InvalidArgumentError("No input file specified");
    }

    return args;
}

export async function processLogs(input: string | null, output: string | null) {
    const stream = input ? fs.createReadStream(input) : process.stdin;
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    let browsers: Record<string, Record<string, number>> = {};
    let total = 0;
    for await (const line of rl) {
        try {
            const uas = line.match(/Mozilla.*?"/);
            if (!uas) {
                continue;
            }
            const ua = resolveUserAgent(uas[0]);
            if (ua.family && ua.version) {
                const f = ua.family,
                    v = ua.version.split(".")[0];
                if (!browsers[f]) browsers[f] = {};
                if (!browsers[f][v]) browsers[f][v] = 0;
                browsers[f][v]++;
                total++;
            }
        } catch {}
    }

    let frac: Record<string, Record<string, number>> = {};
    Object.keys(browsers).map((family) => {
        frac[family] = {};
        Object.keys(browsers[family]).map((version) => {
            let f = (browsers[family][version] / total) * 100;
            if (f >= 0.1) {
                frac[family][version] = parseFloat(f.toFixed(2));
            }
        });
    });

    if (output) {
        fs.writeFileSync(output, JSON.stringify(frac));
    } else {
        const data = process.stdout.isTTY
            ? JSON.stringify(frac, null, 4)
            : JSON.stringify(frac);
        process.stdout.write(data);
    }
}

if (require.main === module) {
    const args = parseArgs(process.argv);
    processLogs(args.input, args.output);
}
