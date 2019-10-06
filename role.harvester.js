const REST_AREA = Game.flags.Rest.pos || new RoomPosition(31, 28, 'sim');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    //console.log(creep.name)
	    if(creep.carry.energy < creep.carryCapacity) {
            if (typeof creep.memory.source == 'undefined') {
                var sources = creep.room.find(FIND_SOURCES);
            } else {
                var sources = [Game.getObjectById(creep.memory.source)];
            }
            //console.log(creep.name, sources[0]);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // If all structures are full of energy, wait in rest area
                if (creep.pos != REST_AREA) {
                    creep.moveTo(REST_AREA);
                }
            }
        }
	}
};

module.exports = roleHarvester;