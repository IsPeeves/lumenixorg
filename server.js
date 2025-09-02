import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Para usar __dirname com ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'projects');
    // Criar pasta se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'project-' + uniqueSuffix + extension);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

// Middleware para verificar conexão
const getConnection = async () => {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Erro de conexão:', error);
    throw error;
  }
};

// ROTAS DE AUTENTICAÇÃO
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Autenticação simples para admin
    if (email === 'comercial.lumenix@gmail.com' && password === 'lumenix.2025') {
      res.json({ 
        user: { 
          id: 1, 
          email: 'comercial.lumenix@gmail.com', 
          name: 'Admin Lumenix',
          role: 'admin' 
        },
        token: 'simple-token-admin'
      });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROTAS DE PROJETOS
app.get('/api/projects', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM projects ORDER BY `order` ASC, created_at DESC');
    await connection.end();
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Substituir o endpoint POST /api/projects atual
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, image, link, order } = req.body;
    
    // Validar campos obrigatórios
    if (!title || !description || !image) {
      return res.status(400).json({ error: 'Campos obrigatórios: title, description, image' });
    }
    
    const connection = await getConnection();
    
    // Garantir que não há valores undefined
    const projectOrder = (order !== undefined && order !== null) ? Number(order) : 0;
    const projectLink = link || null;
    
    const [result] = await connection.execute(
      'INSERT INTO projects (title, description, image, link, `order`) VALUES (?, ?, ?, ?, ?)',
      [title, description, image, projectLink, projectOrder]
    );
    
    await connection.end();
    
    res.json({ 
      id: result.insertId, 
      title, 
      description, 
      image, 
      link: projectLink,
      order: projectOrder,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Substituir o endpoint PUT /api/projects/:id atual
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, link, order } = req.body;
    const connection = await getConnection();
    
    // Garantir que não há valores undefined
    const projectOrder = (order !== undefined && order !== null) ? Number(order) : 0;
    const projectLink = link || null;
    
    await connection.execute(
      'UPDATE projects SET title = ?, description = ?, image = ?, link = ?, `order` = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, image, projectLink, projectOrder, id]
    );
    
    await connection.end();
    
    res.json({ id: parseInt(id), title, description, image, link: projectLink, order: projectOrder });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM projects ORDER BY `order` ASC, created_at DESC');
    await connection.end();
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();
    
    await connection.execute('DELETE FROM projects WHERE id = ?', [id]);
    await connection.end();
    
    res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ error: error.message });
  }
});

// ROTAS DE CLIENTES
app.get('/api/clients', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM clients ORDER BY created_at DESC');
    await connection.end();
    
    // Mapear os campos do banco para os nomes esperados pelo frontend
    const mappedRows = rows.map(row => ({
      id: row.id,
      companyName: row.company_name,
      monthlyValue: parseFloat(row.monthly_value) || 0, // Converter para número
      dueDay: parseInt(row.due_day) || 1, // Converter para número
      websiteLink: row.website_link,
      paymentStatus: row.payment_status,
      created_at: row.created_at
    }));
    
    res.json(mappedRows);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { companyName, monthlyValue, dueDay, websiteLink, paymentStatus } = req.body;
    
    // Validação de campos obrigatórios
    if (!companyName || !monthlyValue || !dueDay) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: companyName, monthlyValue, dueDay' 
      });
    }
    
    // Validação de tipos e valores
    if (typeof companyName !== 'string' || companyName.trim().length === 0) {
      return res.status(400).json({ 
        error: 'companyName deve ser uma string não vazia' 
      });
    }
    
    if (isNaN(parseFloat(monthlyValue)) || parseFloat(monthlyValue) <= 0) {
      return res.status(400).json({ 
        error: 'monthlyValue deve ser um número positivo' 
      });
    }
    
    if (isNaN(parseInt(dueDay)) || parseInt(dueDay) < 1 || parseInt(dueDay) > 31) {
      return res.status(400).json({ 
        error: 'dueDay deve ser um número entre 1 e 31' 
      });
    }
    
    // Validação de status de pagamento
    const validStatuses = ['Pendente', 'Pago', 'Atrasado'];
    if (paymentStatus && !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        error: 'paymentStatus deve ser: Pendente, Pago ou Atrasado' 
      });
    }
    
    // Validação de URL (se fornecida)
    if (websiteLink && websiteLink.trim() !== '') {
      try {
        new URL(websiteLink);
      } catch {
        return res.status(400).json({ 
          error: 'websiteLink deve ser uma URL válida' 
        });
      }
    }
    
    const connection = await getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO clients (company_name, monthly_value, due_day, website_link, payment_status) VALUES (?, ?, ?, ?, ?)',
      [companyName.trim(), parseFloat(monthlyValue), parseInt(dueDay), websiteLink?.trim() || null, paymentStatus || 'Pendente']
    );
    
    await connection.end();
    
    res.status(201).json({ 
      id: result.insertId, 
      companyName: companyName.trim(),
      monthlyValue: parseFloat(monthlyValue),
      dueDay: parseInt(dueDay),
      websiteLink: websiteLink?.trim() || null,
      paymentStatus: paymentStatus || 'Pendente',
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Cliente já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
    }
  }
});

// ROTAS DE DESPESAS - ADICIONANDO GET AUSENTE
app.get('/api/expenses', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM expenses ORDER BY created_at DESC');
    await connection.end();
    
    // Mapear os campos e garantir tipos corretos
    const mappedRows = rows.map(row => ({
      id: row.id,
      description: row.description,
      amount: parseFloat(row.amount) || 0, // Converter para número
      category: row.category,
      date: row.date,
      frequency: row.frequency,
      dueDate: row.due_date,
      status: row.status,
      created_at: row.created_at
    }));
    
    res.json(mappedRows);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    
    // Validação de campos obrigatórios
    if (!description || !amount || !category || !date) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: description, amount, category, date' 
      });
    }
    
    // Validação de tipos e valores
    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ 
        error: 'description deve ser uma string não vazia' 
      });
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        error: 'amount deve ser um número positivo' 
      });
    }
    
    if (typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({ 
        error: 'category deve ser uma string não vazia' 
      });
    }
    
    // Validação de data
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ 
        error: 'date deve ser uma data válida (formato: YYYY-MM-DD)' 
      });
    }
    
    const connection = await getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)',
      [description.trim(), parseFloat(amount), category.trim(), date]
    );
    
    await connection.end();
    
    res.status(201).json({ 
      id: result.insertId, 
      description: description.trim(), 
      amount: parseFloat(amount), 
      category: category.trim(), 
      date,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID da despesa inválido' });
    }
    
    const connection = await getConnection();
    
    // Verificar se a despesa existe
    const [existing] = await connection.execute('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }
    
    await connection.execute('DELETE FROM expenses WHERE id = ?', [id]);
    await connection.end();
    
    res.json({ message: 'Despesa deletada com sucesso', id: parseInt(id) });
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

// Adicionando rotas PUT e DELETE para expenses
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID da despesa inválido' });
    }
    
    // Validações similares ao POST
    if (!description || !amount || !category || !date) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: description, amount, category, date' 
      });
    }
    
    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ 
        error: 'description deve ser uma string não vazia' 
      });
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        error: 'amount deve ser um número positivo' 
      });
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ 
        error: 'date deve ser uma data válida (formato: YYYY-MM-DD)' 
      });
    }
    
    const connection = await getConnection();
    
    // Verificar se a despesa existe
    const [existing] = await connection.execute('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }
    
    await connection.execute(
      'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [description.trim(), parseFloat(amount), category.trim(), date, id]
    );
    
    await connection.end();
    
    res.json({ 
      id: parseInt(id), 
      description: description.trim(), 
      amount: parseFloat(amount), 
      category: category.trim(), 
      date
    });
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

// Adicionando rotas PUT e DELETE para clients
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, monthlyValue, dueDay, websiteLink, paymentStatus } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID do cliente inválido' });
    }
    
    // Validações similares ao POST
    if (companyName && (typeof companyName !== 'string' || companyName.trim().length === 0)) {
      return res.status(400).json({ 
        error: 'companyName deve ser uma string não vazia' 
      });
    }
    
    if (monthlyValue && (isNaN(parseFloat(monthlyValue)) || parseFloat(monthlyValue) <= 0)) {
      return res.status(400).json({ 
        error: 'monthlyValue deve ser um número positivo' 
      });
    }
    
    if (dueDay && (isNaN(parseInt(dueDay)) || parseInt(dueDay) < 1 || parseInt(dueDay) > 31)) {
      return res.status(400).json({ 
        error: 'dueDay deve ser um número entre 1 e 31' 
      });
    }
    
    const validStatuses = ['Pendente', 'Pago', 'Atrasado'];
    if (paymentStatus && !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        error: 'paymentStatus deve ser: Pendente, Pago ou Atrasado' 
      });
    }
    
    if (websiteLink && websiteLink.trim() !== '') {
      try {
        new URL(websiteLink);
      } catch {
        return res.status(400).json({ 
          error: 'websiteLink deve ser uma URL válida' 
        });
      }
    }
    
    const connection = await getConnection();
    
    // Verificar se o cliente existe
    const [existing] = await connection.execute('SELECT id FROM clients WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Construir query dinâmica apenas com campos fornecidos
    const updates = [];
    const values = [];
    
    if (companyName) {
      updates.push('company_name = ?');
      values.push(companyName.trim());
    }
    if (monthlyValue) {
      updates.push('monthly_value = ?');
      values.push(parseFloat(monthlyValue));
    }
    if (dueDay) {
      updates.push('due_day = ?');
      values.push(parseInt(dueDay));
    }
    if (websiteLink !== undefined) {
      updates.push('website_link = ?');
      values.push(websiteLink?.trim() || null);
    }
    if (paymentStatus) {
      updates.push('payment_status = ?');
      values.push(paymentStatus);
    }
    
    if (updates.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'Nenhum campo para atualizar fornecido' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await connection.execute(
      `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Buscar dados atualizados
    const [updated] = await connection.execute('SELECT * FROM clients WHERE id = ?', [id]);
    await connection.end();
    
    const updatedClient = updated[0];
    res.json({
      id: updatedClient.id,
      companyName: updatedClient.company_name,
      monthlyValue: updatedClient.monthly_value,
      dueDay: updatedClient.due_day,
      websiteLink: updatedClient.website_link,
      paymentStatus: updatedClient.payment_status,
      created_at: updatedClient.created_at
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID do cliente inválido' });
    }
    
    const connection = await getConnection();
    
    // Verificar se o cliente existe
    const [existing] = await connection.execute('SELECT id FROM clients WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    await connection.execute('DELETE FROM clients WHERE id = ?', [id]);
    await connection.end();
    
    res.json({ message: 'Cliente deletado com sucesso', id: parseInt(id) });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

// Rota de teste
app.get('/api/test', async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.execute('SELECT 1');
    await connection.end();
    res.json({ 
      message: 'Conexão com MySQL funcionando!', 
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST
    });
  } catch (error) {
    console.error('Erro de conexão:', error);
    res.status(500).json({ error: 'Erro de conexão: ' + error.message });
  }
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
  }
  
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ error: 'Erro de conexão com o banco de dados' });
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ADICIONAR OS ENDPOINTS DE UPLOAD AQUI (ANTES do middleware 404)
app.post('/api/upload/image', (req, res, next) => {
  console.log('📤 Recebendo requisição de upload...');
  console.log('Headers:', req.headers);
  next();
}, upload.single('image'), (req, res) => {
  try {
    console.log('📁 Arquivo recebido:', req.file);
    
    if (!req.file) {
      console.log('❌ Nenhum arquivo foi enviado');
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const imagePath = `/uploads/projects/${req.file.filename}`;
    console.log('✅ Upload realizado com sucesso:', imagePath);
    
    res.json({ 
      message: 'Imagem enviada com sucesso',
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/upload/image/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', 'projects', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Imagem deletada com sucesso' });
    } else {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware para rotas não encontradas - CORRIGIDO
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
  console.log(`🔗 Teste a conexão: http://localhost:${PORT}/api/test`);
});