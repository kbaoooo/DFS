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
    return pathArr.join('->')
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

//graph for branch and bound

const graphDfs = new GraphDfs();

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

  for (let i = 0; i < btns.length; i++) {
    if(currentAlgorithm !== btn.dataset.math) {
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
        case "dfs":
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
            edgesArr[i] = edgesArr[i].replace(/\r$/, "")
            let singleVerticeInEdges = edgesArr[i].split("-");
            graphDfs.addEdge(singleVerticeInEdges[0], singleVerticeInEdges[1]);
          }

          graphDfs.createTable(start, end);
          graphDfs.drawTable();

          const table = document.getElementById("resultTable");
          const rows = Array.from(table.rows).map(row =>
            Array.from(row.cells).map(cell => padRight(cell.textContent, 20)).join('')
          );
          const blob = new Blob([rows.join("\n"), `\n\n\nPath: ${graphDfs.findPath(start, end)}`], { type: "text/plain" });
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
        case "hillClimb":
          break;
        case "branchBound":
          break;
      }
    };
    reader.readAsText(fileInput.files[0]);
  }
});

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
          case "dfs":
            const edgesArr = lines[1].split(", ");
            graphDfs.drawGraph(edgesArr);
            break;
          case "hillClimb":
            break;
          case "branchBound":
            break;
        }
      };
      reader.readAsText(fileInput.files[0]);
    }
  }
});

// Helpers function
function padRight(str, length) {
  return (str + ' '.repeat(length)).slice(0, length);
}

// A, B, C, D, E, F, G, K, I
// A-B, A-C, A-D, B-I, B-G, I-G, C-E, C-F, E-G, E-K, D-C, D-F, F-K
