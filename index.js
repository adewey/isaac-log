"use strict";

var os = require("os"),
    fs = require("fs"),
    tailstream = require("tailstream"),
    carrier = require("carrier"),
    EventEmitter = require("events").EventEmitter;

var ee = new EventEmitter();
module.exports = ee;

/* NOTE(ditheren): all events contain the raw data from the log, as well as our match data. Derived data provided as additional arguments for ease of use */
var important_lines = [
    {
        //Enter Room / Enter Boss Fight           Room 5.1061(Mom)
        "regex": /Room (?:.*)\((.*)\)/,
        "event": function roomStartEvent (raw) {
            /* data:
                boss_name - string - boss name
            */
            var boss_name = raw[1];
            // ignore some unneeded rooms
            // this needs some rework if we decide to use this for anything
            if (boss_name.match(/[Rr]oom/) ||
                boss_name.match(/[Cc]opy/) ||
                boss_name.match(/\(t\)/) ||
                boss_name.match(/[Ss]hop/) ||
                boss_name.match(/[Rr]ush/) ||
                boss_name.match(/0x0/) ||
                boss_name.match(/LBR medium/) ||
                boss_name.match(/use burnt basement/) ||
                !boss_name) {
                return;
            }
            ee.emit("roomStartEvent", raw, boss_name);
        },
    }, {
        //Current Game Time / End of Boss Fight   Mom clear time: 21356
        "regex": /Mom clear time: (\d+)/,
        "event": function roomEndEvent (raw) {
            /* data:
                game_time - integer - in-game time
            */
            var game_time = Number(raw[1]);
            ee.emit("roomEndEvent", raw, game_time);
        },
    }, {
        //Level Initialization                    Level::Init m_Stage 6, m_AltStage 1
        'regex': /Level::Init m_Stage (\d+), m_AltStage (\d+)/,
        "event": function levelEvent (raw) {
            /* data:
                floor - integer - Floor Progress
                stage - integer - Stage ID from stages.xml
                stage_type - integer - Stage Type 0 = vanilla 1 = wotl 2 = rebirth 3 = afterbirth
            */
            var floor = Number(raw[1]);
            var stage_type = Number(raw[2]);
            var stage = 0;

            if (stage_type == 3) {
                // NOTE(ditheren): greed floors are stage_type == 3, floors are in the stages.xml as 19 - 25 (or floor + 18)
                stage = floor + 18;
            }
            else {
                switch (floor)
                {
                case 1:
                case 2:
                    stage = 1 + stage_type;
                    break;
                case 3:
                case 4:
                    stage = 4 + stage_type;
                    break;
                case 5:
                case 6:
                    stage = 7 + stage_type;
                    break;
                case 7:
                case 8:
                    stage = 10 + stage_type;
                    break;
                case 9:
                case 10:
                    stage = 13 + stage_type;
                    break;
                case 11:
                case 12:
                    stage = 16 + stage_type;
                    break;
                }
            }

            ee.emit("levelEvent", raw, floor, stage, stage_type);
        },
    }, {
        //Add Collectible                         Adding collectible 73 (Cube of Meat)
        "regex": /Adding collectible (\d+) \((.*)\)/,
        "event": function collectibleEvent (raw) {
            /* data:
                item_id - integer - item id from items.xml
                item_name - string - item name from items.xml
            */
            var item_id = Number(raw[1]);
            var item_name = raw[2];
            ee.emit("collectibleEvent", raw, item_id, item_name);
        },
    }, {
        //Game Start / SEED                       RNG Start Seed: TM71 9JPY (2232680540)
        "regex": /RNG Start Seed: (.*) \(\d+\)/,
        "event": function seedEvent (raw) {
            /* data:
                seed - string - starting seed
            */
            var seed = raw[1];
            ee.emit("seedEvent", raw, seed);
        },
    }, {
        //Character Initialization                Initialized player with Variant 0 and Subtype 3
        "regex": /Initialized player with Variant 0 and Subtype (\d+)/,
        "event": function playerEvent(raw) {
            /* data:
                player_id - integer - player id used in players.xml
            */
            var player_id = Number(raw[1]);
            ee.emit("playerEvent", raw, player_id);
        },
    }, {
        //Curse [of/of the] X                     Curse of the Labyrinth!
        "regex": /Curse (?:of the|of) (.*)?/,
        "event": function curseEvent(raw) {
            /* data:
                curse - string - curse name
            */
            var curse = raw[1];
            ee.emit("curseEvent", raw, curse);
        },
    }, {
        //unlock steam achievement              unlock steam achievement "146"
        "regex": /unlock steam achievement "(\d+)"/,
        "event": function unlockEvent(raw) {
            /* data:
                achievement - integer - achievement id from achievements.xml
            */
            var achievement_id = Number(raw[1]);
            ee.emit("unlockEvent", raw, achievement_id);
        },
    },
];

var logfile_name = "log.txt";
var logfile_path = "";

function getUserHome() {
    return process.env.HOME || process.env.USERPROFILE;
}

switch(os.platform())
{
case "win32":
    logfile_path = getUserHome() + "/Documents/My Games/Binding of Isaac Rebirth/";
    break;
case "linux":
    logfile_path = getUserHome() + "/.local/share/binding of isaac rebirth/";
    break;
case "darwin":
    logfile_path = getUserHome() + "/Library/Application Support/Binding of Isaac Rebirth/";
    break;
}

var Carrier, tailStream;
module.exports.start = function() {
    if (tailStream != undefined) {
        return console.error("already started. call isaactracker.restart() to restart from the beginning of the file");
    }
    if (!fs.existsSync(logfile_path + logfile_name)) {
        return console.error("logpath [" + logfile_path + "] not set properly. call logpath to set your isaac save folder")
    }
    tailStream = tailstream.createReadStream(logfile_path + logfile_name);
    Carrier = carrier.carry(tailStream, function(line) {
        for (var index in important_lines) {
            var important_line = important_lines[index];
            var matches = line.match(important_line.regex);
            if (matches) {
                important_line.event(matches);
            }
        }
    });
};

module.exports.restart = function() {
    if (tailStream == undefined) {
        return module.exports.start();
    }
    Carrier.removeAllListeners('line');
    tailStream.destroy();
    tailStream = undefined;
    module.exports.start();
};

module.exports.logpath = function(logpath) {
    logfile_path = logpath;
};
