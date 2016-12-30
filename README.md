# isaac-log
The Binding of Isaac: Afterbirth log reader and event emitter for Node.js

simply load the plugin and subscribe to events:
```
var isaaclog = require('isaac-log');

isaaclog.on('roomStartEvent', function(raw, boss_name) {
    ...
});

isaaclog.on('roomEndEvent', function(raw, clear_time) {
    ...
});

isaaclog.on('levelEvent', function(raw, floor, stage, alternate) {
    ...
});

isaaclog.on('collectibleEvent', function(raw, item_id, item_name) {
    ...
});

isaaclog.on('seedEvent', function(raw, seed) {
    ...
});

isaaclog.on('playerEvent', function(raw, player_id) {
    ...
});

isaaclog.on('curseEvent', function(raw, curse) {
    ...
});

isaaclog.start();
```
