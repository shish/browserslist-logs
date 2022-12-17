browserslist-logs
=================
Turn webserver access logs into a browserslist file

Usage
-----
Run the package directly:
```
npx @shish2k/browserslist-logs -i my_website.log -o browserslist-stats.json
```

Local build and run:
```
npm install
npm run build
node dist/index.js -i my_website.log -o browserslist-stats.json
```

Motivation
----------
I want to be able to build my site taking advantage of features that my
users have access to, but it seems browserslist and caniuse both expect
me to send my user's browsing histories to Google and then export the
stats from there -- I can't see any way to use either of those in a
privacy-respecting way, so I am building my own...