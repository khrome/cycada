#!/bin/sh
ps aux | grep -ie com.cyc.tool.subl.jrtl.nativeCode.subLisp.SubLMain | grep -v grep | awk '{print $2}' | xargs kill -9
