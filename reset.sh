#!/bin/bash
yao migrate --reset
yao run scripts.test.Data  # Generate test data
yao sui build web default