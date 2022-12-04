#!/bin/bash

if ! command -v screen &> /dev/null
then
    sudo apt-get -y install screen
fi

# Check variable config file
echo Checking config file 
script_filename=my_variables
if [ ! -f $script_filename.sh ]
then
    echo Creating "$script_filename.sh" file, you must edit this file before continuing
    cp $script_filename $script_filename.sh
    exit 0
else
    echo Loading config file: $script_filename.sh
    # Source variables 
    . ./$script_filename.sh
    if [ -z "$db_name" ]
    then
        echo You must edit $script_filename.sh to get started
        exit 0
    else
        echo Successfully loaded variables: $db_name
    fi
fi

# Install Grafana
grafana_version=grafana-rpi_8.5.15_armhf.deb
echo Grafana Version: $grafana_version

if [ ! -f $grafana_version ]
then
    echo installing $grafana_version
    sudo apt-get install -y adduser libfontconfig1
    wget https://dl.grafana.com/oss/release/$grafana_version
    sudo dpkg -i $grafana_version
fi

# Install Influx
influx_version=influxdb_1.8.10_armhf.deb
echo Influx Version: $influx_version

if [ ! -f $influx_version ]
then
    echo installing $influx_version
    wget https://dl.influxdata.com/influxdb/releases/$influx_version
    sudo dpkg -i $influx_version
fi

# Create Database
if [ -f $influx_version ]
then
    influx -execute "create database $db_name"
    influx -execute "CREATE USER \"$db_user\" WITH PASSWORD '$db_password' WITH ALL PRIVILEGES"
fi

screen_out=$(screen -list)
# Create Screen Instance running thermostat
if [[ "$screen_out" == *"therm"* ]]
then
    echo Node/Screen session already started
else
    echo Starting screen instance "therm"
    screen -dmS therm && screen -S therm -X stuff ". ./my_variables.sh && node src/run.js\n"
fi

exit 0
