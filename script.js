// Inicializa o admin fixo se não existir
if (!localStorage.getItem("usuarios")) {
  const users = [{ usuario: "admin", senha: "login@admin2730", tipo: "admin" }];
  localStorage.setItem("usuarios", JSON.stringify(users));
}

// ---- LOGIN ----
function realizarLogin() {
  const user = document.getElementById("loginUsuario").value.trim();
  const pass = document.getElementById("loginSenha").value.trim();

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const encontrado = usuarios.find(u => u.usuario === user && u.senha === pass);

  if (encontrado) {
    localStorage.setItem("usuarioLogado", JSON.stringify(encontrado));
    if (encontrado.tipo === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// ---- VERIFICAÇÕES DE ACESSO ----
function verificarUsuario() {
  const logado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (!logado || logado.tipo !== "usuario") {
    alert("Acesso restrito a usuários comuns.");
    window.location.href = "login.html";
    return false;
  }

  const existe = usuarios.some(u => u.usuario === logado.usuario && u.tipo === "usuario");
  if (!existe) {
    alert("Usuário não cadastrado. Faça login novamente.");
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
    return false;
  }

  return true;
}

function verificarAdmin() {
  const logado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!logado || logado.tipo !== "admin") {
    alert("Acesso restrito ao administrador.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// ---- LOGOUT ----
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// ---- ADMIN: CADASTRAR USUÁRIO ----
function cadastrarUsuario() {
  const nome = document.getElementById("novoUsuario").value.trim();
  const senha = document.getElementById("novaSenha").value.trim();
  if (!nome || !senha) return alert("Preencha usuário e senha");

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  if (usuarios.find(u => u.usuario === nome)) return alert("Usuário já existe");

  usuarios.push({ usuario: nome, senha, tipo: "usuario" });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Usuário cadastrado");
  document.getElementById("novoUsuario").value = "";
  document.getElementById("novaSenha").value = "";
  exibirUsuarios();
}

// ---- ADMIN: EXIBIR USUÁRIOS ----
function exibirUsuarios() {
  const lista = document.getElementById("listaUsuarios");
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  lista.innerHTML = "";

  usuarios
    .filter(u => u.tipo !== "admin")
    .forEach((u) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${u.usuario}
        <button onclick="removerUsuario('${u.usuario}')">Remover</button>
      `;
      lista.appendChild(li);
    });
}

// ---- ADMIN: REMOVER USUÁRIO ----
function removerUsuario(nome) {
  if (!confirm(`Deseja remover o usuário ${nome}?`)) return;
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios = usuarios.filter(u => u.usuario !== nome);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  exibirUsuarios();
}

// ---- ADMIN: EXIBIR TODOS PEDIDOS ----
function exibirTodosPedidos() {
  const div = document.getElementById("todosPedidos");
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  div.innerHTML = "";

  if (pedidos.length === 0) {
    div.innerHTML = "<p>Nenhum pedido encontrado.</p>";
    return;
  }

  // Ordenar pedidos do mais recente para o mais antigo
  const pedidosOrdenados = [...pedidos].reverse();

  pedidosOrdenados.forEach((pedido, index) => {
    const pedidoCard = document.createElement("div");
    pedidoCard.className = "pedido-card fade-in";
    
    // Formatar a lista de produtos
    const produtosLista = pedido.produtos.map(prod => `
      <div class="produto-item">
        <strong>${prod.nome}</strong><br>
        ${prod.quantidade}kg × R$${prod.preco.toFixed(2)} = R$${prod.subtotal.toFixed(2)}
      </div>
    `).join("");

    // Formatar data (se necessário)
    const dataFormatada = formatarDataParaExibicao(pedido.data);

    pedidoCard.innerHTML = `
      <h4>Pedido #${pedidos.length - index}</h4>
      <p><strong>Cliente:</strong> ${pedido.cliente}</p>
      <p><strong>Endereço:</strong> ${pedido.endereco}</p>
      <p><strong>Vendedor:</strong> ${pedido.usuario}</p>
      <div style="margin: 0.5rem 0;">
        <strong>Produtos:</strong>
        ${produtosLista}
      </div>
      <p><strong>Total:</strong> R$ ${pedido.total.toFixed(2)}</p>
      <p>
        <strong>Status:</strong> 
        <span class="badge ${pedido.pagou === "Sim" ? "badge-success" : "badge-danger"}">
          ${pedido.pagou}
        </span>
      </p>
      <p><strong>Data:</strong> ${dataFormatada}</p>
      ${pedido.observacao ? `<p><strong>Observação:</strong> ${pedido.observacao}</p>` : ''}
    `;
    div.appendChild(pedidoCard);
  });
}

// ---- ADMIN: CARREGAR VENDEDORES ----
function carregarVendedores() {
  const select = document.getElementById('vendedor');
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  
  // Limpar opções exceto a primeira
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  // Adicionar vendedores (usuários comuns)
  usuarios.filter(u => u.tipo === 'usuario').forEach(u => {
    const option = document.createElement('option');
    option.value = u.usuario;
    option.textContent = u.usuario;
    select.appendChild(option);
  });
}

// ---- ADMIN: GERAR RELATÓRIO ----
function gerarRelatorio() {
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const vendedor = document.getElementById('vendedor').value;
  const status = document.getElementById('status').value;
  
  if (!dataInicio || !dataFim) {
    alert('Selecione um período válido');
    return;
  }
  
  const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
  const resultadosDiv = document.getElementById('relatorioResultados');
  const totalDiv = document.getElementById('totalRelatorio');
  
  resultadosDiv.innerHTML = '';
  totalDiv.innerHTML = '';
  
  // Converter datas para comparar
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  fim.setHours(23, 59, 59, 999); // Incluir todo o dia final
  
  let totalGeral = 0;
  let html = `
    <table class="relatorio-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Vendedor</th>
          <th>Cliente</th>
          <th>Produtos</th>
          <th>Valor</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Ordenar pedidos do mais recente para o mais antigo
  const pedidosOrdenados = [...pedidos].reverse();
  
  pedidosOrdenados.forEach(pedido => {
    // Converter data do pedido para comparar
    const [dia, mes, ano] = pedido.data.split('/');
    const dataPedido = new Date(ano, mes - 1, dia);
    
    // Filtrar por período
    if (dataPedido < inicio || dataPedido > fim) return;
    
    // Filtrar por vendedor
    if (vendedor !== 'todos' && pedido.usuario !== vendedor) return;
    
    // Filtrar por status
    if (status !== 'todos' && pedido.pagou !== status) return;
    
    // Formatar produtos
    const produtos = pedido.produtos.map(p => 
      `${p.nome} (${p.quantidade}kg × R$${p.preco.toFixed(2)})`
    ).join('<br>');
    
    // Adicionar ao relatório
    html += `
      <tr>
        <td>${pedido.data}</td>
        <td>${pedido.usuario}</td>
        <td>${pedido.cliente}</td>
        <td>${produtos}</td>
        <td>R$ ${pedido.total.toFixed(2)}</td>
        <td class="${pedido.pagou === 'Sim' ? 'status-paid' : 'status-unpaid'}">${pedido.pagou}</td>
      </tr>
    `;
    
    totalGeral += pedido.total;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
   if (totalGeral === 0) {
    resultadosDiv.innerHTML = '<p>Nenhum pedido encontrado com os filtros selecionados.</p>';
  } else {
    resultadosDiv.innerHTML = `
      <div class="table-container">
        ${html}
      </div>
    `;
    totalDiv.innerHTML = `Total: R$ ${totalGeral.toFixed(2)}`;
  }
}


// ---- ADMIN: EXPORTAR RELATÓRIO PDF ----
function exportarRelatorioPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const vendedor = document.getElementById('vendedor').value;
  const status = document.getElementById('status').value;
  
  // Configurações do PDF
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.text("Relatório de Vendas", 105, 20, { align: "center" });
  
  // Informações do filtro
  doc.setFontSize(12);
  doc.text(`Período: ${formatarDataParaExibicao(dataInicio)} à ${formatarDataParaExibicao(dataFim)}`, 105, 30, { align: "center" });
  
  if (vendedor !== 'todos') {
    doc.text(`Vendedor: ${vendedor}`, 105, 36, { align: "center" });
  }
  
  if (status !== 'todos') {
    doc.text(`Status: ${status === 'Sim' ? 'Pagas' : 'Não Pagas'}`, 105, 42, { align: "center" });
  }
  
  // Linha divisória
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 48, 190, 48);
  
  // Configurações da tabela
  const columns = [
    { header: "Data", dataKey: "data", width: 25 },
    { header: "Vendedor", dataKey: "vendedor", width: 30 },
    { header: "Cliente", dataKey: "cliente", width: 40 },
    { header: "Produtos", dataKey: "produtos", width: 60 },
    { header: "Valor (R$)", dataKey: "valor", width: 25 },
    { header: "Status", dataKey: "status", width: 20 }
  ];
  
  // Preparar dados para a tabela
  const tableData = [];
  let totalGeral = 0;
  
  const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  fim.setHours(23, 59, 59, 999);
  
  // Ordenar pedidos do mais recente para o mais antigo
  const pedidosOrdenados = [...pedidos].reverse();
  
  pedidosOrdenados.forEach(pedido => {
    const [dia, mes, ano] = pedido.data.split('/');
    const dataPedido = new Date(ano, mes - 1, dia);
    
    // Aplicar filtros
    if (dataPedido < inicio || dataPedido > fim) return;
    if (vendedor !== 'todos' && pedido.usuario !== vendedor) return;
    if (status !== 'todos' && pedido.pagou !== status) return;
    
    // Formatador de produtos para caber na célula
    const produtos = pedido.produtos.map(p => 
      `${p.nome} (${p.quantidade}kg × R$${p.preco.toFixed(2)})`
    ).join('\n');
    
    tableData.push({
      data: pedido.data,
      vendedor: pedido.usuario,
      cliente: pedido.cliente.length > 20 ? pedido.cliente.substring(0, 17) + '...' : pedido.cliente,
      produtos: produtos,
      valor: pedido.total.toFixed(2),
      status: pedido.pagou
    });
    
    totalGeral += pedido.total;
  });
  
  if (tableData.length === 0) {
    alert('Nenhum dado para exportar com os filtros selecionados.');
    return;
  }
  
  // Adicionar tabela ao PDF
  doc.autoTable({
    startY: 50,
    head: [columns.map(col => col.header)],
    body: tableData.map(row => columns.map(col => row[col.dataKey])),
    columnStyles: columns.reduce((styles, col) => {
      styles[col.header] = { cellWidth: col.width };
      return styles;
    }, {}),
    headStyles: {
      fillColor: [67, 97, 238], // Cor azul do tema
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'left',
      valign: 'middle'
    },
    didDrawPage: function(data) {
      // Rodapé em cada página
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Página ${data.pageNumber}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    }
  });
  
  // Total geral (posiciona após a tabela)
  const finalY = doc.lastAutoTable.finalY || 100;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 130, finalY + 15);
  doc.text(`R$ ${totalGeral.toFixed(2)}`, 170, finalY + 15, { align: "right" });
  
  // Rodapé
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 285, { align: "center" });
  
  // Salvar PDF
  const nomeArquivo = `relatorio_vendas_${formatarDataParaExibicao(dataInicio)}_a_${formatarDataParaExibicao(dataFim)}.pdf`;
  doc.save(nomeArquivo);
}

// Função auxiliar para formatar data ISO para exibição
function formatarDataParaExibicao(dataString) {
  if (!dataString) return '';
  
  // Se já estiver no formato dd/mm/aaaa, retorna como está
  if (/\d{2}\/\d{2}\/\d{4}/.test(dataString)) {
    return dataString;
  }
  
  try {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  } catch (e) {
    return dataString;
  }
}

// ---- VENDEDOR: PEDIDOS ----

// Adicionar produto
function adicionarProduto() {
  const container = document.getElementById("produtos-container");
  const index = container.querySelectorAll(".produto-nome").length + 1;
  if (index > 5) return alert("Limite de 5 produtos atingido.");

  container.innerHTML += `
    <label>Produto ${index}:</label>
    <input type="text" class="produto-nome" placeholder="Nome do Produto" />
    <input type="number" class="produto-quantidade" placeholder="Quantidade (kg)" step="0.01" />
    <input type="number" class="produto-preco" placeholder="Preço por kg (R$)" step="0.01" />
  `;
}

// Salvar pedido
function salvarPedido() {
  const cliente = document.getElementById("cliente").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const pagou = document.getElementById("pagou").value;

  const nomes = document.querySelectorAll(".produto-nome");
  const quantidades = document.querySelectorAll(".produto-quantidade");
  const precos = document.querySelectorAll(".produto-preco");

  const produtos = [];
  let total = 0;

  for (let i = 0; i < nomes.length; i++) {
    const nome = nomes[i].value.trim();
    const quantidade = parseFloat(quantidades[i].value);
    const preco = parseFloat(precos[i].value);

    if (!nome || isNaN(quantidade) || isNaN(preco)) continue;

    const subtotal = quantidade * preco;
    total += subtotal;
    produtos.push({ nome, quantidade, preco, subtotal });
  }

  if (!cliente || !endereco || produtos.length === 0) {
    alert("Preencha todos os campos corretamente e adicione ao menos um produto válido.");
    return;
  }

  const logado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const usuarioAtual = logado.usuario;

  const pedido = {
    cliente,
    endereco,
    produtos,
    total,
    pagou,
    data: new Date().toLocaleDateString(),
    usuario: usuarioAtual,
  };

  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  alert("Pedido salvo com sucesso!");
  limparCampos();
  exibirHistorico();
}

// Limpar campos
function limparCampos() {
  document.getElementById("cliente").value = "";
  document.getElementById("endereco").value = "";
  document.getElementById("pagou").value = "Não";
  document.getElementById("produtos-container").innerHTML = `
    <label>Produto 1:</label>
    <input type="text" class="produto-nome" placeholder="Nome do Produto" />
    <input type="number" class="produto-quantidade" placeholder="Quantidade (kg)" step="0.01" />
    <input type="number" class="produto-preco" placeholder="Preço por kg (R$)" step="0.01" />
  `;
}

// Exibir histórico
function exibirHistorico() {
  const historico = document.getElementById("historico");
  historico.innerHTML = "";
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const busca = document.getElementById("buscaCliente").value.trim().toLowerCase();

  const logado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const usuarioAtual = logado.usuario;

  pedidos.slice().reverse().forEach((pedido, i) => {
    if (
      pedido.usuario === usuarioAtual &&
      (!busca || pedido.cliente.toLowerCase().includes(busca))
    ) {
      const div = document.createElement("div");
      div.className = "pedido";

      let produtosHTML = "";
      pedido.produtos.forEach(
        (p) =>
          (produtosHTML += `${p.nome} - ${p.quantidade} kg x R$${p.preco.toFixed(
            2
          )} = R$${p.subtotal.toFixed(2)}<br>`)
      );

      div.innerHTML = `
        <strong>${pedido.cliente}</strong> - ${pedido.data}<br>
        Endereço: ${pedido.endereco}<br>
        ${produtosHTML}
        <strong>Total: R$ ${pedido.total.toFixed(2)}</strong><br>
        <span class="${pedido.pagou === "Sim" ? "pago" : "nao-pago"}">situação do pagamento: ${
        pedido.pagou
      }</span><br>
        <button onclick="alterarStatus(${pedidos.length - 1 - i})">Alterar Status</button>
      `;
      historico.appendChild(div);
    }
  });
}

// Alterar status e gerar recibo PDF
async function alterarStatus(index) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const pedido = pedidos[index];
  pedido.pagou = pedido.pagou === "Sim" ? "Não" : "Sim";

  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  exibirHistorico();

  if (pedido.pagou === "Sim") {
    await gerarReciboPDF(pedido);
  }
}

// Gerar recibo em PDF
async function gerarReciboPDF(pedido) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("RECIBO DE PAGAMENTO", 105, 20, null, null, "center");

  doc.setFontSize(12);
  doc.text(`Cliente: ${pedido.cliente}`, 20, 40);
  doc.text(`Endereço: ${pedido.endereco}`, 20, 50);
  doc.text(`Data: ${pedido.data}`, 20, 60);
  doc.text(`Usuário: ${pedido.usuario}`, 20, 70);

  let y = 85;
  doc.text("Produtos:", 20, y);
  y += 10;

  pedido.produtos.forEach((p) => {
    const linha = `${p.nome} - ${p.quantidade}kg x R$${p.preco.toFixed(2)} = R$${p.subtotal.toFixed(2)}`;
    doc.text(linha, 25, y);
    y += 8;
  });

  doc.text(`Total: R$ ${pedido.total.toFixed(2)}`, 20, y + 10);
  doc.text("Status: PAGO", 20, y + 20);

  doc.save(`recibo_${pedido.cliente}_${pedido.data.replace(/\//g, "-")}.pdf`);
}

// Exportar CSV
function exportarCSV() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const logado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const usuarioAtual = logado.usuario;

  let csv = "\uFEFFCliente;Endereço;Produtos;Total;Pagou;Data\n";

  pedidos
    .filter((p) => p.usuario === usuarioAtual)
    .forEach((p) => {
      const produtos = p.produtos
        .map((pr) => `${pr.nome} (${pr.quantidade}kg x R$${pr.preco.toFixed(2).replace('.', ',')})`)
        .join(" | ");
      csv += `"${p.cliente.replace(/"/g, '""')}";"${p.endereco.replace(/"/g, '""')}";"${produtos}";${p.total.toFixed(2).replace('.', ',')};${p.pagou};"${p.data}"\n`;
    });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "meus_pedidos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}