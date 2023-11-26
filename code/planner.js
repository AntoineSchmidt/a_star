function plan(problem, start, goal, heuristic) {
    problem_size = [problem.length, problem[0].length];

    // create array for exploration data
    var exploration = new Array(problem_size[0])
    for (var x = 0; x < problem_size[0]; x++) {
        exploration[x] = new Array(problem_size[1]);
        for (var y = 0; y < problem_size[1]; y++) {
            // closed, cost, parent
            exploration[x][y] = [false, Infinity, [0, 0]];
        }
    }

    // set start cost
    exploration[start[0]][start[1]][1] = 0;

    // exploration loop
    while (true) {
        // find minimum unclosed cost position
        var current = [Infinity, 0, 0];
        for (var x = 0; x < problem_size[0]; x++) {
            for (var y = 0; y < problem_size[1]; y++) {
                if (!exploration[x][y][0]) {
                    // from dijkstra to greedy (x5) euclidian goal heuristic (faster, but cost overestimation -> loosing path optimality)
                    var cost = exploration[x][y][1] + heuristic * Math.hypot(goal[0] - x, goal[0] - y);
                    if (cost < current[0]) {
                        // found better node
                        current[0] = cost;
                        current[1] = x;
                        current[2] = y;
                    }
                }
            }
        }

        if (!isFinite(current[0])) {
            // no path found
            self.postMessage("No path found");
            break;
        }
        if (current[1] == goal[0] && current[2] == goal[1]) {
            // best found node is goal, path found
            console.log("Path found");
            current.shift(); // delete cost

            // backtrack path and draw it
            while (!(current[0] == start[0] && current[1] == start[1])) {
                // draw path point to canvas
                self.postMessage([current, "green"]);

                current = exploration[current[0]][current[1]][2];
            }
            self.postMessage([start, "green"]);
            break;
        }

        // set current node cost
        current[0] = exploration[current[1]][current[2]][1];

        // update the neighbours if not a wall (infinite cost for walls)
        var neighbours = [-1, 0, 1];
        for (var xdifi = 0; xdifi < 3; xdifi++) {
            var xdif = neighbours[xdifi]; // for xdif in neighbours retrieves strings
            for (var ydifi = 0; ydifi < 3; ydifi++) {
                var ydif = neighbours[ydifi];
                if (xdif != 0 || ydif != 0) { // actual neighbour
                    if (current[1] + xdif >= 0 && current[1] + xdif < problem_size[0] && current[2] + ydif >= 0 && current[2] + ydif < problem_size[1]) { // in range
                        if (problem[current[1] + xdif][current[2] + ydif] < 1) { // neighbour not a wall
                            // less cost for diagonal moves, but not same for more intuitive solutions
                            var cost = current[0] + ((ydif != 0 && xdif != 0) ? 1.5 : 1);
                            if (cost < exploration[current[1] + xdif][current[2] + ydif][1]) { // check for lower cost
                                // update cost and parent data
                                exploration[current[1] + xdif][current[2] + ydif][1] = cost;
                                exploration[current[1] + xdif][current[2] + ydif][2] = [current[1], current[2]];
                            }
                        }
                    }
                }
            }
        }

        // close current node
        exploration[current[1]][current[2]][0] = true;

        // draw closed node to canvas
        self.postMessage([[current[1], current[2]], "red"]);
    }
}

// retrieve task from main
self.addEventListener('message', function (e) {
    plan(e.data[0], e.data[1], e.data[2], e.data[3]);
}, false);