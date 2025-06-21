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

  pedidos.forEach((p, i) => {
    const pedidoCard = document.createElement("div");
    pedidoCard.className = "pedido-card fade-in";
    
    // Montar lista de produtos
    const produtosLista = p.produtos.map(prod => {
      return `
        <div class="produto-item">
          <strong>${prod.nome}</strong><br>
          ${prod.quantidade}kg × R$${prod.preco.toFixed(2)} = R$${prod.subtotal.toFixed(2)}
        </div>
      `;
    }).join("");

    pedidoCard.innerHTML = `
      <h4>Pedido #${i + 1}</h4>
      <p><strong>Cliente:</strong> ${p.cliente}</p>
      <p><strong>Endereço:</strong> ${p.endereco}</p>
      <p><strong>Vendedor:</strong> ${p.usuario}</p>
      <div style="margin: 0.5rem 0;">
        <strong>Produtos:</strong>
        ${produtosLista}
      </div>
      <p><strong>Total:</strong> R$ ${p.total.toFixed(2)}</p>
      <p>
        <strong>Status:</strong> 
        <span class="badge ${p.pagou === "Sim" ? "badge-success" : "badge-danger"}">
          ${p.pagou}
        </span>
      </p>
      <p><strong>Data:</strong> ${p.data}</p>
    `;
    div.appendChild(pedidoCard);
  });
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

// ---- GERAR RELATÓRIO DE VENDAS PAGAS ----
function gerarRelatorioVendas() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const logado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  // Filtrar pedidos pagos do mês atual
  const vendasPagas = pedidos.filter(pedido => {
    if (pedido.pagou !== "Sim") return false;
    
    const [dia, mes, ano] = pedido.data.split('/');
    const dataPedido = new Date(ano, mes - 1, dia);
    
    return dataPedido.getMonth() + 1 === mesAtual && 
           dataPedido.getFullYear() === anoAtual &&
           pedido.usuario === logado.usuario;
  });

  if (vendasPagas.length === 0) {
    alert("Nenhuma venda paga encontrada neste mês.");
    return;
  }

  // Cabeçalho com codificação UTF-8 BOM para Excel
   let csv = "\uFEFF"; // BOM para UTF-8
  csv += "Data (dd/mm/aaaa);Cliente;Produto;Quantidade (kg);Preço Unitário;Subtotal\n";

  
  let totalGeral = 0;

  // Preencher os dados
  vendasPagas.forEach(pedido => {
    // Formatar a data para o padrão internacional (aaaa-mm-dd) que o Excel entende melhor
    const [dia, mes, ano] = pedido.data.split('/');
    const dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    
    pedido.produtos.forEach(produto => {
      csv += [
  `"${pedido.data}"`,
        `"${pedido.cliente.replace(/"/g, '""')}"`,
        `"${produto.nome.replace(/"/g, '""')}"`,
        produto.quantidade.toString().replace('.', ','),
        produto.preco.toFixed(2).replace('.', ','),
        produto.subtotal.toFixed(2).replace('.', ',')
      ].join(';') + '\n';
      
      totalGeral += produto.subtotal;
    });
  });

  // Rodapé com total geral
    csv += `\n;;;;"Total Geral";"R$ ${totalGeral.toFixed(2).replace('.', ',')}"`;

  // Criar e baixar o arquivo
   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const nomeArquivo = `vendas_pagas_${mesAtual}_${anoAtual}.csv`;
  
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}