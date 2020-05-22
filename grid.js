

var gridController = (function(){

    var grid = [];
    var start;
    var target;

    return {

        initGrid : function(x, y) {

            for (var rows = 0; rows < y; rows++) {
                grid[rows] = [];
                for (var columns = 0; columns < x; columns++) {
                    grid[rows][columns] = {
                        posY : rows,
                        posX : columns,
                        isWalkable : true,
                        isStart : false,
                        isTarget : false,
                        fCost : 0,
                        gCost : 0,
                        hCost : 0,
                        parent : null
                    }
                };
            };
        },

        updateTile : function (id, type) {
            var cor, x, y;
            cor = id.split("-");
            x = Number(cor[1]);
            y = Number(cor[0]);

            if (type === "wall") {
                if(grid[y][x].isWalkable){
                    grid[y][x].isWalkable = false;
                } else {
                    grid[y][x].isWalkable = true;
                }    
                grid[y][x].isStart = false;
                grid[y][x].isTarget = false;
            } else if (type === "start" || type === "target") {

                if (type === "start") {

                    for(var rows = 0; rows < grid.length; rows++){
                        for(var columns = 0; columns < grid[rows].length; columns++){
    
                            if(rows === y && columns === x){
                                continue;
                            }
                            grid[rows][columns].isStart = false;
                        }
                    }
                    grid[y][x].isStart = true;
                    grid[y][x].isWalkable = true;
                } else if (type === "target") {

                    for(var rows = 0; rows < grid.length; rows++){
                        for(var columns = 0; columns < grid[rows].length; columns++){
    
                            if(rows === y && columns === x){
                                continue;
                            }
                            grid[rows][columns].isTarget = false;
                        }
                    }
                    grid[y][x].isTarget = true;
                    grid[y][x].isWalkable = true;
                }
            }
        },

        checkStartTargetReady : function() {

            start = undefined;
            target = undefined;

            for (var rows = 0; rows < grid.length; rows++) {
                for (var columns = 0; columns < grid[rows].length; columns++) {
                    
                    //ASSIGN START AND TARTGET 
                    if (grid[rows][columns].isStart === true) {
                        start = grid[rows][columns];
                    } else if (grid[rows][columns].isTarget === true) {
                        target = grid[rows][columns];
                    }

                };
            };

            if (start !== undefined & target !== undefined){
                return true;
            } else {
                return false;
            }

        },

        getNeighbours : function(node) {
            var checkX, checkY;
            var neighbours = [];

            for (var x = -1; x <= 1; x++)
            {
                for (var y = -1; y <= 1; y++)
                {
                    if (x == 0 && y == 0)
                        continue;

                    checkX = node.posX + x;
                    checkY = node.posY + y;

                    if (checkX >= 0 && checkX < grid[0].length && checkY >= 0 && checkY < grid.length)
                    {
                        neighbours.push(grid[checkY][checkX]);
                    }
                }
            }

            return neighbours;
        },

        getGrid : function() {
            return grid;
        },

        getStartTarget : function () {

            return [start, target];
        },

        test : function() {
            console.log(grid);
        }
    };
})();

var uiController = (function () {

    return {
        updateTileUI : function(id, type) {
            //REMOVE TILE IF EXISTS
            if ($('#' + id).hasClass("wall")) {
                $('#' + id).removeClass(type);
            }
            //ADD TILE -- CAN HAVE MULTIPLE WALLS BUT ONLY ONE START AND TARGET
            else{
                if (type === "start") {
                    $('.start').removeClass("start");
                } else if (type === "target") {
                    $('.target').removeClass("target");
                }
                $('#' + id).removeClass("wall start target").addClass(type);
            }
        },

        displayPath : function(path) {

            for (var i = 0; i < path.length - 1; i++) { 
                task(i); 
            } 
               
            function task(i) { 
                setTimeout(function() { 

                    var selector = `#${path[i].posY}-${path[i].posX}`;
                    $(selector).addClass('path');

                }, 200 * i); 
            } 

            //for(var i = 0; i < path.length - 1; i++){
            //    
            //}
        },

        createGrid : function(grid){
            //CRETE GRID UI
            for (var rows = 0; rows < grid.length; rows++) {
                for (var columns = 0; columns < grid[rows].length; columns++) {
                    $("#container").append(`<div class='grid' id="${grid[rows][columns].posY}-${grid[rows][columns].posX}"></div>`);
                };
            };

            $("#container").width(grid[0].length * 32);
            $("#container").height(grid.length * 32);
        }
    };

})();

var pathFinder = (function (gridCtrl){

    var GetDistance = function(nodeA, nodeB)
    {
        var distX = Math.abs(nodeA.posX - nodeB.posX);
        var distY = Math.abs(nodeA.posY - nodeB.posY);

        if (distX > distY)
        {
            return 14 * distY + 10 * (distX - distY);
        }
        else
        {
            return 14 * distX + 10 * (distY - distX);
        }
    }

    var RetracePath = function(start, target) {

        var path = [];

        var current = target;

        while (current != start)
        {
            path.push(current);
            current = current.parent;
        }
        path.reverse();
        return path;
    }

    return {

        findPath : function() {

            var [start, target] = gridCtrl.getStartTarget();

            var openSet = [];
            var closedSet = [];
            openSet.push(start);

            //console.log(`OpenSet: ${openSet.length}`);
            //console.log(`ClosedSet: ${closedSet.length}`);

            while (openSet.length > 0) {

                //GET THE LOWERE FCOST NODE
                var currentNode = openSet[0];
                for (var i = 1; i < openSet.length; i++) {
                    if(openSet[i].fCost < currentNode.fCost || openSet[i].fCost === currentNode.fCost && openSet[i].hCost < currentNode.hCost){
                        currentNode = openSet[i];
                    }
                }

                //REMOVE CURRENT NODE FROM OPEN LIST -- ADD CURRENT NODE TO CLOSED LIST
                const index = openSet.indexOf(currentNode);
                if (index > -1) {
                    openSet.splice(index, 1);
                }
                closedSet.push(currentNode);

                //FOUND THE TARGET
                if (currentNode === target) {

                    var path = RetracePath(start, target);
                    return path;
                }

                //CHECK NEIGHBOURS
                var neighbours = gridCtrl.getNeighbours(currentNode);
                
                for(var i = 0; i < neighbours.length; i++) {
                    var isInClosed;
                    for(var t = 0; t < closedSet.length; t++){
                        if(closedSet[t].posX === neighbours[i].posX && closedSet[t].posY === neighbours[i].posY){
                            isInClosed = true;
                            break;
                        } else {
                            isInClosed = false;
                        }
                    }

                    if (!neighbours[i].isWalkable || isInClosed) {
                        console.log("block");
                        continue;
                    }

                    var newMovmentCostToNeighbour = currentNode.gCost + GetDistance(currentNode, neighbours[i]);
                    if (newMovmentCostToNeighbour < neighbours[i].GCost || openSet.indexOf(neighbours[i]) === -1)
                    {
                        neighbours[i].GCost = newMovmentCostToNeighbour;
                        neighbours[i].HCost = GetDistance(neighbours[i], target);
                        neighbours[i].fCost = neighbours[i].gCost + neighbours[i].hCost;
                        neighbours[i].parent = currentNode;

                        const index = openSet.indexOf(neighbours[i]);
                        if (index === -1)
                        {
                            openSet.push(neighbours[i]);
                        }
                    }

                }

            }


        }

    };

})(gridController);

var controller = (function(gridCtrl, uiCtrl, pathFnd){

    var addWallStartTarget = function() {
        var id, type;

        //GET INPUTS
        id = $(this).attr("id");
        type = $('input[name="type"]:checked').val()

        //UPDATE UI
        uiCtrl.updateTileUI(id, type);

        //UPDATE DATA
        gridCtrl.updateTile(id, type);
    };

    var findPath = function() {

        var isReady = gridCtrl.checkStartTargetReady();

        if(isReady){
            //START PATHFINDER
            var path = pathFnd.findPath();
            uiCtrl.displayPath(path);
        } else {
            alert("Plese assign start and target!");
        }
    };

    var setupEventListeners = function() {

        $(".grid").on('click', addWallStartTarget);

        $(".findPath").on('click', findPath);

    };

    return {
        init: function() {
            //CREATE DATA GRID
            gridCtrl.initGrid(16, 10);
            //CREATE UI GRID
            uiCtrl.createGrid(gridCtrl.getGrid());

            //SETUP EVENT LISTENERS
            setupEventListeners();
        }

    };

})(gridController, uiController, pathFinder);


$(document).ready(function() {
    controller.init();
});


