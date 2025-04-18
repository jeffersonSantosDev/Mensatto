// flow‑builder.js

document.addEventListener("DOMContentLoaded", () => {
    // Declare jsPlumb
    const jsPlumb = window.jsPlumb;
  
    // Initialize jsPlumb
    const jsPlumbInstance = jsPlumb.getInstance({
      Endpoint: ["Dot", { radius: 2 }],
      Connector: ["Bezier", { curviness: 50 }],
      HoverPaintStyle: { stroke: "#1F3D30", strokeWidth: 2 },
      ConnectionOverlays: [["Arrow", { location: 1, width: 10, length: 10 }]],
      DragOptions: { cursor: "pointer", zIndex: 2000 },
      PaintStyle: { stroke: "#456", strokeWidth: 2 },
      Container: "flowCanvas",
    });
  
    jsPlumbInstance.bind("beforeDrop", function(info) {
        // info.sourceId e info.targetId são as IDs dos elementos
        // retorna false para impedir loopback
        return info.sourceId !== info.targetId;
      });
      
    // Node counter for generating unique IDs
    let nodeCounter = 0;
    let selectedNode = null;
  
    // Initial nodes data
    const initialNodes = [
      {
        id: "node1",
        type: "message",
        position: { left: 100, top: 100 },
        data: {
          label: "Mensagem de Boas‑vindas",
          message: "👋 Olá! Bem‑vindo ao nosso serviço. Como podemos ajudá‑lo hoje?",
        },
      },
      {
        id: "node2",
        type: "options",
        position: { left: 300, top: 100 },
        data: {
          label: "Menu Principal",
          message: "Por favor, selecione uma opção:",
          options: [
            { id: "opt1", text: "Produtos" },
            { id: "opt2", text: "Serviços" },
            { id: "opt3", text: "Suporte" },
          ],
        },
      },
      {
        id: "node3",
        type: "end",
        position: { left: 500, top: 100 },
        data: {
          label: "Fim da Conversa",
          message: "Obrigado por entrar em contato. Tenha um ótimo dia!",
        },
      },
    ];
  
    // Initial connections
    const initialConnections = [
      { source: "node1", target: "node2" },
      { source: "node2", target: "node3" },
    ];
  
    // Create flow canvas
    const flowCanvas = document.getElementById("flowCanvas");
  
    // Function to create a node element
    function createNodeElement(nodeData) {
      const nodeElement = document.createElement("div");
      nodeElement.id = nodeData.id;
      nodeElement.className = `flow-node flow-node-${nodeData.type}`;
      nodeElement.style.left = `${nodeData.position.left}px`;
      nodeElement.style.top = `${nodeData.position.top}px`;
  
      // Header
      const nodeHeader = document.createElement("div");
      nodeHeader.className = "flow-node-header";
      nodeHeader.textContent = nodeData.data.label;
      nodeElement.appendChild(nodeHeader);
  
      // Content
      const nodeContent = document.createElement("div");
      nodeContent.className = "flow-node-content";
      nodeContent.textContent = nodeData.data.message;
      nodeElement.appendChild(nodeContent);
  
      // Options list (for 'options' type)
      if (nodeData.type === "options" && nodeData.data.options) {
        const optionsList = document.createElement("div");
        optionsList.className = "flow-node-options-list";
        nodeData.data.options.forEach((opt) => {
          const optDiv = document.createElement("div");
          optDiv.className = "flow-node-option";
          optDiv.textContent = opt.text;
          optionsList.appendChild(optDiv);
        });
        nodeElement.appendChild(optionsList);
      }
  
      // Add to canvas
      flowCanvas.appendChild(nodeElement);
  
      // Make draggable
      jsPlumbInstance.draggable(nodeElement, {
        grid: [10, 10],
        containment: "parent",
      });
  
      // Add endpoints
      if (nodeData.type !== "end") {
        jsPlumbInstance.addEndpoint(nodeElement, {
          anchor: "Bottom",
          isSource: true,
          maxConnections: -1,
          cssClass: "endpoint endpoint-source",
        });
      }
      if (nodeData.type !== "message") {
        jsPlumbInstance.addEndpoint(nodeElement, {
          anchor: "Top",
          isTarget: true,
          maxConnections: -1,
          cssClass: "endpoint endpoint-target",
        });
      }
  
      // Enable draggable connections (source & target)
      jsPlumbInstance.makeSource(nodeElement, {
        filter: ".flow-node-header",
        anchor: "Continuous",
        connector: ["Bezier", { curviness: 50 }],
        connectorStyle: { stroke: "#6c757d", strokeWidth: 2 },
        maxConnections: -1,
        overlays: [["Arrow", { location: 1, width: 10, length: 10 }]],
      });
      jsPlumbInstance.makeTarget(nodeElement, {
        anchor: "Continuous",
        dropOptions: { hoverClass: "dragHover" },
        maxConnections: -1,
      });
  
      // Click to select node
      nodeElement.addEventListener("click", (e) => {
        e.stopPropagation();
        selectNode(nodeData);
      });
  
      return nodeElement;
    }
  
    // Select a node for editing
    function selectNode(nodeData) {
      if (selectedNode) {
        const prevEl = document.getElementById(selectedNode.id);
        if (prevEl) prevEl.classList.remove("selected");
      }
      selectedNode = nodeData;
      const el = document.getElementById(nodeData.id);
      if (el) el.classList.add("selected");
  
      document.getElementById("noNodeSelected").classList.add("d-none");
      document.getElementById("nodeEditForm").classList.remove("d-none");
      document.getElementById("nodeLabel").value = nodeData.data.label;
      document.getElementById("nodeMessage").value = nodeData.data.message;
  
      const optionsSection = document.getElementById("optionsSection");
      const optionsList = document.getElementById("optionsList");
      if (nodeData.type === "options") {
        optionsSection.classList.remove("d-none");
        optionsList.innerHTML = "";
        nodeData.data.options.forEach(addOptionToForm);
      } else {
        optionsSection.classList.add("d-none");
      }
    }
  
    // Add one option row in the editor
    function addOptionToForm(option) {
      const list = document.getElementById("optionsList");
      const wrapper = document.createElement("div");
      wrapper.className = "option-item";
      wrapper.dataset.optionId = option.id;
      wrapper.innerHTML = `
        <input type="text" class="form-control form-control-sm" value="${option.text}">
        <button class="btn btn-sm btn-outline-danger remove-option-btn">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      list.appendChild(wrapper);
  
      wrapper.querySelector("input").addEventListener("change", (e) => {
        updateOption(option.id, e.target.value);
      });
      wrapper.querySelector(".remove-option-btn").addEventListener("click", () => {
        removeOption(option.id);
        wrapper.remove();
      });
    }
  
    // Update one option’s text
    function updateOption(optId, text) {
      if (!selectedNode || selectedNode.type !== "options") return;
      selectedNode.data.options = selectedNode.data.options.map((o) =>
        o.id === optId ? { ...o, text } : o
      );
      updateNodeDisplay(selectedNode);
    }
  
    // Remove an option from the node
    function removeOption(optId) {
      if (!selectedNode || selectedNode.type !== "options") return;
      selectedNode.data.options = selectedNode.data.options.filter((o) => o.id !== optId);
      updateNodeDisplay(selectedNode);
    }
  
    // Add a fresh option
    function addOption() {
      if (!selectedNode || selectedNode.type !== "options") return;
      const newId = `opt${selectedNode.data.options.length + 1}`;
      const newOpt = { id: newId, text: `Opção ${selectedNode.data.options.length + 1}` };
      selectedNode.data.options.push(newOpt);
      addOptionToForm(newOpt);
      updateNodeDisplay(selectedNode);
    }
  
    // Refresh the node’s DOM to match its data
    function updateNodeDisplay(nodeData) {
      const el = document.getElementById(nodeData.id);
      if (!el) return;
      el.querySelector(".flow-node-header").textContent = nodeData.data.label;
      el.querySelector(".flow-node-content").textContent = nodeData.data.message;
      if (nodeData.type === "options") {
        const list = el.querySelector(".flow-node-options-list");
        list.innerHTML = "";
        nodeData.data.options.forEach((o) => {
          const div = document.createElement("div");
          div.className = "flow-node-option";
          div.textContent = o.text;
          list.appendChild(div);
        });
      }
    }
  
    // Add a brand‑new node
    function addNode(type) {
      nodeCounter++;
      const id = `node${Date.now()}`;
      let label, message, options;
      if (type === "message") {
        label = "Nova Mensagem";
        message = "Digite sua mensagem aqui";
      } else if (type === "options") {
        label = "Novas Opções";
        message = "Selecione uma opção:";
        options = [{ id: "opt1", text: "Opção 1" }];
      } else {
        label = "Fim da Conversa";
        message = "Obrigado por entrar em contato!";
      }
      const newNode = {
        id,
        type,
        position: { left: 200, top: 200 },
        data: { label, message, options },
      };
      createNodeElement(newNode);
      selectNode(newNode);
    }
  
    // Delete the currently selected node
    function deleteNode() {
      if (!selectedNode) return;
      jsPlumbInstance.remove(selectedNode.id); // removes connections too
      document.getElementById(selectedNode.id).remove();
      selectedNode = null;
      document.getElementById("noNodeSelected").classList.remove("d-none");
      document.getElementById("nodeEditForm").classList.add("d-none");
    }
  
    // Tiny toast helper
    function showToast(msg, type) {
      const container = document.getElementById("toastContainer");
      if (!container) return;
      const t = document.createElement("div");
      t.className = `toast bg-${type} text-white`;
      t.setAttribute("role", "alert");
      t.setAttribute("aria-live", "assertive");
      t.setAttribute("aria-atomic", "true");
      t.innerHTML = `<div class="toast-body">${msg}</div>`;
      container.appendChild(t);
      const bs = new bootstrap.Toast(t, { delay: 2000 });
      bs.show();
      t.addEventListener("hidden.bs.toast", () => t.remove());
    }
  
    // Initialize everything
    function initFlowBuilder() {
      // create initial nodes
      initialNodes.forEach(createNodeElement);
      // create initial connections
      jsPlumbInstance.batch(() => {
        initialConnections.forEach((c) =>
          jsPlumbInstance.connect({ source: c.source, target: c.target })
        );
      });
      // add‑node buttons
      document.querySelectorAll(".node-btn").forEach((btn) =>
        btn.addEventListener("click", () => addNode(btn.dataset.nodeType))
      );
      // delete button
      document.getElementById("deleteNodeBtn").addEventListener("click", deleteNode);
      // options
      document.getElementById("addOptionBtn").addEventListener("click", addOption);
      // save/export/preview
      document.getElementById("saveBtn").addEventListener("click", () => showToast("Fluxo salvo!", "success"));
      document.getElementById("exportBtn").addEventListener("click", () => showToast("Exportado!", "info"));
      document.getElementById("previewBtn").addEventListener("click", () => showToast("Visualizando...", "primary"));
      // deselect on canvas click
      flowCanvas.addEventListener("click", (e) => {
        if (e.target === flowCanvas) {
          if (selectedNode) {
            document.getElementById(selectedNode.id).classList.remove("selected");
          }
          selectedNode = null;
          document.getElementById("noNodeSelected").classList.remove("d-none");
          document.getElementById("nodeEditForm").classList.add("d-none");
        }
      });
      // zoom
      let scale = 1;
      document.getElementById("zoomIn").addEventListener("click", () => {
        scale *= 1.1;
        flowCanvas.style.transform = `scale(${scale})`;
      });
      document.getElementById("zoomOut").addEventListener("click", () => {
        scale /= 1.1;
        flowCanvas.style.transform = `scale(${scale})`;
      });
      document.getElementById("resetView").addEventListener("click", () => {
        scale = 1;
        flowCanvas.style.transform = "scale(1)";
      });
    }
  
    // on ready...
    jsPlumb.ready(initFlowBuilder);
  });
  