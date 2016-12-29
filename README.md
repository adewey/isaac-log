# isaactracker-log
The Binding of Isaac: Rebirth log reader and event emitter for Node.js

simply load the plugin and subscribe to events:
```
var isaactracker = require('isaactracker-log');

isaactracker.on('roomStartEvent', function(raw, boss_name) {
    ...
});

isaactracker.on('roomEndEvent', function(raw, clear_time) {
    ...
});

isaactracker.on('levelEvent', function(raw, floor, stage, alternate) {
    ...
});

isaactracker.on('collectibleEvent', function(raw, item_id, item_name) {
    ...
});

isaactracker.on('seedEvent', function(raw, seed) {
    ...
});

isaactracker.on('playerEvent', function(raw, player_id) {
    ...
});

isaactracker.on('curseEvent', function(raw, curse) {
    ...
});

isaactracker.start();
```
