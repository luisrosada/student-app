'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Shield,
  ExternalLink,
  Activity,
  LogOut,
  Sparkles,
  BookOpen,
  Terminal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  student?: {
    name: string;
    email: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

export function Navbar({ student, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Marca do Portal do Aluno */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">NestJS Academy</span>
              <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/30 font-medium">
                Portal do Aluno
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">Ambiente de Aprendizagem & Testes de API</p>
          </div>
        </Link>

        {/* Links Externos & Ferramentas Didáticas */}
        <div className="flex items-center gap-2.5">
          {/* Link para Scalar Docs da API */}
          <a
            href="http://localhost:3000/reference"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors"
          >
            <span>📖 Scalar Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Link para o Painel Admin (porta 3001) */}
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin :3001</span>
          </a>

          {/* Status do Backend */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            API :3000
          </div>

          {/* Se aluno autenticado, botão de logout */}
          {student && onLogout && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 h-8"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sair
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
