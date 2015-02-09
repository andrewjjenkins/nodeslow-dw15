Steps to make a userspace flame graph on linux

Based on http://www.brendangregg.com/blog/2014-09-17/node-flame-graphs-on-linux.html

1. I started with Ubuntu 14.04 LTS (trusty)

2. sudo apt-get install build-essential linux-tools-common linux-tools-generic

3. Download a version of node >= 0.11.13

4. Unpack and install:

    tar -xvzf node-v0.11.16.tar.gz
    cd node-v0.11.16
    ./configure --prefix=${HOME}/node/node-v0.11.16
    make -j4
    make install

5. Run your script with --perf-basic-prof:
    ~/node/node-v0.11.16/bin/node --perf-basic-prof 04-flame/flametest.js 

6. Run perf, grabbing snapshots:
    sudo perf record -F 99 -p `pgrep -n node` -g -- sleep 30

7. Run stackcollapse-perf.pl, to collapse the perf output (and JS symbol map):
    ~/fg/FlameGraph/stackcollapse-perf.pl < primes01.out > primes01.folded

8. Run flamegraph to make an SVG:
    ~/fg/FlameGraph/flamegraph.pl primes01.folded > primes01.svg

9. Serve the SVG:
    python -m SimpleHTTPServer
    browse to http://yourhost:8000/primes01.svg
