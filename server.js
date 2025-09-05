import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

// Para usar __dirname com ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configurar helmet para cabeçalhos de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configurar CORS de forma mais segura
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Substitua pelo seu domínio em produção
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Limitar tamanho do JSON
app.use(express.json({ limit: '10mb' }));

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

// Funções utilitárias JWT
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// Schemas de validação Joi
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  })
});

const projectSchema = Joi.object({
  title: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Título não pode estar vazio',
    'string.max': 'Título deve ter no máximo 255 caracteres',
    'any.required': 'Título é obrigatório'
  }),
  description: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Descrição não pode estar vazia',
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  image: Joi.string().uri().required().messages({
    'string.uri': 'Imagem deve ser uma URL válida',
    'any.required': 'Imagem é obrigatória'
  }),
  link: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Link deve ser uma URL válida'
  }),
  order: Joi.number().integer().min(0).default(0)
});

const clientSchema = Joi.object({
  companyName: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Nome da empresa não pode estar vazio',
    'string.max': 'Nome da empresa deve ter no máximo 255 caracteres',
    'any.required': 'Nome da empresa é obrigatório'
  }),
  monthlyValue: Joi.number().positive().required().messages({
    'number.positive': 'Valor mensal deve ser um número positivo',
    'any.required': 'Valor mensal é obrigatório'
  }),
  dueDay: Joi.number().integer().min(1).max(31).required().messages({
    'number.min': 'Dia de vencimento deve ser entre 1 e 31',
    'number.max': 'Dia de vencimento deve ser entre 1 e 31',
    'any.required': 'Dia de vencimento é obrigatório'
  }),
  websiteLink: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Link do website deve ser uma URL válida'
  }),
  paymentStatus: Joi.string().valid('Pendente', 'Pago', 'Atrasado').default('Pendente').messages({
    'any.only': 'Status de pagamento deve ser: Pendente, Pago ou Atrasado'
  })
});

const expenseSchema = Joi.object({
  description: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Descrição não pode estar vazia',
    'string.max': 'Descrição deve ter no máximo 255 caracteres',
    'any.required': 'Descrição é obrigatória'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Valor deve ser um número positivo',
    'any.required': 'Valor é obrigatório'
  }),
  category: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Categoria não pode estar vazia',
    'string.max': 'Categoria deve ter no máximo 100 caracteres',
    'any.required': 'Categoria é obrigatória'
  }),
  date: Joi.date().required().messages({
    'date.base': 'Data deve ser uma data válida',
    'any.required': 'Data é obrigatória'
  }),
  frequency: Joi.string().valid('Única', 'Mensal', 'Anual').allow('', null).messages({
    'any.only': 'Frequência deve ser: Única, Mensal ou Anual'
  }),
  dueDate: Joi.date().allow(null).messages({
    'date.base': 'Data de vencimento deve ser uma data válida'
  }),
  status: Joi.string().valid('Pendente', 'Pago', 'Atrasado').default('Pendente').messages({
    'any.only': 'Status deve ser: Pendente, Pago ou Atrasado'
  })
});

// ROTAS DE AUTENTICAÇÃO
app.post('/api/auth/login', async (req, res) => {
  try {
    // Validar entrada
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }

    const { email, password } = value;
    
    // Verificar se é o admin
    if (email === process.env.ADMIN_EMAIL) {
      const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
      
      if (isValidPassword) {
        const user = {
          id: 1,
          email: process.env.ADMIN_EMAIL,
          name: 'Admin Lumenix',
          role: 'admin'
        };
        
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        res.json({ 
          user,
          accessToken,
          refreshToken
        });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para refresh token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' });
    }
    
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Refresh token inválido' });
      }
      
      const newUser = {
        id: user.id,
        email: user.email,
        name: 'Admin Lumenix',
        role: 'admin'
      };
      
      const accessToken = generateAccessToken(newUser);
      res.json({ accessToken });
    });
  } catch (error) {
    console.error('Erro no refresh:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTAS DE PROJETOS
// Rota pública para listar projetos
app.get('/api/projects', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM projects ORDER BY `order` ASC, created_at DESC');
    await connection.end();
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota protegida para criar projetos
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    // Validar entrada com Joi
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }
    
    const { title, description, image, link, order } = value;
    
    const connection = await getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO projects (title, description, image, link, `order`) VALUES (?, ?, ?, ?, ?)',
      [title, description, image, link || null, order || 0]
    );
    
    await connection.end();
    
    res.json({ 
      id: result.insertId, 
      title, 
      description, 
      image, 
      link: link || null,
      order: order || 0,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota protegida para atualizar projetos
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID do projeto inválido' });
    }
    
    // Validar entrada com Joi
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }
    
    const { title, description, image, link, order } = value;
    const connection = await getConnection();
    
    // Verificar se o projeto existe
    const [existing] = await connection.execute('SELECT id FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    await connection.execute(
      'UPDATE projects SET title = ?, description = ?, image = ?, link = ?, `order` = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, image, link || null, order || 0, id]
    );
    
    await connection.end();
    
    res.json({ 
      id: parseInt(id), 
      title, 
      description, 
      image, 
      link: link || null, 
      order: order || 0 
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota protegida para deletar projetos
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID do projeto inválido' });
    }
    
    const connection = await getConnection();
    
    // Verificar se o projeto existe
    const [existing] = await connection.execute('SELECT id FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    await connection.execute('DELETE FROM projects WHERE id = ?', [id]);
    await connection.end();
    
    res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTAS DE CLIENTES
// Rota protegida para listar clientes
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM clients ORDER BY created_at DESC');
    await connection.end();
    
    // Mapear os campos do banco para os nomes esperados pelo frontend
    const mappedRows = rows.map(row => ({
      id: row.id,
      companyName: row.company_name,
      monthlyValue: parseFloat(row.monthly_value) || 0,
      dueDay: parseInt(row.due_day) || 1,
      websiteLink: row.website_link,
      paymentStatus: row.payment_status,
      created_at: row.created_at
    }));
    
    res.json(mappedRows);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota protegida para criar clientes
app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    // Validar entrada com Joi
    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }
    
    const { companyName, monthlyValue, dueDay, websiteLink, paymentStatus } = value;
    
    const connection = await getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO clients (company_name, monthly_value, due_day, website_link, payment_status) VALUES (?, ?, ?, ?, ?)',
      [companyName, monthlyValue, dueDay, websiteLink || null, paymentStatus || 'Pendente']
    );
    
    await connection.end();
    
    res.status(201).json({ 
      id: result.insertId, 
      companyName,
      monthlyValue,
      dueDay,
      websiteLink: websiteLink || null,
      paymentStatus: paymentStatus || 'Pendente',
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Cliente já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// ROTAS DE DESPESAS
// Rota protegida para listar despesas
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM expenses ORDER BY created_at DESC');
    await connection.end();
    
    // Mapear os campos e garantir tipos corretos
    const mappedRows = rows.map(row => ({
      id: row.id,
      description: row.description,
      amount: parseFloat(row.amount) || 0,
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    // Validação com Joi
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { description, amount, category, date, frequency, dueDate, status } = value;
    
    const connection = await getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO expenses (description, amount, category, date, frequency, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [description, amount, category, date, frequency || null, dueDate || null, status || 'Pendente']
    );
    
    await connection.end();
    
    res.status(201).json({ 
      id: result.insertId, 
      description, 
      amount, 
      category, 
      date,
      frequency: frequency || null,
      dueDate: dueDate || null,
      status: status || 'Pendente',
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota protegida para atualizar despesa
app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID da despesa inválido' });
    }
    
    // Validação com Joi
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { description, amount, category, date, frequency, dueDate, status } = value;
    
    const connection = await getConnection();
    
    // Verificar se a despesa existe
    const [existing] = await connection.execute('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }
    
    await connection.execute(
      'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ?, frequency = ?, due_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [description, amount, category, date, frequency || null, dueDate || null, status || 'Pendente', id]
    );
    
    await connection.end();
    
    res.json({ 
      id: parseInt(id), 
      description, 
      amount, 
      category, 
      date,
      frequency: frequency || null,
      dueDate: dueDate || null,
      status: status || 'Pendente'
    });
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota protegida para atualizar cliente
app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID do cliente inválido' });
    }
    
    // Validação com Joi
    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { companyName, monthlyValue, dueDay, websiteLink, paymentStatus } = value;
    
    const connection = await getConnection();
    
    // Verificar se o cliente existe
    const [existing] = await connection.execute('SELECT id FROM clients WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    await connection.execute(
      'UPDATE clients SET company_name = ?, monthly_value = ?, due_day = ?, website_link = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [companyName, monthlyValue, dueDay, websiteLink || null, paymentStatus, id]
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTAS DE HISTÓRICO DE PAGAMENTOS
app.post('/api/payment-history', async (req, res) => {
  try {
    const { clientId, amountReceived, paymentDate, observations, status } = req.body;
    
    // Validação de campos obrigatórios
    if (!clientId || !amountReceived || !paymentDate || !status) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: clientId, amountReceived, paymentDate, status' 
      });
    }
    
    // Validação de tipos
    if (isNaN(parseInt(clientId))) {
      return res.status(400).json({ error: 'clientId deve ser um número válido' });
    }
    
    if (isNaN(parseFloat(amountReceived)) || parseFloat(amountReceived) <= 0) {
      return res.status(400).json({ error: 'amountReceived deve ser um número positivo' });
    }
    
    // Validação de data
    const paymentDateObj = new Date(paymentDate);
    if (isNaN(paymentDateObj.getTime())) {
      return res.status(400).json({ error: 'paymentDate deve ser uma data válida' });
    }
    
    // Validação de status
    const validStatuses = ['Pago', 'Pendente', 'Atrasado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'status deve ser: Pago, Pendente ou Atrasado' 
      });
    }
    
    const connection = await getConnection();
    
    // Verificar se o cliente existe
    const [clientExists] = await connection.execute(
      'SELECT id FROM clients WHERE id = ?', 
      [parseInt(clientId)]
    );
    
    if (clientExists.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Criar tabela de histórico se não existir
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        amount_received DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        observations TEXT,
        status ENUM('Pago', 'Pendente', 'Atrasado') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);
    
    // Inserir registro de pagamento
    const [result] = await connection.execute(
      'INSERT INTO payment_history (client_id, amount_received, payment_date, observations, status) VALUES (?, ?, ?, ?, ?)',
      [parseInt(clientId), parseFloat(amountReceived), paymentDate, observations?.trim() || null, status]
    );
    
    await connection.end();
    
    res.status(201).json({ 
      id: result.insertId,
      clientId: parseInt(clientId),
      amountReceived: parseFloat(amountReceived),
      paymentDate,
      observations: observations?.trim() || null,
      status,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar histórico de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

app.get('/api/payment-history/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    if (!clientId || isNaN(parseInt(clientId))) {
      return res.status(400).json({ error: 'ID do cliente inválido' });
    }
    
    const connection = await getConnection();
    
    // Verificar se o cliente existe
    const [clientExists] = await connection.execute(
      'SELECT id FROM clients WHERE id = ?', 
      [parseInt(clientId)]
    );
    
    if (clientExists.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Buscar histórico de pagamentos
    const [rows] = await connection.execute(
      'SELECT * FROM payment_history WHERE client_id = ? ORDER BY payment_date DESC',
      [parseInt(clientId)]
    );
    
    await connection.end();
    
    const mappedRows = rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      amountReceived: parseFloat(row.amount_received),
      paymentDate: row.payment_date,
      observations: row.observations,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json(mappedRows);
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
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

// Middleware para rotas não encontradas - deve ficar no final
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
  console.log(`🔗 Teste a conexão: http://localhost:${PORT}/api/test`);
});