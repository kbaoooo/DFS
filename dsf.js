
const verticesInput = document.getElementById("verticesInput");
const edgesInput = document.getElementById("edgesInput");
const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");
const btnResult = document.getElementById("btn-result");
const refreshBtn = document.getElementById("btn-refresh");

let stopFlag = false;
let listQ = [];
let listL = [];

class Graph {
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
    const pathTitle = document.getElementById("path-title");
    const pathHtml = document.getElementById("path");
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

    const pathArr = dfsHelper(startVertex);
    console.log(pathArr);
    pathTitle.innerHTML = "Đường đi từ " + startInput.value + " đến " + endInput.value + ": ";
    if(pathArr !== null) {
      pathHtml.innerHTML = pathArr.join(" -> ");
    } else {
      pathHtml.innerHTML = "Không có đường đi từ " + startInput.value + " đến " + endInput.value;
    }
  }

  createTable = (node, visited = {}) => {
    if (!visited[node] && !stopFlag) {
      visited[node] = true;
      const adjacencyList = graph.adjacencyList[node];

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

        if (node === endInput.value) {
          stopFlag = true;
          return;
        }

        adjacencyList.forEach((neighbor) => {
          listL.push(neighbor);
          this.createTable(neighbor, visited);
        });
      }
    }
  };

  drawTable = () => {
    const table = document.getElementById('resultTable');
    const tableBody = document.getElementById("tableBody");
    const container = document.querySelector('.container')

    table.style.display = 'block';
    container.style.justifyContent = 'space-around';

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
}

const graph = new Graph();

btnResult.addEventListener("click", () => {
  btnResult.disabled = true;
  btnResult.style.backgroundColor = '#a14406';
  btnResult.style.color = "gray";
  btnResult.style.cursor = "default";
  const verticesInputArr = verticesInput.value.trim().split(", ");
  const edgesInputArr = edgesInput.value.trim().split(", ");

  for(let i = 0; i < verticesInputArr.length; i++) {
    graph.addVertex(verticesInputArr[i])
  }

  for(let i = 0; i < edgesInputArr.length; i++) {
    const singleVertice = edgesInputArr[i].split('-');
    graph.addEdge(singleVertice[0], singleVertice[1])
  }

  graph.createTable(startInput.value);
  graph.drawTable();
  graph.findPath(startInput.value, endInput.value);
});

refreshBtn.addEventListener('click', () => {
  location.reload();
})

// A, B, C, D, E, F, G, K, I
// A-B, A-C, A-D, B-I, B-G, I-G, C-E, C-F, E-G, E-K, D-C, D-F, F-K
