import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { getStoredUser } from '../../modules/auth/services/authService';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/pages/RegisterPage';
import { DashboardPage } from '../../modules/dashboard/pages/DashboardPage';
import { StudentDashboardPage } from '../../modules/dashboard/pages/StudentDashboardPage';
import { AlunoListPage } from '../../modules/aluno/pages/AlunoListPage';
import { AlunoCreatePage } from '../../modules/aluno/pages/AlunoCreatePage';
import { AlunoEditPage } from '../../modules/aluno/pages/AlunoEditPage';
import { InstituicaoCreatePage } from '../../modules/instituicao/pages/InstituicaoCreatePage';
import { InstituicaoEditPage } from '../../modules/instituicao/pages/InstituicaoEditPage';
import { InstituicaoListPage } from '../../modules/instituicao/pages/InstituicaoListPage';
import { ParceiroListPage } from '../../modules/parceiro/pages/ParceiroListPage';
import { ParceiroCreatePage } from '../../modules/parceiro/pages/ParceiroCreatePage';
import { ParceiroEditPage } from '../../modules/parceiro/pages/ParceiroEditPage';
import { ProfessorListPage } from '../../modules/professor/pages/ProfessorListPage';
import { ProfessorCreatePage } from '../../modules/professor/pages/ProfessorCreatePage';
import { ProfessorEditPage } from '../../modules/professor/pages/ProfessorEditPage';
import { EnviarMoedasPage } from '../../modules/moeda/pages/EnviarMoedasPage';
import { ExtratoProfessorPage } from '../../modules/moeda/pages/ExtratoProfessorPage';
import { ExtratoAlunoPage } from '../../modules/moeda/pages/ExtratoAlunoPage';
import { PlaceholderPage } from '../../shared/components/PlaceholderPage';
import type { UserRole } from '../../shared/types/api';

function ProtectedRoute() {
  return getStoredUser() ? <AppLayout /> : <Navigate to="/login" replace />;
}

function RoleGuard({ blocked, children }: { blocked: UserRole[]; children: React.ReactNode }) {
  const user = getStoredUser();
  if (user && blocked.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeDashboard() {
  const user = getStoredUser();
  if (user?.role === 'student') return <StudentDashboardPage />;
  return <DashboardPage />;
}

const studentAndPartner: UserRole[] = ['student', 'professor'];
const nonAdmin: UserRole[] = ['student', 'professor', 'partner'];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<HomeDashboard />} />

        {/* Admin routes — blocked for known roles */}
        <Route path="/instituicoes" element={<RoleGuard blocked={nonAdmin}><InstituicaoListPage /></RoleGuard>} />
        <Route path="/instituicoes/nova" element={<RoleGuard blocked={nonAdmin}><InstituicaoCreatePage /></RoleGuard>} />
        <Route path="/instituicoes/:id/editar" element={<RoleGuard blocked={nonAdmin}><InstituicaoEditPage /></RoleGuard>} />
        <Route path="/alunos" element={<RoleGuard blocked={nonAdmin}><AlunoListPage /></RoleGuard>} />
        <Route path="/alunos/novo" element={<RoleGuard blocked={nonAdmin}><AlunoCreatePage /></RoleGuard>} />
        <Route path="/alunos/:id/editar" element={<RoleGuard blocked={nonAdmin}><AlunoEditPage /></RoleGuard>} />
        <Route path="/parceiros" element={<RoleGuard blocked={nonAdmin}><ParceiroListPage /></RoleGuard>} />
        <Route path="/parceiros/novo" element={<RoleGuard blocked={nonAdmin}><ParceiroCreatePage /></RoleGuard>} />
        <Route path="/parceiros/:id/editar" element={<RoleGuard blocked={nonAdmin}><ParceiroEditPage /></RoleGuard>} />
        <Route path="/professores" element={<RoleGuard blocked={nonAdmin}><ProfessorListPage /></RoleGuard>} />
        <Route path="/professores/novo" element={<RoleGuard blocked={nonAdmin}><ProfessorCreatePage /></RoleGuard>} />
        <Route path="/professores/:id/editar" element={<RoleGuard blocked={nonAdmin}><ProfessorEditPage /></RoleGuard>} />

        {/* Professor routes */}
        <Route path="/moedas" element={<RoleGuard blocked={['student', 'partner']}><EnviarMoedasPage /></RoleGuard>} />
        <Route path="/moedas/extrato/professor" element={<RoleGuard blocked={studentAndPartner}><ExtratoProfessorPage /></RoleGuard>} />

        {/* Student routes */}
        <Route path="/moedas/extrato/aluno" element={<RoleGuard blocked={['professor', 'partner']}><ExtratoAlunoPage /></RoleGuard>} />

        {/* Shared */}
        <Route path="/vantagens" element={<PlaceholderPage title="Vantagens" />} />
      </Route>
    </Routes>
  );
}
