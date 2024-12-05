#!/bin/bash
wrk -t12 -c400 -d30s http://127.0.0.1:5099
wrk -t12 -c400 -d30s --header "Cookie: locale=zh-cn" http://127.0.0.1:5099
wrk -t12 -c50 -d30s --header "Cookie: locale=zh-cn"  http://localhost:5099/docs/components/edit/select