import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { getStoredUser, refreshIfExpiringSoon } from '../../modules/auth/services/authService';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/pages/RegisterPage';
import { ActivarContaPage } from '../../modules/auth/pages/ActivarContaPage';
import { AlterarSenhaPage } from '../../modules/auth/pages/AlterarSenhaPage';
import { DashboardPage } from '../../modules/dashboard/pages/DashboardPage';
import { StudentDashboardPage } from '../../modules/dashboard/pages/StudentDashboardPage';
import { ProfessorDashboardPage } from '../../modules/dashboard/pages/ProfessorDashboardPage';
import { PartnerDashboardPage } from '../../modules/dashboard/pages/PartnerDashboardPage';
import { InstitutionDashboardPage } from '../../modules/dashboard/pages/InstitutionDashboardPage';
import { AlunoListPage } from '../../modules/aluno/pages/AlunoListPage';
import { AlunoCreatePage } from '../../modules/aluno/pages/AlunoCreatePage';
import { AlunoEditPage } from '../../modules/aluno/pages/AlunoEditPage';
import { InstituicaoCreatePage } from '../../modules/instituicao/pages/InstituicaoCreatePage';
import { InstituicaoEditPage } from '../../modules/instituicao/pages/InstituicaoEditPage';
import { InstituicaoListPage } from '../../modules/instituicao/pages/InstituicaoListPage';
import { ParceiroListPage } from '../../modules/parceiro/pages/ParceiroListPage';
import { ParceiroCreatePage } from '../../modules/parceiro/pages/ParceiroCreatePage';
import { ParceiroEditPage } from '../../modules/parceiro/pages/ParceiroEditPage';
import { ParceiroResgatesPage } from '../../modules/parceiro/pages/ParceiroResgatesPage';
import { ProfessorListPage } from '../../modules/professor/pages/ProfessorListPage';
import { ProfessorCreatePage } from '../../modules/professor/pages/ProfessorCreatePage';
import { ProfessorEditPage } from '../../modules/professor/pages/ProfessorEditPage';
import { PerfilPage } from '../../modules/auth/pages/PerfilPage';
import { EnviarMoedasPage } from '../../modules/moeda/pages/EnviarMoedasPage';
import { ExtratoProfessorPage } from '../../modules/moeda/pages/ExtratoProfessorPage';
import { ExtratoAlunoPage } from '../../modules/moeda/pages/ExtratoAlunoPage';
import { CadastroParceiroPage } from '../../modules/parceiro/pages/CadastroParceiroPage';
import { CadastroInstituicaoPage } from '../../modules/instituicao/pages/CadastroInstituicaoPage';
import { InstituicaoTransacoesPage } from '../../modules/instituicao/pages/InstituicaoTransacoesPage';
import { InstituicaoExtratoAdminPage } from '../../modules/instituicao/pages/InstituicaoExtratoAdminPage';
import { VantagemCatalogPage } from '../../modules/vantagem/pages/VantagemCatalogPage';
import { VantagemManagePage } from '../../modules/vantagem/pages/VantagemManagePage';
import { VantagemCreatePage } from '../../modules/vantagem/pages/VantagemCreatePage';
import { VantagemEditPage } from '../../modules/vantagem/pages/VantagemEditPage';
import type { UserRole } from '../../shared/types/api';

function ProtectedRoute() {
  const user = getStoredUser();
  useEffect(() => { void refreshIfExpiringSoon(); }, []);
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/alterar-senha" replace />;
  return <AppLayout />;
}

function RoleGuard({ blocked, children }: { blocked: UserRole[]; children: React.ReactNode }) {
  const user = getStoredUser();
  if (user && blocked.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function VantagemPage() {
  const user = getStoredUser();
  if (user?.role === 'partner' || user?.role === 'admin') return <VantagemManagePage />;
  return <VantagemCatalogPage />;
}

function HomeDashboard() {
  const user = getStoredUser();
  if (user?.role === 'student') return <StudentDashboardPage />;
  if (user?.role === 'professor') return <ProfessorDashboardPage />;
  if (user?.role === 'partner') return <PartnerDashboardPage />;
  if (user?.role === 'institution') return <InstitutionDashboardPage />;
  return <DashboardPage />;
}

const nonAdmin: UserRole[] = ['student', 'professor', 'partner', 'institution']; // admin not blocked

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/ativar-conta" element={<ActivarContaPage />} />
      <Route path="/cadastro-parceiro" element={<CadastroParceiroPage />} />
      <Route path="/cadastro-instituicao" element={<CadastroInstituicaoPage />} />
      <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<HomeDashboard />} />

        {/* Admin routes — blocked for known roles */}
        <Route path="/instituicoes" element={<RoleGuard blocked={nonAdmin}><InstituicaoListPage /></RoleGuard>} />
        <Route path="/instituicoes/nova" element={<RoleGuard blocked={nonAdmin}><InstituicaoCreatePage /></RoleGuard>} />
        <Route path="/instituicoes/:id/editar" element={<RoleGuard blocked={nonAdmin}><InstituicaoEditPage /></RoleGuard>} />
        <Route path="/instituicoes/:id/extrato" element={<RoleGuard blocked={nonAdmin}><InstituicaoExtratoAdminPage /></RoleGuard>} />
        <Route path="/instituicao/transacoes" element={<RoleGuard blocked={['student', 'partner', 'professor', 'admin']}><InstituicaoTransacoesPage /></RoleGuard>} />
        <Route path="/alunos" element={<RoleGuard blocked={['student', 'partner']}><AlunoListPage /></RoleGuard>} />
        <Route path="/alunos/novo" element={<RoleGuard blocked={nonAdmin}><AlunoCreatePage /></RoleGuard>} />
        <Route path="/alunos/:id/editar" element={<RoleGuard blocked={nonAdmin}><AlunoEditPage /></RoleGuard>} />
        <Route path="/parceiros" element={<RoleGuard blocked={nonAdmin}><ParceiroListPage /></RoleGuard>} />
        <Route path="/parceiros/novo" element={<RoleGuard blocked={nonAdmin}><ParceiroCreatePage /></RoleGuard>} />
        <Route path="/parceiros/:id/editar" element={<RoleGuard blocked={nonAdmin}><ParceiroEditPage /></RoleGuard>} />
        <Route path="/parceiros/:id/resgates" element={<RoleGuard blocked={nonAdmin}><ParceiroResgatesPage /></RoleGuard>} />
        <Route path="/professores" element={<RoleGuard blocked={['student', 'partner']}><ProfessorListPage /></RoleGuard>} />
        <Route path="/professores/novo" element={<RoleGuard blocked={nonAdmin}><ProfessorCreatePage /></RoleGuard>} />
        <Route path="/professores/:id/editar" element={<RoleGuard blocked={nonAdmin}><ProfessorEditPage /></RoleGuard>} />

        {/* Professor routes */}
        <Route path="/moedas" element={<RoleGuard blocked={['student', 'partner', 'admin', 'institution']}><EnviarMoedasPage /></RoleGuard>} />
        <Route path="/moedas/extrato/professor" element={<RoleGuard blocked={['student', 'partner']}><ExtratoProfessorPage /></RoleGuard>} />

        {/* Student routes */}
        <Route path="/moedas/extrato/aluno" element={<RoleGuard blocked={['professor', 'partner']}><ExtratoAlunoPage /></RoleGuard>} />

        {/* Shared */}
        <Route path="/perfil" element={<PerfilPage />} />

        {/* Vantagens — catalog visible to all; manage/create/edit partner only */}
        <Route path="/vantagens" element={<VantagemPage />} />
        <Route path="/vantagens/nova" element={<RoleGuard blocked={['student', 'professor', 'admin']}><VantagemCreatePage /></RoleGuard>} />
        <Route path="/vantagens/:id/editar" element={<RoleGuard blocked={['student', 'professor']}><VantagemEditPage /></RoleGuard>} />
        <Route path="/catalogo" element={<VantagemCatalogPage />} />
      </Route>
    </Routes>
  );
}
