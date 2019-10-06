// Import modules
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

// Define constants
const MAX_CREEPS = {
    'harvester': 2,
    'builder': 3,
    'upgrader': 1
};
const ROLES = ['upgrader', 'builder', 'harvester']; 

const ENERGY_SPAWN_THRESHOLD = 300;
const TTL_THRESHOLD = 300;

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    ROLES.forEach(function (item, index) {
        var target_creeps = _.filter(Game.creeps, (creep) => creep.memory.role == item);
        //console.log(item + ': ' + target_creeps.length);
    
        if(target_creeps.length < MAX_CREEPS[item] && Game.spawns.Spawn1.energy >= ENERGY_SPAWN_THRESHOLD) {
            var newName = item + Game.time;
            console.log('Spawning new ' + item + ': ' + newName);
            Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
                {memory: {role: item}});
        }
    });


    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});

    }

    // Execute Creep Tasks
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        
        // Renew Creeps
        if (creep.ticksToLive <= TTL_THRESHOLD) {
           var spawns = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {
               return (structure.structureType == STRUCTURE_SPAWN);}
            });
            
            if(spawns[0].renewCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawns[0], {visualizePathStyle: {stroke: '#ff0000'}});
            } else {
                // Try to execute renewCreep a second time
                spawns[0].renewCreep(creep)
            }
        } else {
        
            // Execute Creep Role-dependant jobs
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if(creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
        }
        
        // Recycle creep
        if(creep.memory.role == 'recycle') {
            //var spawn = creep.room.find(STRUCTURE_SPAWN);
            var spawns = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
            });
            
            if(spawns[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawns[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};