let stopFlag = false;
let listQ = [];
let listL = [];

//graph for dfs
class GraphDfs {
  constructor() {
    this.adjacencyList = {};
    this.tableResult = [];
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1].push(vertex2);
  }

  findPath(startVertex, endVertex) {
    const visited = {};
    const path = [];

    const dfsHelper = (vertex) => {
      if (!vertex) return null;
      visited[vertex] = true;
      path.push(vertex);

      if (vertex === endVertex) {
        return path;
      }

      for (const neighbor of this.adjacencyList[vertex]) {
        if (!visited[neighbor]) {
          const newPath = dfsHelper(neighbor);
          if (newPath) return newPath;
        }
      }

      path.pop();
    };

    // path
    const pathArr = dfsHelper(startVertex);
    return pathArr.join("->");
  }

  createTable = (node, end, visited = {}) => {
    if (!visited[node] && !stopFlag) {
      visited[node] = true;
      const adjacencyList = graphDfs.adjacencyList[node];

      if (Array.isArray(adjacencyList)) {
        const uniqueListQ = [...new Set([node, ...adjacencyList, ...listQ])];
        const uniqueListL = [...new Set([...adjacencyList, ...listL])];

        listQ = uniqueListQ;
        listL = uniqueListL;

        for (let i = 0; i < listL.length; i++) {
          if (listL[i] === node) {
            listL.splice(i, 1);
          }
        }

        this.tableResult.push({
          expandedNode: node,
          adjacencyList: adjacencyList.join(", "),
          listQ: listQ.join(", "),
          listL: listL.join(", "),
        });

        if (node === end) {
          stopFlag = true;
          return;
        }

        adjacencyList.forEach((neighbor) => {
          listL.push(neighbor);
          this.createTable(neighbor, end, visited);
        });
      }
    }
  };

  drawTable = () => {
    const table = document.getElementById("resultTable");
    const tableBody = document.getElementById("tableBody");
    const container = document.querySelector(".container");

    table.style.display = "block";
    container.style.justifyContent = "space-around";
    this.tableResult.forEach((row) => {
      const newRow = document.createElement("tr");

      const expandedNodeCell = document.createElement("td");
      expandedNodeCell.textContent = row.expandedNode;
      newRow.appendChild(expandedNodeCell);

      const adjacencyListCell = document.createElement("td");
      adjacencyListCell.textContent = row.adjacencyList;
      newRow.appendChild(adjacencyListCell);

      const listQCell = document.createElement("td");
      listQCell.textContent = row.listQ;
      newRow.appendChild(listQCell);

      const listLCell = document.createElement("td");
      listLCell.textContent = row.listL;
      newRow.appendChild(listLCell);
      tableBody.appendChild(newRow);
    });

    let lastRow = tableBody.children[tableBody.children.length - 1];
    for (let i = 0; i < lastRow.children.length; i++) {
      let col = lastRow.children[i];
      if (i > 0) {
        col.innerHTML = "(Stop)";
      }
    }
  };

  drawGraph = (list) => {
    // Parse edges to extract unique nodes
    const edges = list.map((edge) => {
      edge = edge.replace(/\r$/, "");
      const [source, target] = edge.split("-");
      return { source, target };
    });

    const nodes = Array.from(
      new Set(edges.flatMap((edge) => [edge.source, edge.target]))
    ).map((node) => ({ id: node }));

    // Order nodes alphabetically
    nodes.sort((a, b) => a.id.localeCompare(b.id));

    // Create an SVG container
    const svg = d3.select("svg");

    // Create links
    const links = svg
      .selectAll(".link")
      .data(edges)
      .enter()
      .append("line")
      .attr("class", "link");

    // Create nodes
    const nodeElements = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 15);

    // Create labels for nodes (sorted)
    const labels = svg
      .selectAll(".label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .text((d) => d.id);

    // Initialize the D3 force-directed graph simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(edges)
          .id((d) => d.id)
          .distance(100)
      ) // Set link distance
      .force("charge", d3.forceManyBody().strength(-300)) // Increase repulsive force
      .force("center", d3.forceCenter(window.innerWidth / 2, 200));

    // Update node and link positions during simulation
    simulation.on("tick", () => {
      links
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeElements.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    let getGraph = document.querySelector(".graph");
    getGraph.style.display = "block";
  };
}

//graph for hill climb
class GraphHillClimbing {
  constructor() {
    this.adjList = new Map(); // Adjacency list to represent the graph
    this.nodes = new Set(); // Set to keep track of all nodes in the graph
    this.heuristics = new Map(); // Map to store heuristic values for vertices
    this.hillClimbingResult = [];
    this.path = "";
  }

  // Method to add a vertex with its heuristic value to the graph
  addVertex(vertex, heuristic) {
    this.nodes.add(vertex); // Add vertex to the set of nodes
    this.heuristics.set(vertex, heuristic); // Associate the heuristic with the vertex
    this.adjList.set(vertex, []); // Initialize an empty array for the vertex's neighbors
  }

  // Method to add an edge between two vertices
  addEdge(source, target) {
    // Initialize an empty array for the source vertex if it doesn't exist in the adjacency list
    if (!this.adjList.has(source)) {
      this.adjList.set(source, []);
    }
    // Add the target vertex to the adjacency list of the source vertex
    this.adjList.get(source).push(target);
  }

  // Hill Climbing algorithm
  hillClimbing(start, goal) {
    let current = start;
    const path = [{ node: start, heuristic: 0, isGoal: false }];
    const visited = new Set(); // To track visited nodes

    while (current !== goal) {
      let nextNode = null;
      let minHeuristic = Infinity;

      // Mark the current node as visited
      visited.add(current);

      // Find all neighboring nodes of the current node
      const neighbors = this.adjList.get(current) || [];

      // Traverse through the neighboring nodes and choose the node with the smallest heuristic value
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const nodeHeuristic = this.heuristics.get(neighbor) || 0; // Get heuristic value associated with the node
          if (nodeHeuristic < minHeuristic) {
            minHeuristic = nodeHeuristic;
            nextNode = neighbor;
          }
        }
      }

      // If no next node is found, break the algorithm
      if (!nextNode) break;

      // Add the next node to the path and update the current node
      current = nextNode;
      path.push({ node: current, heuristic: minHeuristic, isGoal: current === goal });
    }

    // Assign the path to the path attribute of the class
    this.path = path.map(step => step.node).join("-> ");

    return path;
  }

  createTable(hillClimbResult) {
    const tableContent = [];
    hillClimbResult.forEach((step, index) => {
      const row = {
        ExpandedNode: step.node,
        Heuristic: this.heuristics.get(step.node),
        AdjacencyList: "",
        VisitedNodes: step.isGoal ? "(Stop)" : "",
      };
      // Check if the node has associated edges before creating the adjacency list
      if (this.adjList.has(step.node)) {
        row.AdjacencyList = this.adjList.get(step.node).map(edge => {
          const target = edge === step.node ? "" : edge;
          return `${target}-${this.heuristics.get(edge)}`;
        }).join(", ");
      }
      tableContent.push(row);
    });
    return tableContent;
  }
  
  exportTableToFile(filename) {
    const table = document.getElementById("HillClimbTable");
    if (!table) {
        console.error("Table not found.");
        return;
    }
  
    let content = '';
    const rows = Array.from(table.rows).map((row) =>
        Array.from(row.cells).map((cell) => cell.textContent.trim())
    );
  
    // Duyệt qua các hàng và ghép các giá trị cột thành một chuỗi, phân tách bằng khoảng trắng
    content = rows.map(row => row.join("     ")).join("\n");
    content += `\n\nPath: ${this.path}`; // Sử dụng giá trị của biến path
  
    // Tạo đối tượng Blob từ nội dung của bảng
    const blob = new Blob([content], { type: "text/plain" });
  
    // Tạo đường dẫn URL cho Blob để tạo liên kết tải xuống
    const downloadLink = document.createElement("a");
    if (window.URL && window.URL.createObjectURL) {
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = filename;
    } else {
        console.error("URL.createObjectURL is not supported in this environment.");
        return;
    }
  
    // Tạo và kích hoạt liên kết để tải xuống file
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  drawGraph(vertices, edges) {
  // Create an SVG container
  const svg = d3.select('#graph-container');

  // Set width and height of SVG container
  const width = 1300;
  const height = 600;
  svg.attr('width', width)
      .attr('height', height);

  // Create a group for the graph elements
  const graph = svg.append('g');

  // Create links
  const links = graph.selectAll('.link')
      .data(edges)
      .enter().append('line')
      .attr('class', 'link');

  // Create nodes
  const nodeElements = graph.selectAll('.node')
      .data(vertices)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', d => 13); // Increased node size

  // Create labels for nodes
  const labels = graph.selectAll('.label')
      .data(vertices)
      .enter().append('text')
      .attr('class', 'label')
      .text(d => d.id);

  // Create weight labels for nodes
  const weightLabels = graph.selectAll('.weight')
      .data(vertices)
      .enter().append('text')
      .attr('class', 'weight')
      .text(d => d.weight);

  // Initialize the D3 force-directed graph simulation
  const simulation = d3.forceSimulation(vertices)
      .force('link', d3.forceLink(edges).id(d => d.id).strength(0.05)) // Decreased link strength
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

  // Update node and link positions during simulation
  simulation.on('tick', () => {
      links
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

      nodeElements
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);

      labels
          .attr('x', d => d.x)
          .attr('y', d => d.y - 8); // Adjust label position above node

      weightLabels
          .attr('x', d => d.x)
          .attr('y', d => d.y + 8); // Adjust weight label position below node
  });

  // Apply a scale transform to make the graph larger
  svg.attr('transform', 'scale(1.5)');

  let getGraph = document.querySelector(".graph");
  getGraph.style.display = "block";
  }
}

// graph for branch bound
class GraphBranchAndBound {
  constructor() {
    this.nodes = [];
    this.edges = [];
  }

  addVertices(vertices) {
    this.nodes = vertices.map(vertex => ({ id: vertex.id, weight: vertex.weight }));
  }

  addEdges(edges) {
    this.edges = edges.map(edge => ({ source: edge.source, target: edge.target, weight: edge.weight }));
  }

  findShortestPath(init, goal) {
    const queue = [];
    const visited = new Set();
    queue.push({ path: [init], cost: 0 });

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const { path, cost } = queue.shift();
      const current = path[path.length - 1];

      if (current === goal) {
        return { path, cost };
      }

      if (!visited.has(current)) {
        visited.add(current);

        this.edges.filter(edge => edge.source === current).forEach(edge => {
          const neighbor = edge.target;
          if (!visited.has(neighbor)) {
            const newPath = [...path, neighbor];
            const newCost = cost + edge.weight;
            queue.push({ path: newPath, cost: newCost });
          }
        });
      }
    }

    return null; // If no path found
  }

  exportResultToFile(init, goal) {
    const result = this.findShortestPath(init, goal);
    if (result) {
      const content = `Shortest Path: ${result.path.join(' -> ')}\nCost: ${result.cost}`;
      const filename = 'shortest_path_result.txt';
      this.exportToFile(content, filename);
    } else {
      alert('No path found from ' + init + ' to ' + goal);
    }
  }

  exportToFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  drawGraph(vertices, edges) {
    // Set up the SVG container dimensions
    const width = 1300;
    const height = 600;

    // Create the SVG container
    const svg = d3.select("#graph-container")
        .attr("width", width)
        .attr("height", height);

    // Create a force simulation
    const simulation = d3.forceSimulation()
        .nodes(vertices)
        .force("link", d3.forceLink(edges).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Create edges
    const edge = svg.selectAll(".edge")
        .data(edges)
        .enter().append("line")
        .attr("class", "edge");

    // Create vertices
    const vertex = svg.selectAll(".vertex")
        .data(simulation.nodes())
        .enter().append("circle")
        .attr("class", "vertex")
        .attr("r", 25) // Adjust the scaling factor as needed

    // Add labels for vertices
    const label = svg.selectAll(".label")
        .data(simulation.nodes())
        .enter().append("text")
        .attr("class", "label")
        .attr("dy", ".35em")
        .text(d => d.id);

    // Add weights for edges
    const edgeWeight = svg.selectAll(".edge-weight")
        .data(edges)
        .enter().append("text")
        .attr("class", "weight")
        .attr("dy", "-1em") // Adjust the vertical position as needed
        .text(d => d.weight);

    // Add weights for vertices
    const vertexWeight = svg.selectAll(".vertex-weight")
        .data(simulation.nodes())
        .enter().append("text")
        .attr("class", "weight")
        .attr("dy", "1.5em") // Adjust the vertical position as needed
        .text(d => d.weight);

    // Add drag behavior to vertices
    vertex.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Update the position of elements in each tick of the simulation
    simulation.on("tick", () => {
      edge
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

      vertex
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);

      label
          .attr("x", d => d.x)
          .attr("y", d => d.y);

      edgeWeight
          .attr("x", d => (d.source.x + d.target.x) / 2)
          .attr("y", d => (d.source.y + d.target.y) / 2);

      vertexWeight
          .attr("x", d => d.x)
          .attr("y", d => d.y);
      });

    // Functions for drag behavior
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

      
    let getGraph = document.querySelector(".graph");
    getGraph.style.display = "block";
  }
}

const graphDfs = new GraphDfs();
const graphHillClimb = new GraphHillClimbing();
const graphBranchBound = new GraphBranchAndBound();

//handle event
const refreshBtn = document.getElementById("btn-refresh");
const resultBtn = document.getElementById("btn-result");
const exportBtn = document.getElementById("btn-export");

let currentAlgorithm = "dfs";

const handleChangeFile = (e) => {
  const fileInput = document.getElementById("fileInput");
  if (fileInput.files[0]) {
    const fileIcon = document.querySelector(".fa-upload");
    const fileLabel = document.querySelector(".file-text");
    fileIcon.className = "fa-solid fa-check";
    fileLabel.textContent = fileInput.files[0].name;
  } else {
    if (document.querySelector(".fa-check")) {
      const fileIcon = document.querySelector(".fa-check");
      const fileLabel = document.querySelector(".file-text");
      fileIcon.className = "fa-solid fa-upload";
      fileLabel.innerHTML = `<span class="highlight-text">Drag</span> & <span
      class="highlight-text">drop</span> any file here`;
    }
  }
};

const handleRemoveFile = () => {
  const fileInput = document.getElementById("fileInput");
  fileInput.value = "";
  handleChangeFile();
};

const buttonClicked = (btn) => {
  const btns = document.querySelectorAll(".algos-item");
  const title = document.querySelector(".title");
  const graph = document.getElementById('graph-container')

  graph.innerHTML = '';

  for (let i = 0; i < btns.length; i++) {
    if (currentAlgorithm !== btn.dataset.math) {
      handleRemoveFile();
    }
    if (btn === btns[i]) {
      currentAlgorithm = btns[i].dataset.math;
      let currentAlgorithmTitle = btns[i].dataset.title;

      title.textContent = currentAlgorithmTitle;

      if (!btns[i].classList.contains("active")) {
        btns[i].classList.add("active");
      } else {
        break;
      }
    } else {
      btns[i].classList.remove("active");
      const getGraph = document.querySelector(".graph");
      getGraph.style.display = "none";
    }
  }
};

refreshBtn.addEventListener("click", () => {
  location.reload();
});

// export file
exportBtn.addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files[0]) {
    alert("Please choose 1 file. No file chosen now!");
  } else {
    //handle logic algorithm
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const lines = content.split("\n");

      switch (currentAlgorithm) {
        case "dfs": {

          const verticesArr = lines[0].split(", ");
          const edgesArr = lines[1].split(", ");
          const startEnd = lines[2].split(" ");
          const start = startEnd[0];
          const end = startEnd[1];

          for (let i = 0; i < verticesArr.length; i++) {
            verticesArr[i] = verticesArr[i].replace(/\r$/, "");
            graphDfs.addVertex(verticesArr[i]);
          }

          for (let i = 0; i < edgesArr.length; i++) {
            edgesArr[i] = edgesArr[i].replace(/\r$/, "");
            let singleVerticeInEdges = edgesArr[i].split("-");
            graphDfs.addEdge(singleVerticeInEdges[0], singleVerticeInEdges[1]);
          }

          graphDfs.createTable(start, end);
          graphDfs.drawTable();

          const table = document.getElementById("resultTable");
          const rows = Array.from(table.rows).map((row) =>
            Array.from(row.cells)
              .map((cell) => padRight(cell.textContent, 20))
              .join("")
          );
          const blob = new Blob(
            [rows.join("\n"), `\n\n\nPath: ${graphDfs.findPath(start, end)}`],
            { type: "text/plain" }
          );
          const downloadLink = document.createElement("a");
          if (window.URL && window.URL.createObjectURL) {
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = fileInput.files[0].name;
          } else {
            console.error(
              "URL.createObjectURL is not supported in this environment."
            );
            return;
          }

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          break;
        }
        case "hillClimb": {        
            // Tạo đồ thị và các giá trị heuristic từ dữ liệu đầu vào
            const verticeHeuristic = lines[0].split(", ");
            const edges = lines[1].split(", ");
            const startEnd = lines[2].split(", ");
            const start = startEnd[0];
            const end = startEnd[1];

            for (let i = 0; i < verticeHeuristic.length; i++) {
              verticeHeuristic[i] = verticeHeuristic[i].replace(/\r$/, "");
              const [vertice, heuristic] = verticeHeuristic[i].split("-");
              graphHillClimb.addVertex(vertice, heuristic);
            }

            for (let i = 0; i < edges.length; i++) {
              edges[i] = edges[i].replace(/\r$/, "");
              const [source, target] = edges[i].split("-");
              graphHillClimb.addEdge(source, target);
            }
        
            // Chạy thuật toán Hill Climbing
            const hillClimbResult = graphHillClimb.hillClimbing(start, end);
            // Tạo bảng và xuất kết quả ra file output
            const tableContent = graphHillClimb.createTable(hillClimbResult);
            graphHillClimb.exportTableToFile("hill_climbing_table.txt", tableContent);
          break;
        }
        case "branchBound": {
          const verticesArr = lines[0].split(", ");
          const edgesArr = lines[1].split(", ");
          const startEnd = lines[2].split(", ");
          const start = startEnd[0];
          const end = startEnd[1];
          let formattedVertices = [];
          let formattedEdges = [];

          for(let i = 0; i < verticesArr.length; i++) {
            verticesArr[i] = verticesArr[i].replace(/\r$/, "")
            const verticeWeight = verticesArr[i].split("-");
            formattedVertices.push({id: verticeWeight[0], weight: +verticeWeight[1]})
          }
          for(let i = 0; i < edgesArr.length; i++) {
            edgesArr[i] = edgesArr[i].replace(/\r$/, "")
            const edgesWeight = edgesArr[i].split("-");
            formattedEdges.push({source: edgesWeight[0], target: edgesWeight[1], weight: +edgesWeight[2]})
          } 
          graphBranchBound.addVertices(formattedVertices)
          graphBranchBound.addEdges(formattedEdges)
          graphBranchBound.exportResultToFile(start, end)

          break;
        }
      }
    };
    reader.readAsText(fileInput.files[0]);
  }
});

// show graph
resultBtn.addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files[0]) {
    alert("Please choose 1 file. No file chosen now!");
  } else {
    if (!fileInput.files[0]) {
      alert("Please choose 1 file. No file chosen now!");
    } else {
      //handle logic algorithm
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split("\n");

        switch (currentAlgorithm) {
          case "dfs": {
            const edgesArr = lines[1].split(", ");
            graphDfs.drawGraph(edgesArr);
            break;
          }
          case "hillClimb": {
            const vertices = lines[0].split(", ");
            const edges = lines[1].split(", ");
            let formatEdges = [];
            let formatVertices = [];
            
            for(let i = 0; i < vertices.length; i++) {
              vertices[i] = vertices[i].replace(/\r$/, "")
              const verticeWeight = vertices[i].split("-");
              formatVertices.push({id: verticeWeight[0], weight: verticeWeight[1]});
              graphHillClimb.addVertex(verticeWeight[0], verticeWeight[1])
            }

            for(let i = 0; i < edges.length; i++) {
              edges[i] = edges[i].replace(/\r$/, "")
              const edgePair = edges[i].split("-");
              formatEdges.push({source: edgePair[0], target: edgePair[1]});
              graphHillClimb.addEdge(edgePair[0], edgePair[1])
            }

            graphHillClimb.drawGraph(formatVertices, formatEdges)
            break;
          }
          case "branchBound": {
            const verticesArr = lines[0].split(", ");
            const edgesArr = lines[1].split(", ");
            let formattedVertices = [];
            let formattedEdges = [];

            for(let i = 0; i < verticesArr.length; i++) {
              verticesArr[i] = verticesArr[i].replace(/\r$/, "")
              const verticeWeight = verticesArr[i].split("-");
              formattedVertices.push({id: verticeWeight[0], weight: +verticeWeight[1]})
            }
            for(let i = 0; i < edgesArr.length; i++) {
              edgesArr[i] = edgesArr[i].replace(/\r$/, "")
              const edgesWeight = edgesArr[i].split("-");
              formattedEdges.push({source: edgesWeight[0], target: edgesWeight[1], weight: +edgesWeight[2]})
            }
            graphBranchBound.drawGraph(formattedVertices, formattedEdges);

            break;
          }
        }
      };
      reader.readAsText(fileInput.files[0]);

      scrollToGraph();
    }
  }
});

// Helpers function
function padRight(str, length) {
  return (str + " ".repeat(length)).slice(0, length);
}

function scrollToGraph() {
  $(document).ready(function () {
    $("html, body").animate(
      {
        scrollTop: $("#end").offset().top,
      },
      500
    );
  });
}



