#!/bin/bash

if [ $(ls -A ~/tmp/dist | wc -l) -ne 0 ]; then
        rm -r ~/tmp/dist/*
fi

cp -RTu ./dist ~/tmp/dist
