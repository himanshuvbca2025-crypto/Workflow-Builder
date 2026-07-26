// ================= Variables =================

const canvas = document.getElementById("workflow-canvas");

const addNodeBtn = document.getElementById("add-node-btn");
const deleteNodeBtn = document.getElementById("delete-node-btn");
const deleteEdgeBtn = document.getElementById("delete-edge-btn");
const runWorkflowbtn = document.getElementById("run-workflow-btn");
const workflowStatus = document.getElementById("workflow-status");

const nodeCount = document.getElementById("node-count");
const edgeCount = document.getElementById("edge-count");
const dagStatus = document.getElementById("dag-status");
const svg = document.getElementById("connections");

let nodes = [];
let edges = [];
let nodeNumber = 0;

let selectedNode = null;

let startNode = null;
let endNode = null;

let offsetX = 0;

let offsetY = 0;

let nodeToDelete = null;
let selectedEdge = null;

// ================= Add Node =================

function addNode(){

    nodeNumber++;

    const node = document.createElement("div")

    node.classList.add("node");

    node.id = "node-" + nodeNumber;

    node.innerHTML = `
                <div class="node-header">
                    Node ${nodeNumber}
                </div>

                <div class="node-input"></div>
                
                <div class="node-output"></div>
    `;
 
    const maxX = canvas.clientWidth - 170;
    const maxY = canvas.clientHeight - 90;

    node.style.left = Math.random() * maxX + "px";
    node.style.top = Math.random() * maxY + "px";

    canvas.appendChild(node);

    node.addEventListener("mousedown",startDrag);

    node.addEventListener("click", selectNodeForDelete);

    const input = node.querySelector(".node-input");
    const output = node.querySelector(".node-output");


    output.addEventListener("click", selectStartNode);
    input.addEventListener("click", selectEndNode);

    nodes.push(node);

    nodeCount.innerText = nodes.length;

    console.log(nodes);
}

// ================= Drag Node =================

function startDrag(event){

    selectedNode = event.currentTarget;

    offsetX = event.offsetX;

    offsetY = event.offsetY;

}

function dragNode(event){

    if(selectedNode == null){
        return;
    }

    let x = event.pageX - canvas.offsetLeft - offsetX;
    let y = event.pageY - canvas.offsetTop - offsetY;

    x = Math.max(0, Math.min(x, canvas.clientWidth - selectedNode.offsetWidth));
    y = Math.max(0, Math.min(y, canvas.clientHeight - selectedNode.offsetHeight));


    selectedNode.style.left = x + "px";
    selectedNode.style.top = y + "px";

    updateConnections();
                        
}

function stopDrag(){

    selectedNode = null;
}


// ================= Connect Nodes =================

function selectStartNode(event){

    event.stopPropagation();

    startNode = event.target.parentElement;

    console.log("Start :", startNode.id);

}

function selectEndNode(event){

    event.stopPropagation();

    endNode = event.target.parentElement;

    console.log("End :", endNode.id);

    drawConnection(startNode,endNode);

}


function drawConnection(fromNode, toNode){


    if (fromNode === toNode) {
    alert("Cannot connect node to itself");
    return;
}

    const exists = edges.some(edge =>
    edge.from === fromNode &&
    edge.to === toNode
);

if (exists) {
    alert("Connection already exists");
    return;
}


    if(fromNode == null || toNode == null){
        return;
    }

    const fromRect = fromNode.getBoundingClientRect();
    const toRect = toNode.getBoundingClientRect();
 
    const canvasRect = canvas.getBoundingClientRect(); 

    const x1 = fromRect.right - canvasRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;

    const x2 = toRect.left - canvasRect.left;
    const y2 = toRect.top + toRect.height / 2 - canvasRect.top;


    const line = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
);

line.setAttribute("x1", x1);
line.setAttribute("y1", y1);

line.setAttribute("x2", x2);
line.setAttribute("y2", y2);

line.setAttribute("stroke", "#22C55E");
line.setAttribute("stroke-width", "4");

svg.appendChild(line);
line.addEventListener("click", selectEdge);

edges.push({
    from: fromNode,
    to: toNode,
    line: line
});

console.log("EDGE:", fromNode.id, "->", toNode.id);

edgeCount.innerText = edges.length;

startNode = null;
endNode = null;

console.log(edges);


}

function updateConnections(){

    edges.forEach(edge => {

        const fromRect = edge.from.getBoundingClientRect();
        const toRect = edge.to.getBoundingClientRect();

        const canvasRect = canvas.getBoundingClientRect();

        const x1 = fromRect.right - canvasRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;

        const x2 = toRect.left - canvasRect.left;
        const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

        edge.line.setAttribute("x1", x1);
        edge.line.setAttribute("y1", y1);

        edge.line.setAttribute("x2", x2);
        edge.line.setAttribute("y2", y2);

    });

}
// ================= Delete Node =================

function selectNodeForDelete(event){

    event.stopPropagation();
    nodeToDelete = event.currentTarget;
    console.log("Selected : ",nodeToDelete.id);

    nodes.forEach(node => {
    node.style.border = "2px solid #2563EB";
});

event.currentTarget.style.border = "3px solid red";

nodeToDelete = event.currentTarget;

}

function deleteNode(){

    if(nodeToDelete == null){

        alert("Select a node first")
        return;

    }

    edges.forEach(edge => {

        if(edge.from === nodeToDelete || edge.to === nodeToDelete){
            svg.removeChild(edge.line);
        }
    });

    edges = edges.filter(edge => {

        return edge.from !== nodeToDelete && 
        edge.to !== nodeToDelete;

    });

    edgeCount.innerText = edges.length;

    canvas.removeChild(nodeToDelete);

    nodes = nodes.filter(node => node !== nodeToDelete);

    nodeCount.innerText = nodes.length;

    nodes.forEach(node => {
    node.style.border = "2px solid #2563EB";
});

nodeToDelete = null;

checkDAG();
}



// ================= Delete Edge =================

function selectEdge(event){

    event.stopPropagation();

    selectedEdge = event.target;

    console.log("Edge Selected");


    edges.forEach(edge => {
    edge.line.setAttribute("stroke", "#22C55E");
});

selectedEdge = event.target;

selectedEdge.setAttribute("stroke", "red");
selectedEdge.setAttribute("stroke-width", "5");


}

function deleteEdge(){

    if(selectedEdge == null){

        alert("select an edge first");
        return;

    }

    svg.removeChild(selectedEdge);
    edges = edges.filter(edge => edge.line !== selectedEdge);

    edgeCount.innerText = edges.length;
    selectedEdge = null;

    checkDAG();

}

// ================= DAG Validation =================

function checkDAG() {

    let graph = {};

    nodes.forEach(node => {
        graph[node.id] = [];
    });

    edges.forEach(edge => {
        graph[edge.from.id].push(edge.to.id);
    });

    console.log("GRAPH =", graph);

    let visited = {};
    let stack = {};

    function dfs(nodeId) {

        visited[nodeId] = true;
        stack[nodeId] = true;

        for (let neighbour of graph[nodeId]) {

            if (!visited[neighbour]) {

                if (dfs(neighbour)) {
                    return true;
                }

            } else if (stack[neighbour]) {

                return true;

            }

        }

        stack[nodeId] = false;
        return false;
    }

    for (let nodeId in graph) {

        if (!visited[nodeId]) {

            if (dfs(nodeId)) {

                dagStatus.innerText = "False";
                dagStatus.style.color = "red";

                return false;
            }
        }
    }

    console.log(graph);
    dagStatus.innerText = "True";
    dagStatus.style.color = "#22C55E";


return true;



}

// ================= Run Workflow =================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runWorkflow() {

    console.log("ALL EDGES =", edges);

    // Cycle check
    if (!checkDAG()) {

        workflowStatus.innerText = "Failed ❌";
        workflowStatus.style.color = "red";  
        alert("Cycle Detected! Workflow Failed");
        return;
    }

    

    const order = topologicalSort();
    console.log(order);

    // Execute Nodes One by One
    for (let nodeId of order) {

        const node = document.getElementById(nodeId);

        // Green
        node.style.background = "#22C55E";

        await sleep(800);

        // Back to Original
        node.style.background = "#1E293B";
    }

    workflowStatus.innerText = "Running...";
    workflowStatus.style.color = "#FACC15";
    alert("Workflow Executed Successfully");
}

function topologicalSort(){

    const graph = {};
    const indegree = {}

    nodes.forEach(node => {

        graph[node.id]=[];
        indegree[node.id] = 0;

    });

    edges.forEach(edge => {

        graph[edge.from.id].push(edge.to.id);
        indegree[edge.to.id]++;
    });

    const queue = [];

    for(let nodeId in indegree){

        if(indegree[nodeId] === 0){

            queue.push(nodeId);

        }

    }

    const order = [];

    while(queue.length > 0){

        const current = queue.shift();

        order.push(current);

        graph[current].forEach(neighbour => {

            indegree[neighbour]--;

            if(indegree[neighbour] === 0){

                queue.push(neighbour);

            }

        });
    }

    return order;
}
// ================= Status Panel =================

// ================= Event Listeners =================

addNodeBtn.addEventListener("click",addNode);

document.addEventListener("mousemove",dragNode);

document.addEventListener("mouseup",stopDrag);

deleteNodeBtn.addEventListener("click", deleteNode);

deleteEdgeBtn.addEventListener("click", deleteEdge);

runWorkflowbtn.addEventListener("click",runWorkflow);
