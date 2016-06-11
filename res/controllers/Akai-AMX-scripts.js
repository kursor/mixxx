	

function AMX() {}

/*      This mapping is still being worked on and is not finsihed
*       Author: Prism with help from Be
*       Mixxx Version: 1.12.0-beta1 (build 1.12 r5442)
*       System: Ubuntu 15.04
*/


AMX.shift = false;

AMX.main = true;

AMX.masterVuMeters = {
    "VuMeterL": {"ch": 0xB0, "midino": 0x3E},
    "VuMeterR": {"ch": 0xB0, "midino": 0x3F}
}

AMX.channelVuMeters = {
    "[Channel1]": {"ch": 0xB0, "midino": 0x40},
    "[Channel2]": {"ch": 0xB0, "midino": 0x41}
}

AMX.playLeds = {
    "[Channel1]": {"ch": 0x90, "midino": 0x0A},
    "[Channel2]": {"ch": 0x90, "midino": 0x0B}
}
AMX.cueLeds = {
    "[Channel1]": {"ch": 0x90, "midino": 0x08},
    "[Channel2]": {"ch": 0x90, "midino": 0x09}
}
AMX.init = function (id, debug) { // called when the device is opened & set up
        //connect VUmeters
    engine.connectControl("[Master]", "VuMeterL", "AMX.volumeLEDs");
    engine.connectControl("[Master]", "VuMeterR", "AMX.volumeLEDs");
    engine.connectControl("[Channel1]", "VuMeter", "AMX.volumeLEDs");
    engine.connectControl("[Channel2]", "VuMeter", "AMX.volumeLEDs");
    engine.connectControl("[Channel1]", "play_indicator", "AMX.onIndicators");
    engine.connectControl("[Channel2]", "play_indicator", "AMX.onIndicators");
    engine.connectControl("[Channel1]", "cue_indicator", "AMX.onIndicators");
    engine.connectControl("[Channel2]", "cue_indicator", "AMX.onIndicators");


    midi.sendShortMsg(0x90,0x06,0x00); //Sync Channel 1 
    midi.sendShortMsg(0x90,0x07,0x00); //Sync Channel 2
    midi.sendShortMsg(0x90,0x0C,0x00); //PFL Channel 1
    midi.sendShortMsg(0x90,0x0D,0x00); //PFL Channel 2
    midi.sendShortMsg(0x90,0x04,0x00); //Load Track Channel 1
    midi.sendShortMsg(0x90,0x05,0x00); //Load Track Channel 2
    midi.sendShortMsg(0x90,0x08,0x00); //Cue Channel 1
    midi.sendShortMsg(0x90,0x09,0x00); //Cue Channel 2
    midi.sendShortMsg(0x90,0x0A,0x00); //Play Channel 1
    midi.sendShortMsg(0x90,0x0B,0x00); //Play Channel 2
    midi.sendShortMsg(0x90,0x19,0x00); //Touch Button
    midi.sendShortMsg(0x90,0x0C,0x00); //PFL Channel 1
    midi.sendShortMsg(0x90,0x0D,0x00); //PFL Channel 2
};

AMX.shutdown = function () {
        // clear VU meter LEDs
    midi.sendShortMsg(AMX.masterVuMeters.VuMeterL.ch, AMX.masterVuMeters.VuMeterL.midino, 0);
    midi.sendShortMsg(AMX.masterVuMeters.VuMeterR.ch, AMX.masterVuMeters.VuMeterR.midino, 0);


    for(var i=1; i<=2; i++) {
        midi.sendShortMsg(AMX.channelVuMeters["[Channel"+i+"]"].ch, AMX.channelVuMeters["[Channel"+i+"]"].midino, 0);
    }

    //midi.sendShortMsg(AMX.channelVuMeters["[Channel1]"].ch, AMX.channelVuMeters["[Channel1]"].midino, 0);
    //midi.sendShortMsg(AMX.channelVuMeters["[Channel2]"].ch, AMX.channelVuMeters["[Channel2]"].midino, 0);
    midi.sendShortMsg(0x90,0x06,0x00); //Sync Channel 1 
    midi.sendShortMsg(0x90,0x07,0x00); //Sync Channel 2
    midi.sendShortMsg(0x90,0x0C,0x00); //PFL Channel 1
    midi.sendShortMsg(0x90,0x0D,0x00); //PFL Channel 2
    midi.sendShortMsg(0x90,0x04,0x00); //Load Track Channel 1
    midi.sendShortMsg(0x90,0x05,0x00); //Load Track Channel 2
    midi.sendShortMsg(0x90,0x08,0x00); //Cue Channel 1
    midi.sendShortMsg(0x90,0x09,0x00); //Cue Channel 2
    midi.sendShortMsg(0x90,0x0A,0x00); //Play Channel 1
    midi.sendShortMsg(0x90,0x0B,0x00); //Play Channel 2
    midi.sendShortMsg(0x90,0x01,0x00); //Pannel Button
    midi.sendShortMsg(0x90,0x19,0x00); //Touch Button
    midi.sendShortMsg(0x90,0x0C,0x00); //PFL Channel 1
    midi.sendShortMsg(0x90,0x0D,0x00); //PFL Channel 2
};

AMX.volumeLEDs = function (value, group, control) {
    value=(value*85);
    var ch;
    var midino;

    if (group == "[Master]") {
        ch = AMX.masterVuMeters[control].ch;
        midino = AMX.masterVuMeters[control].midino;
    } else {
        ch = AMX.channelVuMeters[group].ch;
        midino = AMX.channelVuMeters[group].midino;
    }
    midi.sendShortMsg(ch, midino, value);
};

AMX.xfaderCurve = function (channel, control, value, status, group) {
    script.crossfaderCurve(value);
};

AMX.shiftButton = function(channel, control, value, status, group) {
        AMX.shift = !AMX.shift;
        print(AMX.shift);
}

AMX.onIndicators = function (value, group, control) {
    if(control == 'play_indicator') {
        midi.sendShortMsg(AMX.playLeds[group].ch, AMX.playLeds[group].midino, value);
    }
    if(control == 'cue_indicator') {
        midi.sendShortMsg(AMX.cueLeds[group].ch, AMX.cueLeds[group].midino, value);
    }
}

AMX.scroller = function (channel, control, value, status, group) {
    
    var direction = {
        'tracks': { 'up': 'SelectPrevTrack', 'down': 'SelectNextTrack'},
        'library': { 'up': 'SelectPrevPlaylist', 'down': 'SelectNextPlaylist'}
    };
    var list = AMX.main ? 'tracks' : 'library';

    if(value == 1) {
        engine.setValue(group, direction[list].down, 1);
    } else {
        engine.setValue(group, direction[list].up, 1);
    }
}

AMX.libraryToggle = function(channel, control, value, status, group) {
    if(AMX.shift === true) {
        engine.setValue('[Playlist]', 'ToggleSelectedSidebarItem', 1);
    } else {
        AMX.main = !AMX.main;
    }
}
