'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  KeyRound,
  UserPlus,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldAlert,
  Code2,
  ExternalLink,
  LogOut,
  Sparkles,
  ArrowRight,
  Cookie,
  Layers,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Check,
  Copy,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';

interface StudentUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'instructor';
  isActive: boolean;
  createdAt: string;
}

interface ApiResponseState {
  endpoint: string;
  method: string;
  status: number;
  ok: boolean;
  isForbiddenDemo?: boolean;
  data: any;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [token, setToken] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentUser | null>(null);

  // Form de Login
  const [loginEmail, setLoginEmail] = useState('aluno@aula.com');
  const [loginPassword, setLoginPassword] = useState('aluno123');
  const [authMethod, setAuthMethod] = useState<'token' | 'cookie'>('token');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form de Registo
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Laboratório de Testes de API
  const [apiTestResponse, setApiTestResponse] = useState<ApiResponseState | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Módulos do Curso
  const [completedModules, setCompletedModules] = useState<number[]>([1, 2]);
  const [expandedModule, setExpandedModule] = useState<number | null>(1);

  // Carregar sessão salva do aluno ao iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('aluno_token');
    const savedUser = localStorage.getItem('aluno_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setStudent(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('aluno_token');
        localStorage.removeItem('aluno_user');
      }
    }
  }, []);

  // Login do Aluno
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const endpoint = authMethod === 'token' ? '/auth/login-token' : '/auth/login-cookie';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Para salvar e transmitir cookies HttpOnly
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Credenciais inválidas');
      }

      const receivedUser = json.data?.user || json.user;
      const accessToken =
        json.data?.accessToken || json.accessToken || 'cookie_session_active';

      localStorage.setItem('aluno_token', accessToken);
      localStorage.setItem('aluno_user', JSON.stringify(receivedUser));
      setToken(accessToken);
      setStudent(receivedUser);
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao entrar na conta do aluno');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Registo de Novo Aluno
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);
    setIsRegistering(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: 'user', // Registo pelo portal do aluno cria papel 'user'
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(json.message) ? json.message.join(', ') : json.message || 'Erro ao criar conta',
        );
      }

      setRegSuccess('Conta criada com sucesso! Faça login abaixo para aceder.');
      setLoginEmail(regEmail);
      setLoginPassword(regPassword);
      setActiveTab('login');
    } catch (err: any) {
      setRegError(err.message || 'Erro ao registar aluno');
    } finally {
      setIsRegistering(false);
    }
  };

  // Logout do Aluno
  const handleStudentLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}

    localStorage.removeItem('aluno_token');
    localStorage.removeItem('aluno_user');
    setToken(null);
    setStudent(null);
    setApiTestResponse(null);
  };

  // Testar Endpoint de Perfil Protegido
  const testStudentProfile = async () => {
    setIsTestingApi(true);
    try {
      const headers: Record<string, string> = {};
      if (token && token !== 'cookie_session_active') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        headers,
        credentials: 'include',
      });
      const json = await res.json();
      setApiTestResponse({
        endpoint: '/auth/me',
        method: 'GET',
        status: res.status,
        ok: res.ok,
        data: json,
      });
    } catch (err: any) {
      setApiTestResponse({
        endpoint: '/auth/me',
        method: 'GET',
        status: 500,
        ok: false,
        data: { error: err.message },
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Testar Endpoint Admin (Simulação Didática de RBAC 403 Forbidden)
  const testForbiddenAdminRoute = async () => {
    setIsTestingApi(true);
    try {
      const headers: Record<string, string> = {};
      if (token && token !== 'cookie_session_active') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/users`, {
        headers,
        credentials: 'include',
      });
      const json = await res.json();
      setApiTestResponse({
        endpoint: '/users (Exige Role: ADMIN)',
        method: 'GET',
        status: res.status,
        ok: res.ok,
        isForbiddenDemo: res.status === 403,
        data: json,
      });
    } catch (err: any) {
      setApiTestResponse({
        endpoint: '/users',
        method: 'GET',
        status: 500,
        ok: false,
        data: { error: err.message },
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Testar Endpoint de Health Check
  const testHealthRoute = async () => {
    setIsTestingApi(true);
    try {
      const res = await fetch(`${API_BASE}/health`);
      const json = await res.json();
      setApiTestResponse({
        endpoint: '/health (Liveness & Memory Probes)',
        method: 'GET',
        status: res.status,
        ok: res.ok,
        data: json,
      });
    } catch (err: any) {
      setApiTestResponse({
        endpoint: '/health',
        method: 'GET',
        status: 500,
        ok: false,
        data: { error: err.message },
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const toggleModule = (id: number) => {
    setCompletedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const courseModules = [
    {
      id: 1,
      title: '1. Fundamentos do NestJS & Injeção de Dependências',
      desc: 'Arquitetura modular, Controllers, Services e Inversão de Controlo (IoC).',
      topics: [
        'Organização de pastas e convenções oficiais do NestJS',
        'Uso do decorator @Injectable() e Providers',
        'ConfigModule com variáveis de ambiente .env seguras',
      ],
      codeSnippet: `@Injectable()\nexport class AuthService {\n  constructor(private readonly prisma: PrismaService) {}\n}`,
    },
    {
      id: 2,
      title: '2. Autenticação Dupla (JWT Bearer vs Cookies HttpOnly)',
      desc: 'Compreensão de estratégias Stateless vs Stateful e mitigação de vulnerabilidades XSS e CSRF.',
      topics: [
        'Tokens JWT com payload, assinatura digital e expiração',
        'Cookies com flags HttpOnly, Secure e SameSite=Lax/Strict',
        'Guarda Híbrida AuthGuard: validação transparente por header ou cookie',
      ],
      codeSnippet: `// Extração híbrida no NestJS Guard\nconst token = req.cookies?.['aula_session_id'] || \n  req.headers.authorization?.replace('Bearer ', '');`,
    },
    {
      id: 3,
      title: '3. Ciclo de Vida da Requisição & Middlewares',
      desc: 'Ordem exata de execução: Middlewares → Guards → Interceptors (Pre) → Pipes → Controller → Interceptors (Post) → Filters.',
      topics: [
        'LoggerMiddleware para registro de IP, método e status',
        'RequestIdMiddleware com injeção de cabeçalho X-Request-ID (UUID)',
        'ValidationPipe com class-validator e class-transformer',
        'AllExceptionsFilter para resposta uniforme em caso de erro',
      ],
      codeSnippet: `app.useGlobalPipes(new ValidationPipe({ whitelist: true }));\napp.useGlobalFilters(new AllExceptionsFilter());`,
    },
    {
      id: 4,
      title: '4. Banco de Dados com Prisma ORM & PostgreSQL',
      desc: 'Modelagem declarativa no schema.prisma, migrações seguras e relacionamentos.',
      topics: [
        'Containers PostgreSQL com docker-compose.yml',
        'Geração de client TypeScript tipado via prisma generate',
        'Seeds automáticos de utilizadores para a aula (Admin, Aluno, Professor)',
      ],
      codeSnippet: `model User {\n  id        String   @id @default(uuid())\n  email     String   @unique\n  role      String   @default("user")\n}`,
    },
    {
      id: 5,
      title: '5. Observabilidade & Probes com @nestjs/terminus',
      desc: 'Monitorização em tempo real de memória Heap, RSS e integridade dos serviços.',
      topics: [
        'Endpoint /health com probes de liveness',
        'MemoryHealthIndicator com limites máximos de Heap',
        'Proteção contra sobrecarga e degradação de performance',
      ],
      codeSnippet: `@Get('health')\n@HealthCheck()\ncheck() {\n  return this.health.check([\n    () => this.memory.checkHeap('mem_heap', 300 * 1024 * 1024),\n  ]);\n}`,
    },
    {
      id: 6,
      title: '6. Documentação Interativa com Scalar API Reference',
      desc: 'Substituição moderna do Swagger UI com import { apiReference } from "@scalar/nestjs-api-reference".',
      topics: [
        'Integração OpenAPI / Swagger sem fricção',
        'Documentação interativa na rota /reference com tema customizado',
        'Console de testes integrado para alunos explorarem os endpoints',
      ],
      codeSnippet: `import { apiReference } from '@scalar/nestjs-api-reference';\n\napp.use('/reference', apiReference({ theme: 'purple' }));`,
    },
  ];

  const progressPercent = Math.round((completedModules.length / courseModules.length) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar student={student} onLogout={handleStudentLogout} />

      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8 flex-1">
        {/* Banner Hero Público / Aluno */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-8 md:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 px-3 py-1 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
                Portal Oficial do Aluno
              </Badge>
              <Badge variant="outline" className="text-xs text-indigo-300 border-indigo-500/30">
                Porta :3002
              </Badge>
              <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30">
                Frontend Separado do Admin
              </Badge>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Aprenda NestJS na Prática
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Ambiente de testes dedicado aos alunos: experimente autenticação com <strong>Token JWT</strong> vs{' '}
              <strong>Cookies HttpOnly</strong>, verifique permissões de acesso com <strong>RBAC</strong> e interaja com os
              serviços da API em tempo real.
            </p>
          </div>
        </div>

        {/* Se o aluno NÃO estiver logado: Formulários de Login e Cadastro */}
        {!student ? (
          <div className="max-w-md mx-auto w-full space-y-6">
            <Card className="border-white/10 bg-slate-900/85 backdrop-blur-xl shadow-2xl">
              {/* Abas Alternadoras */}
              <div className="grid grid-cols-2 p-1.5 m-4 mb-0 bg-slate-950/70 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'login'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1.5 inline" />
                  Iniciar Sessão
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'register'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5 inline" />
                  Criar Conta
                </button>
              </div>

              {/* Formulário de Login */}
              {activeTab === 'login' && (
                <CardContent className="pt-6 space-y-4">
                  {regSuccess && (
                    <div className="p-3 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      {regSuccess}
                    </div>
                  )}

                  {loginError && (
                    <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Email do Aluno</label>
                      <Input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="aluno@aula.com"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Palavra-passe</label>
                      <Input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="aluno123"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    {/* Escolha do Método de Autenticação */}
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold text-slate-400">
                        Método de Autenticação para a Aula:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAuthMethod('token')}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            authMethod === 'token'
                              ? 'border-indigo-500 bg-indigo-500/15 text-white'
                              : 'border-white/5 bg-slate-950/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                            Token JWT
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Bearer Token (Stateless)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAuthMethod('cookie')}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            authMethod === 'cookie'
                              ? 'border-indigo-500 bg-indigo-500/15 text-white'
                              : 'border-white/5 bg-slate-950/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <Cookie className="w-3.5 h-3.5 text-amber-400" />
                            Cookie HttpOnly
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Sessão no Navegador</div>
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25"
                    >
                      {isLoggingIn ? 'A autenticar no NestJS...' : 'Entrar no Portal do Aluno'}
                    </Button>
                  </form>

                  {/* Botão de Preenchimento Rápido com Aluno Pré-cadastrado */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 border-dashed border-indigo-500/30"
                      onClick={() => {
                        setLoginEmail('aluno@aula.com');
                        setLoginPassword('aluno123');
                        setAuthMethod('token');
                      }}
                    >
                      ⚡ Preencher com Aluno Exemplo (aluno@aula.com)
                    </Button>
                  </div>
                </CardContent>
              )}

              {/* Formulário de Registo */}
              {activeTab === 'register' && (
                <CardContent className="pt-6 space-y-4">
                  {regError && (
                    <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                      {regError}
                    </div>
                  )}

                  <form onSubmit={handleStudentRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Seu Nome Completo</label>
                      <Input
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ex: Pedro Santos"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Seu Email</label>
                      <Input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="pedro@exemplo.com"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Palavra-passe (Mínimo 6)</label>
                      <Input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25"
                    >
                      {isRegistering ? 'A registar utilizador...' : 'Criar Minha Conta de Aluno'}
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* Banner Informativo sobre a Arquitetura da Aula */}
            <div className="p-4 rounded-xl border border-white/10 bg-slate-950/60 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Como esta aplicação funciona:
              </div>
              <p>
                Este frontend Next.js comunica com o backend NestJS em <code>http://localhost:3000</code>.
                Quando você inicia sessão com Token JWT, ele é transmitido no cabeçalho <code>Authorization: Bearer</code>.
                Com Cookie, o backend define um cookie <code>aula_session_id</code> com a flag <code>HttpOnly</code>.
              </p>
            </div>
          </div>
        ) : (
          /* Quando o Aluno ESTÁ Autenticado: Dashboard Completo */
          <div className="space-y-8">
            {/* Card de Perfil & Status da Sessão */}
            <Card className="border-indigo-500/30 bg-slate-900/70 backdrop-blur-xl shadow-xl">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/30">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{student.name}</h2>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold">
                        🎓 Papel: {student.role.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {student.email} • ID:{' '}
                      <code className="text-slate-300 bg-slate-950/60 px-1.5 py-0.5 rounded border border-white/5">
                        {student.id}
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="http://localhost:3000/reference"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all"
                  >
                    <span>Abrir Scalar Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <Button
                    variant="outline"
                    onClick={handleStudentLogout}
                    className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Terminar Sessão
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Barra de Progresso no Curso */}
            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Seu Progresso no Treinamento NestJS
                </span>
                <span className="text-cyan-300 font-bold">{progressPercent}% Concluído</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Grid Principal: Módulos do Curso (2 cols) vs Laboratório Prático (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna 1 & 2: Conteúdo Programático do Curso */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    Roteiro de Aulas & Conceitos
                  </h3>
                  <span className="text-xs text-slate-400">
                    Clique em um módulo para ver tópicos e código
                  </span>
                </div>

                <div className="space-y-3">
                  {courseModules.map((mod) => {
                    const isDone = completedModules.includes(mod.id);
                    const isExpanded = expandedModule === mod.id;

                    return (
                      <div
                        key={mod.id}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isDone
                            ? 'bg-slate-900/80 border-indigo-500/30 shadow-md shadow-indigo-500/5'
                            : 'bg-slate-950/40 border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'
                        }`}
                      >
                        {/* Header do Módulo */}
                        <div className="p-4 flex items-start gap-3.5 select-none">
                          <button
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            title={isDone ? 'Marcar como não concluído' : 'Marcar como concluído'}
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isDone
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-600 bg-slate-900 hover:border-indigo-400'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                          >
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-sm font-semibold ${
                                  isDone ? 'text-white' : 'text-slate-300'
                                }`}
                              >
                                {mod.title}
                              </h4>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
                          </div>
                        </div>

                        {/* Conteúdo Expandido com Tópicos e Código de Amostra */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-3 bg-slate-950/50">
                            <div>
                              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                Tópicos Práticos:
                              </div>
                              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                                {mod.topics.map((t, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    {t}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                Código de Demonstração no NestJS:
                              </div>
                              <pre className="p-3 rounded-lg bg-slate-950 border border-white/10 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                                {mod.codeSnippet}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coluna 3: Laboratório Prático de Testes de Requisição */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  Laboratório de Segurança & RBAC
                </h3>

                {/* Card de Teste dos Endpoints */}
                <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Testes ao Vivo de Autenticação
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Dispare requisições reais autenticadas para o backend NestJS e veja a resposta.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Teste 1: Rota Permitida */}
                    <Button
                      onClick={testStudentProfile}
                      disabled={isTestingApi}
                      className="w-full text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 justify-start"
                    >
                      <Unlock className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                      GET /auth/me (Meu Perfil) [200 OK]
                    </Button>

                    {/* Teste 2: Rota Proibida RBAC */}
                    <Button
                      onClick={testForbiddenAdminRoute}
                      disabled={isTestingApi}
                      className="w-full text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 justify-start"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 mr-2 text-rose-400" />
                      GET /users (Admin Only) [403 Proibido]
                    </Button>

                    {/* Teste 3: Health Check */}
                    <Button
                      onClick={testHealthRoute}
                      disabled={isTestingApi}
                      className="w-full text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 justify-start"
                    >
                      <Activity className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                      GET /health (Observabilidade)
                    </Button>

                    {/* Janela de Inspeção da Resposta HTTP */}
                    {apiTestResponse && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="text-slate-300 font-bold truncate max-w-[180px]">
                            {apiTestResponse.method} {apiTestResponse.endpoint}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              apiTestResponse.status === 200
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : apiTestResponse.status === 403
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }
                          >
                            Status: {apiTestResponse.status}
                          </Badge>
                        </div>

                        {apiTestResponse.isForbiddenDemo && (
                          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                            💡 <strong>Demonstração de RBAC:</strong> O aluno autenticado possui role{' '}
                            <code>user</code>. O endpoint <code>/users</code> está protegido com{' '}
                            <code>@Roles('admin')</code>, resultando em 403 Forbidden!
                          </div>
                        )}

                        <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-56 p-2 rounded bg-black/40">
                          {JSON.stringify(apiTestResponse.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Card do Token JWT / Cookie */}
                <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-cyan-400" />
                        Credencial Ativa
                      </div>
                      {token && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(token)}
                          className="text-[11px] text-indigo-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedToken ? 'Copiado!' : 'Copiar'}
                        </button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-400 break-all select-all">
                      {token}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {token?.startsWith('eyJ')
                        ? '🔑 Token JWT Stateless: transmitido via cabeçalho Authorization: Bearer <token>.'
                        : '🍪 Cookie HttpOnly Stateful: gerido automaticamente pelo navegador via Set-Cookie.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Didático */}
      <footer className="border-t border-white/10 bg-slate-950/80 px-6 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NestJS Classroom • Projeto Didático de Aula Full-Stack</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>NestJS API (:3000)</span>
            <span>•</span>
            <span>Admin Panel (:3001)</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">Portal do Aluno (:3002)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
