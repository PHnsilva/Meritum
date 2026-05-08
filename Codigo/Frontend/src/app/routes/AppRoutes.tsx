import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { getStoredUser } from '../../modules/auth/services/authService';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { DashboardPage } from '../../modules/dashboard/pages/DashboardPage';
import { AlunoListPage } from '../../modules/aluno/pages/AlunoListPage';
import { AlunoCreatePage } from '../../modules/aluno/pages/AlunoCreatePage';
import { AlunoEditPage } from '../../modules/aluno/pages/AlunoEditPage';
import { InstituicaoCreatePage } from '../../modules/instituicao/pages/InstituicaoCreatePage';
import { InstituicaoEditPage } from '../../modules/instituicao/pages/InstituicaoEditPage';
import { InstituicaoListPage } from '../../modules/instituicao/pages/InstituicaoListPage';
import { ParceiroListPage } from '../../modules/parceiro/pages/ParceiroListPage';
import { ParceiroCreatePage } from '../../modules/parceiro/pages/ParceiroCreatePage';
import { ParceiroEditPage } from '../../modules/parceiro/pages/ParceiroEditPage';
import { PlaceholderPage } from '../../shared/components/PlaceholderPage';

function ProtectedRoute() {
  return getStoredUser() ? <AppLayout /> : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<DashboardPage />} />
        <Route path="/instituicoes" element={<InstituicaoListPage />} />
        <Route path="/instituicoes/nova" element={<InstituicaoCreatePage />} />
        <Route path="/instituicoes/:id/editar" element={<InstituicaoEditPage />} />
        <Route path="/alunos" element={<AlunoListPage />} />
        <Route path="/alunos/novo" element={<AlunoCreatePage />} />
        <Route path="/alunos/:id/editar" element={<AlunoEditPage />} />
        <Route path="/parceiros" element={<ParceiroListPage />} />
        <Route path="/parceiros/novo" element={<ParceiroCreatePage />} />
        <Route path="/parceiros/:id/editar" element={<ParceiroEditPage />} />
        <Route path="/vantagens" element={<PlaceholderPage title="Vantagens" />} />
        <Route path="/moedas" element={<PlaceholderPage title="Moedas" />} />
      </Route>
    </Routes>
  );
}
