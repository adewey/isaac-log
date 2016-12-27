# isaac-log-tracker
The Binding of Isaac: Rebirth log reader and event emitter for Node.js

simply load the plugin and subscribe to events:
```
var isaac_tracker = require('isaac-log-tracker');

isaac_tracker.on('roomStartEvent', function(raw, boss_name) {
    ...
});

isaac_tracker.on('roomEndEvent', function(raw, clear_time) {
    ...
});

isaac_tracker.on('levelEvent', function(raw, floor, stage, alternate) {
    ...
});

isaac_tracker.on('collectibleEvent', function(raw, item_id, item_name) {
    ...
});

isaac_tracker.on('seedEvent', function(raw, seed) {
    ...
});

isaac_tracker.on('playerEvent', function(raw, player_id) {
    ...
});

isaac_tracker.on('curseEvent', function(raw, curse) {
    ...
});
```
