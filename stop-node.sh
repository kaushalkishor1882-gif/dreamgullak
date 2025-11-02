#!/bin/bash
# stop-node.sh
echo "Stopping all your Node.js apps..."
pkill -u $(whoami) -f "node"
echo "✅ All user Node.js processes stopped."
