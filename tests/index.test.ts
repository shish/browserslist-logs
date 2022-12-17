import * as m from "../src/index";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

///////////////////////////////////////////////////////////////////////
// Misc one-off utils

describe("processLogs", () => {
    test("should handle empty file", async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
        const inf = path.join(tmp, "test-in.log");
        const outf = path.join(tmp, "test-out.json");
        fs.writeFileSync(inf, "");
        await m.processLogs(inf, outf);
        const out = JSON.parse(fs.readFileSync(outf, "utf8"));
        expect(out).toEqual({});
    });
    test("should handle json logs", async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
        const inf = path.join(tmp, "test-in.log");
        const outf = path.join(tmp, "test-out.json");
        fs.writeFileSync(inf, `
{"time_local":"04/Nov/2022:09:42:14 +0000","remote_addr":"192.168.1.1","remote_user":"","request":"GET /files/tracks.json HTTP/1.1","status": "200","body_bytes_sent":"845406","request_time":"0.001","request_id":"89b57bb39320389a08eb6bebd7c6ff9a","http_referrer":"https://karakara.uk/browser2/","http_user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:106.0) Gecko/20100101 Firefox/106.0","cookie_performer_name":""}
{"time_local":"04/Nov/2022:10:24:17 +0000","remote_addr":"192.168.1.1","remote_user":"","request":"GET /files/tracks.json HTTP/1.1","status": "200","body_bytes_sent":"845406","request_time":"0.001","request_id":"ad53ad0feb8eed8cceef1e158aa92716","http_referrer":"https://karakara.uk/browser2/","http_user_agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1","cookie_performer_name":""}
{"time_local":"04/Nov/2022:19:56:28 +0000","remote_addr":"192.168.1.1","remote_user":"","request":"GET /files/tracks.json HTTP/1.1","status": "200","body_bytes_sent":"845406","request_time":"0.000","request_id":"5c49edda4c4b3e3f40acccea900f08cf","http_referrer":"https://karakara.uk/browser2/","http_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36","cookie_performer_name":""}
{"time_local":"04/Nov/2022:19:56:42 +0000","remote_addr":"192.168.1.1","remote_user":"","request":"GET /files/tracks.json HTTP/1.1","status": "200","body_bytes_sent":"845406","request_time":"0.027","request_id":"947ff465846e4a9f3623b1266429e3e7","http_referrer":"https://karakara.uk/browser2/","http_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0","cookie_performer_name":""}
{"time_local":"04/Nov/2022:19:57:26 +0000","remote_addr":"192.168.1.1","remote_user":"","request":"GET /files/tracks.json HTTP/1.1","status": "200","body_bytes_sent":"845406","request_time":"0.000","request_id":"847702e3579e388f8d69cc4eec82d16d","http_referrer":"https://karakara.uk/browser2/","http_user_agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1","cookie_performer_name":""}
`);
        await m.processLogs(inf, outf);
        const out = JSON.parse(fs.readFileSync(outf, "utf8"));
        expect(out).toEqual({
            "Chrome": {
                "106": 20,
            },
            "Firefox": {
                "106": 40,
            },
            "iOS": {
                "16": 40,
            },
        });
    });
    test("should handle httpd logs", async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
        const inf = path.join(tmp, "test-in.log");
        const outf = path.join(tmp, "test-out.json");
        fs.writeFileSync(inf, `
1.2.3.4 - - [17/Dec/2022:00:00:12 +0000] "GET /post/view/3071 HTTP/1.1" 200 6426 "https://test.net/post/view/3071498" "Mozilla/5.0 (Linux; Android 8.1.0; Swift 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36"
2.3.4.5 - - [17/Dec/2022:00:00:12 +0000] "GET /post/view/6571 HTTP/1.1" 200 1350 "https://www.google.com/" "Mozilla/5.0 (Linux; Android 12; SM-F711U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36"
3.4.5.6 - - [17/Dec/2022:00:00:12 +0000] "GET /post/view/2534 HTTP/1.1" 200 4770 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15"
4.5.6.7 - - [17/Dec/2022:00:00:12 +0000] "GET /post/view/5390 HTTP/1.1" 200 5961 "https://test.net/post/list/Friday/1" "Mozilla/5.0 (Linux; Android 12; SM-G781U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36"
5.6.7.8 - - [17/Dec/2022:00:00:12 +0000] "GET /post/view/1534 HTTP/1.1" 404 5845 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
`);
        await m.processLogs(inf, outf);
        const out = JSON.parse(fs.readFileSync(outf, "utf8"));
        expect(out).toEqual({
            "Chrome": {
                "108": 75,
            },
            "Safari": {
                "16": 25,
            },
        });
    });
});
